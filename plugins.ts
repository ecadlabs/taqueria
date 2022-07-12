// First-party dependencies
import * as SanitizedAbsPath from '@taqueria/protocol/SanitizedAbsPath';
import * as TaqError from '@taqueria/protocol/TaqError';
import type { InstalledPlugin, PluginAction, PluginResponse } from './taqueria-protocol/taqueria-protocol-types.ts';
import { EphemeralState, ParsedPluginInfo, SanitizedArgs } from './taqueria-protocol/taqueria-protocol-types.ts';
import type { PluginDeps, PluginRequestArgs } from './taqueria-types.ts';
import { LoadedConfig } from './taqueria-types.ts';
import * as utils from './taqueria-utils/taqueria-utils.ts';

// Third-party dependencies
import { attemptP, chain, chainRej, FutureInstance as Future, map, mapRej, parallel, reject, resolve } from 'fluture';
import { copy } from 'https://deno.land/std@0.128.0/streams/conversion.ts';
import { pipe } from 'https://deno.land/x/fun@v1.0.0/fns.ts';
import clipboard from 'https://raw.githubusercontent.com/mweichert/clipboard/master/mod.ts';

// Get utils
const { joinPaths, readJsonFile, writeTextFile, decodeJson, eager } = utils.inject({
	stdout: Deno.stdout,
	stderr: Deno.stderr,
});

// No-operation
// noop: () -> void
const noop = () => {};

// Provides a library of functions with dependencies injected
export const inject = (deps: PluginDeps) => {
	// Extract injected dependencies for easy reference
	const { i18n, env, config, parsedArgs, stdout, stderr } = deps;

	// Logs a request to a plugin to stdout if logPluginRequests has been
	// set to true for parsedArgs
	// logPluginRequest
	const logPluginRequest = (plugin: InstalledPlugin.t) =>
		(cmd: (string | number | boolean)[]): Future<TaqError.t, void> =>
			attemptP(async () => {
				if (parsedArgs.logPluginRequests) {
					const encoder = new TextEncoder();
					let output = pluginRequestToString(plugin)(cmd);
					await stdout.write(encoder.encode(`*** START Call to ${plugin.name} ***\n`));
					await stdout.write(encoder.encode(`${output}\n`));
					await stdout.write(encoder.encode(`*** END of call to ${plugin.name} ***\n`));
					// TODO: this logic will be refactored to achieve better SoC.
					// Issue that captures this: https://github.com/ecadlabs/taqueria/issues/732
					if (parsedArgs.debug) {
						if (/^node /.test(output)) output = output.replace(/^node /, 'node --inspect-brk ');
					}
					await clipboard.writeText(output.replace('\\\n', ''));
				}
				return await Promise.resolve();
			});

	const pluginRequestToString = (_plugin: InstalledPlugin.t) =>
		(cmd: (string | number | boolean)[]) => {
			const lines = [...cmd];
			const lastLine = lines.pop();
			const output = lines.map(line => `${line} \\`).join('\n');
			return `${output}\n${lastLine}`;
		};

	// Invokes a command which will
	const execPluginText = (cmd: string[]): Future<TaqError.t, string> =>
		attemptP(
			async () => {
				let status = undefined;
				try {
					const process = Deno.run({ cmd, stdout: 'piped', stderr: 'piped' });
					status = await process.status();
					const output = await process.output();
					await copy(process.stderr, stderr);
					const decoder = new TextDecoder();
					process.stderr.close();
					await process.status();
					process.close();
					const retval = await decoder.decode(output);
					return retval;
				} catch (previous) {
					throw {
						kind: 'E_EXEC',
						msg: 'Could not execute command',
						context: status !== undefined
							? `Exit code: ${status}, Command: ${cmd}`
							: cmd,
						previous,
					};
				}
			},
		);

	// Invokes a command which will print to stdout and stderr
	// execPluginPassthru: string[] -> Future<TaqError, Deno.Process>
	const execPluginPassthru = (cmd: string[]): Future<TaqError.t, Deno.Process> =>
		attemptP(
			async () => {
				try {
					const process = Deno.run({ cmd, stdout: 'piped', stderr: 'piped' });
					await Promise.all([copy(process.stderr, stderr), copy(process.stdout, stdout)]);
					process.stderr.close();
					process.stdout.close();
					await process.status();
					process.close();
					return process;
				} catch (previous) {
					throw {
						kind: 'E_EXEC',
						msg: 'Could not execute command',
						context: cmd,
						previous,
					};
				}
			},
		);

	// Invokes a command which is expected to return JSON on stdout
	// execPluginJson: string[] -> Future<TaqError, PluginResponse>
	const execPluginJson = (cmd: string[]): Future<TaqError.t, PluginResponse> =>
		pipe(
			execPluginText(cmd),
			chain<TaqError.t, string, PluginResponse>(decodeJson),
		);

	// Gets the command line arguments to invoke the plugin.
	// The return value is a list of string that could be
	// invoked using Deno.run
	// getPluginExec: InstalledPlugin -> string[]
	const getPluginExe = (plugin: InstalledPlugin.t) => {
		switch (plugin.type) {
			case 'npm': {
				const pluginPath = joinPaths(
					parsedArgs.projectDir,
					'node_modules',
					plugin.name,
					'index.js',
				);
				return ['node', pluginPath];
			}
			default:
				return ['echo'];
		}
	};

	// Sends a request to a plugin for a particular action
	// sendPluginActionRequest: InstalledPlugin -> PluginAction -> Record<string, unknown> -> Future<TaqError, PluginResponse>
	const sendPluginActionRequest = (plugin: InstalledPlugin.t) =>
		(action: PluginAction) =>
			(requestArgs: Record<string, unknown>): Future<TaqError.t, PluginResponse> => {
				const cmd = [
					...getPluginExe(plugin),
					'--taqRun',
					typeof action === 'string' ? action : 'proxy',
					'--i18n',
					"'" + JSON.stringify(i18n) + "'",
					'--config',
					"'" + JSON.stringify(config) + "'",
					'--envVars',
					"'" + JSON.stringify(env) + "'",
					...toPluginArguments(requestArgs),
				];

				const shellCmd = ['sh', '-c', cmd.join(' ')];

				return pipe(
					// TODO: Clear side-effect here. Can we handle this better?
					logPluginRequest(plugin)(cmd),
					// All actions other than "proxy" return JSON output
					// Proxy output can either be configured to passthru or
					// encoded as JSON
					chain(_ =>
						typeof (action) === 'string' || action.encoding !== 'none'
							? execPluginJson(shellCmd)
							: map(noop)(execPluginPassthru(shellCmd))
					),
				);
			};

	// Sends getPluginInfo action to an installed plugin to get the plugin info
	// retrievePluginInfo: InstalledPlugin -> Future<TaqError, PluginInfo>
	const retrievePluginInfo = (plugin: InstalledPlugin.t) =>
		pipe(
			sendPluginActionRequest(plugin)('pluginInfo')({}),
			chain(unvalidatedData =>
				pipe(
					ParsedPluginInfo.of(unvalidatedData),
					mapRej(previous =>
						TaqError.create({
							kind: 'E_INVALID_PLUGIN_RESPONSE',
							msg:
								`The ${plugin.name} plugin experienced an error when getting information about the ${plugin.name} plugin.`,
							context: unvalidatedData,
							previous,
						})
					),
				)
			),
		);

	// Calls getPluginInfo() for each installed plugin in parallel
	// retrievePluginInfo: () -> Future<TaqError, PluginInfo[]>
	const retrieveAllPluginInfo = () =>
		pipe(
			config.plugins || [],
			plugins => plugins.map((plugin: InstalledPlugin.t) => retrievePluginInfo(plugin)),
			parallel(parsedArgs.maxConcurrency),
		);

	// Plugins accept positional arguments when invoked
	// This function returns a list of positional arguments
	// which includes all dependencies and the individual request args
	// toPluginArguments: Record<string, unknown> -> PluginRequestArgs
	const toPluginArguments = (requestArgs: Record<string, unknown>): PluginRequestArgs => {
		// For each argument passed in via the CLI, send it as an argument to the
		// plugin call as well. Plugins can use this information for additional context
		// about invocation
		return Object.entries({ ...parsedArgs, ...requestArgs }).reduce(
			(retval: (string | number | boolean)[], [key, val]) => {
				const omit = [
					'$0',
					'quickstart',
					'version',
					'build',
					'scaffoldUrl',
					'scaffoldProjectDir',
					'disableState',
					'_',
				];

				// A hack to get around yargs because it strips leading and trailing double quotes of strings passed by the command. This same hack is used to prevent yargs from turning 0x00 into 0
				// Refer to https://github.com/yargs/yargs-parser/issues/201
				if (typeof val === 'string' && /^___(.|\n)*___$/.test(val)) val = val.slice(3, -3);

				// Some parameters we don't need to send, so we omit those
				if (omit.includes(key) || key.indexOf('-') >= 0 || val === undefined) return retval;
				// Pass numbers and bools as is
				else if (typeof val === 'boolean' || typeof val === 'number') return [...retval, '--' + key, val];
				else return [...retval, '--' + key, `'${val}'`];
			},
			[],
		);
	};

	// Using all plugin info, compute an in-memory representation that we'll
	// refer to as ephemeral state
	// getComputedState: () -> Future<TaqError, State>
	const getComputedState = () =>
		pipe(
			retrieveAllPluginInfo(),
			chain((pluginInfo: ParsedPluginInfo.t[]) =>
				attemptP<TaqError.t, EphemeralState.t>(async () => {
					return await eager(EphemeralState.make({
						build: parsedArgs.setBuild,
						configHash: config.hash,
						plugins: pluginInfo,
						tasks: await eager(EphemeralState.mapTasksToPlugins(
							await eager(LoadedConfig.toConfig(config)),
							pluginInfo,
							i18n,
						)),
					}));
				})
			),
		);

	// Writes the State representation to state.json file
	// writeState: SanitizedAbsPath -> State -> Future<TaqError, State>
	const writeState = (stateAbspath: SanitizedAbsPath.t) =>
		(state: EphemeralState.t): Future<TaqError.t, EphemeralState.t> =>
			pipe(
				JSON.stringify(state, undefined, 4),
				(data: string) => `// WARNING: This file is autogenerated and should NOT be modified\n${data}`,
				writeTextFile(stateAbspath),
				map(() => state),
			);

	// Computes the state and generates a state.json file
	// computeState: PostExtendDeps -> SanitizedAbsPath -> Future<TaqError, State>
	const computeState = (stateAbspath: SanitizedAbsPath.t) => {
		return pipe(
			getComputedState(),
			chain((state: EphemeralState.t) => writeState(stateAbspath)(state)),
		);
	};

	// Returns the absolute path to the state.json file
	// getStateAbsPath: () -> SanitizedAbsPath
	const getStateAbspath = () => SanitizedAbsPath.make(`${parsedArgs.projectDir}/.taq/state.json`);

	// Gets the State representation of the current config
	// The state is retrieved from state.json if it exists,
	// otherwise a representation is generated and then
	// persisted to state.json before its returned
	// getNonMemoizedState: () -> Future<TaqError, State>
	const getNonMemoizedState = () =>
		pipe(
			parsedArgs,
			getStateAbspath,
			chain(stateAbspath =>
				pipe(
					!parsedArgs.disableState
						? resolve(stateAbspath)
						: reject('State disabled!'),
					chain((value: string) => readJsonFile<EphemeralState.t>(value)),
					chain(data =>
						data.build === deps.parsedArgs.setBuild
							? resolve(data)
							: reject('state.json was generated with a different build of taqueria')
					),
					chainRej(_ => computeState(stateAbspath)),
					chain((state: EphemeralState.t) =>
						config.hash === state.configHash
							? resolve(state)
							: computeState(stateAbspath)
					),
				)
			),
		);

	// Gets the State representation of the current config.
	// Uses the getNonMemoizedState() internally, but memoizes the result
	// for performance, as subsequent calls will use in-memory caches.
	// getMemoizedState: () -> Future<TaqError, State>
	const getMemoizedState = (() => {
		const mem: Record<string, EphemeralState.t> = {};

		const toMemHash = (hash: string, parsedArgs: SanitizedArgs.t) => JSON.stringify({ hash, parsedArgs });

		return () => {
			const hash = toMemHash(deps.config.hash, deps.parsedArgs);
			return mem[hash] === undefined
				? map((state: EphemeralState.t) => {
					mem[hash] = state;
					return state;
				})(getNonMemoizedState())
				: resolve(mem[hash]);
		};
	})();

	return {
		getState: getMemoizedState,
		sendPluginActionRequest,
		__TEST__: {
			toPluginArguments,
			execPluginText,
			execPluginPassthru,
			execPluginJson,
			getPluginExe,
			logPluginRequest,
		},
	};
};

export default inject;
