import * as Environment from '@taqueria/protocol/Environment';
import type { i18n } from '@taqueria/protocol/i18n';
import load from '@taqueria/protocol/i18n';
import * as LoadedConfig from '@taqueria/protocol/LoadedConfig';
import * as NetworkConfig from '@taqueria/protocol/NetworkConfig';
import * as Option from '@taqueria/protocol/Option';
import * as PersistentState from '@taqueria/protocol/PersistentState';
import * as PluginInfo from '@taqueria/protocol/PluginInfo';
import * as PositionalArg from '@taqueria/protocol/PositionalArg';
import * as RequestArgs from '@taqueria/protocol/RequestArgs';
import * as SandboxAccountConfig from '@taqueria/protocol/SandboxAccountConfig';
import * as SandboxConfig from '@taqueria/protocol/SandboxConfig';
import { E_TaqError, toFutureParseErr, toFutureParseUnknownErr } from '@taqueria/protocol/TaqError';
import type { TaqError } from '@taqueria/protocol/TaqError';
import * as Protocol from '@taqueria/protocol/taqueria-protocol-types';
import * as Task from '@taqueria/protocol/Task';
import { exec, ExecException } from 'child_process';
import { FutureInstance as Future, mapRej, promise } from 'fluture';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { get } from 'stack-trace';
import { ZodError } from 'zod';
import { InputSchema, Schema } from './types';
import { Args, LikeAPromise, pluginDefiner, StdIO } from './types';

// @ts-ignore interop issue. Maybe find a different library later
import generateName from 'project-name-generator';

// To use esbuild with yargs, we can't use ESM: https://github.com/yargs/yargs/issues/1929
const yargs = require('yargs');

export const eager = <T>(f: Future<TaqError, T>) =>
	promise(
		mapRej((err: TaqError) => new E_TaqError(err))(f),
	);

export const writeJsonFile = <T>(filename: string) =>
	(data: T): Promise<string> =>
		writeFile(filename, JSON.stringify(data, undefined, 4), { encoding: 'utf8' })
			.then(_ => filename);

export const readJsonFile = <T>(filename: string): Promise<T> =>
	readFile(filename, { encoding: 'utf-8' })
		.then(JSON.parse)
		.then(result => (result as T));

export const execCmd = (cmd: string): LikeAPromise<StdIO, ExecException> =>
	new Promise((resolve, reject) => {
		exec(`sh -c "${cmd}"`, (err, stdout, stderr) => {
			if (err) reject(err);
			else {
				resolve({
					stdout,
					stderr,
				});
			}
		});
	});

export const getArch = (): LikeAPromise<string, TaqError> => {
	switch (process.arch) {
		case 'arm64':
			return Promise.resolve('linux/arm64/v8');
		// @ts-ignore: x32 is valid for some versions of NodeJS
		case 'x32':
		case 'x64':
			return Promise.resolve('linux/amd64');
		default:
			return Promise.reject({
				errCode: 'E_INVALID_ARCH',
				errMsg: `We do not know how to handle the ${process.arch} architecture`,
				context: process.arch,
			});
	}
};

export const parseJSON = <T>(input: string): LikeAPromise<T, TaqError> =>
	new Promise((resolve, reject) => {
		try {
			const json = JSON.parse(input);
			resolve(json);
		} catch (previous) {
			const taqErr: TaqError = {
				kind: 'E_INVALID_JSON',
				msg: `Invalid JSON: ${input}`,
				previous,
				context: input,
			};
			return reject(taqErr);
		}
	});

export const sendRes = (msg: string, newline = true) => {
	if (!msg || msg.length === 0) return;
	return newline
		? console.log(msg)
		: process.stdout.write(msg) as unknown as void;
};

export const sendAsyncRes = (msg: string, newline = true): Promise<void> => Promise.resolve(sendRes(msg, newline));

export const sendErr = (msg: string, newline = true) => {
	if (!msg || msg.length === 0) return;
	return newline
		? console.error(msg)
		: process.stderr.write(msg) as unknown as void;
};

export const sendAsyncErr = (msg: string, newline = true) => Promise.reject(sendErr(msg, newline)); // should this be Promise.reject?

export const sendJson = (msg: unknown, newline = true) => sendRes(JSON.stringify(msg), newline);

export const sendJsonErr = (msg: unknown, newline = true) => sendErr(JSON.stringify(msg), newline);

export const sendAsyncJson = (msg: unknown, newline = true) => sendAsyncRes(JSON.stringify(msg), newline);

export const sendAsyncJsonErr = (msg: unknown, newline = true) => sendAsyncErr(JSON.stringify(msg), newline);

export const sendJsonRes = <T>(data: T) =>
	typeof data === 'object'
		? sendJson({
			data,
			render: 'table',
		})
		: sendJson({
			data,
			render: 'string',
		});

export const sendAsyncJsonRes = <T>(data: T) => Promise.resolve(sendJsonRes(data));

export const noop = () => {};

const parseArgs = (unparsedArgs: Args): LikeAPromise<RequestArgs.t, TaqError> => {
	if (unparsedArgs && Array.isArray(unparsedArgs) && unparsedArgs.length >= 2) {
		try {
			const preprocessedArgs = preprocessArgs(unparsedArgs);
			const argv = yargs(preprocessedArgs.slice(2)).help(false).argv;
			const postprocessedArgs = postprocessArgs(argv);
			const requestArgs = RequestArgs.from(postprocessedArgs);
			return Promise.resolve(requestArgs);
		} catch (previous) {
			if (previous instanceof ZodError) {
				return eager(
					toFutureParseErr<RequestArgs.t>(previous, 'The plugin request arguments are invalid', unparsedArgs),
				);
			}
			return eager(
				toFutureParseUnknownErr<RequestArgs.t>(
					previous,
					'There was a problem trying to parse the plugin request arguments',
					unparsedArgs,
				),
			);
		}
	}
	return Promise.reject('Invalid usage. If you were testing your plugin, did you remember to specify --taqRun?');
};

// A hack to protect all hex from being messed by yargs
const preprocessArgs = (args: Args): Args => {
	return args.map(arg => /^0x[0-9a-fA-F]+$/.test(arg) ? '___' + arg + '___' : arg);
};

// A hack to protect all hex from being messed by yargs
const postprocessArgs = (args: Args): Record<string, unknown> => {
	const postprocessedArgs = Object.entries(args).map((
		[key, val],
	) => [
		key,
		typeof val === 'string' && /^___0x[0-9a-fA-F]+___$/.test(val)
			? val.slice(3, -3)
			: val,
	]);

	const groupedArgs = postprocessedArgs.reduce(
		(acc, arg) => {
			const key = arg[0];
			const val = arg[1];
			return { ...acc, [key]: val };
		},
		{},
	);

	return groupedArgs;
};

const parseSchema = (i18n: i18n, definer: pluginDefiner, inferPluginName: () => string): Schema => {
	const inputSchema: InputSchema = definer(i18n);

	const { proxy } = inputSchema;

	const pluginInfo = PluginInfo.create({
		...inputSchema,
		name: inputSchema.name ?? inferPluginName(),
	});

	return {
		...pluginInfo,
		proxy,
	};
};

const getResponse = (definer: pluginDefiner, inferPluginName: () => string) =>
	async (requestArgs: RequestArgs.t) => {
		const { taqRun } = requestArgs;
		const i18n = await load();
		const schema = parseSchema(i18n, definer, inferPluginName);
		try {
			switch (taqRun) {
				case 'pluginInfo':
					const output = {
						...schema,
						proxy: schema.proxy ? true : false,
						checkRuntimeDependencies: schema.checkRuntimeDependencies ? true : false,
						installRuntimeDependencies: schema.installRuntimeDependencies ? true : false,
					};
					return sendAsyncJson(output);
				case 'proxy':
					if (schema.proxy) {
						const retval = schema.proxy(RequestArgs.createProxyRequestArgs(requestArgs));
						if (retval) return retval;
						return Promise.reject({
							errCode: 'E_PROXY',
							message: "The plugin's proxy method must return a promise.",
							context: retval,
						});
					}
					return Promise.reject({
						errCode: 'E_NOT_SUPPORTED',
						message: i18n.__('proxyNotSupported'),
						context: requestArgs,
					});
				case 'checkRuntimeDependencies':
					return sendAsyncJson(
						schema.checkRuntimeDependencies
							? schema.checkRuntimeDependencies(i18n, requestArgs)
							: Promise.resolve({ report: [] }),
					);
				case 'installRuntimeDependencies':
					return sendAsyncJson(
						schema.installRuntimeDependencies
							? schema.installRuntimeDependencies(i18n, requestArgs)
							: Promise.resolve({ report: [] }),
					);
				default:
					return Promise.reject({
						errCode: 'E_NOT_SUPPORTED',
						message: i18n.__('actionNotSupported'),
						context: requestArgs,
					});
			}
		} catch (previous) {
			return Promise.reject({
				errCode: 'E_UNEXPECTED',
				message: 'The plugin encountered a fatal error',
				previous,
			});
		}
	};

const getNameFromPluginManifest = (packageJsonAbspath: string): string => {
	try {
		return `${require(packageJsonAbspath).name}`;
	} catch (_) {
		return generateName().dashed;
	}
};

/**
 * Gets the name of the current environment
 */
export const getCurrentEnvironment = (parsedArgs: RequestArgs.t): string => {
	return parsedArgs.env
		? (parsedArgs.env as string)
		: (
			parsedArgs.config.environment
				? parsedArgs.config.environment.default as string
				: 'development'
		);
};

/**
 * Gets the configuration for the current environment, if one is configured
 */
export const getCurrentEnvironmentConfig = (parsedArgs: RequestArgs.t) => {
	const currentEnv = getCurrentEnvironment(parsedArgs);

	return parsedArgs.config.environment && parsedArgs.config.environment[currentEnv]
		? parsedArgs.config.environment[currentEnv] as Protocol.Environment.t | undefined
		: undefined;
};

/**
 * Gets the configuration for the named network
 */
export const getNetworkConfig = (parsedArgs: RequestArgs.t) =>
	(networkName: string) =>
		(parsedArgs.config.network![networkName] ?? undefined) as Protocol.NetworkConfig.t | undefined;

/**
 * Gets the configuration for the named sandbox
 */
export const getSandboxConfig = (parsedArgs: RequestArgs.t) =>
	(sandboxName: string): Protocol.SandboxConfig.t | undefined =>
		(parsedArgs.config.sandbox![sandboxName] ?? undefined) as Protocol.SandboxConfig.t | undefined;

/**
 * Gets the name of accounts for the given sandbox
 */
export const getSandboxAccountNames = (parsedArgs: RequestArgs.t) =>
	(sandboxName: string) => {
		const sandbox = getSandboxConfig(parsedArgs)(sandboxName);

		return sandbox
			? Object.keys(sandbox.accounts ?? []).filter(accountName => accountName !== 'default')
			: [];
	};

/**
 * Gets the account config for the named account of the given sandbox
 */
export const getSandboxAccountConfig = (parsedArgs: RequestArgs.t) =>
	(sandboxName: string) =>
		(accountName: string) => {
			const sandbox = getSandboxConfig(parsedArgs)(sandboxName);

			if (sandbox && sandbox.accounts) {
				const accounts = sandbox.accounts as Record<string, Protocol.SandboxAccountConfig.t>;
				return accounts[accountName];
			}
			return undefined;
		};

/**
 * Gets the initial storage for the contract
 */
export const getInitialStorage = (parsedArgs: RequestArgs.t) =>
	(contractFilename: string) => {
		const env = getCurrentEnvironmentConfig(parsedArgs);

		return env
			? env.storage && env.storage[contractFilename]
			: undefined;
	};

/**
 * Gets the default account associated with a sandbox
 */
export const getDefaultAccount = (parsedArgs: RequestArgs.t) =>
	(sandboxName: string) => {
		const sandboxConfig = getSandboxConfig(parsedArgs)(sandboxName);
		if (sandboxConfig) {
			const accounts = sandboxConfig.accounts ?? {};
			const defaultAccount = accounts['default'] as string | undefined;
			if (defaultAccount) {
				return getSandboxAccountConfig(parsedArgs)(sandboxName)(defaultAccount);
			}
		}

		return undefined;
	};

const inferPluginName = (stack: ReturnType<typeof get>): () => string => {
	// The definer function can provide a name for the plugin in its schema, or it
	// can omit it and we infer it from the package.json file.
	// To do so, we need to get the directory for the plugin from the call stack
	const pluginManifest = stack.reduce(
		(retval: null | string, callsite) => {
			const callerFile = callsite.getFileName()?.replace(/^file:\/\//, '');
			return retval || (
					callerFile.includes('taqueria-sdk')
					|| callerFile.includes('taqueria-node-sdk')
					|| callerFile.includes('@taqueria/node-sdk')
				)
				? retval
				: join(dirname(callerFile), 'package.json');
		},
		null,
	);

	return () =>
		!pluginManifest
			? generateName().dashed
			: getNameFromPluginManifest(pluginManifest);
};

export const Plugin = {
	create: (definer: pluginDefiner, unparsedArgs: Args) => {
		const stack = get();
		return parseArgs(unparsedArgs)
			.then(getResponse(definer, inferPluginName(stack)))
			.catch((err: unknown) => {
				if (err) console.error(err);
				process.exit(1);
			});
	},
};

export {
	Environment,
	LoadedConfig,
	NetworkConfig,
	Option,
	PersistentState,
	PositionalArg,
	Protocol,
	SandboxAccountConfig,
	SandboxConfig,
	Task,
};
