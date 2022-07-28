import type { i18n } from '@taqueria/protocol/i18n';
import * as InstalledPlugin from '@taqueria/protocol/InstalledPlugin';
import * as LoadedConfig from '@taqueria/protocol/LoadedConfig';
import * as SanitizedAbsPath from '@taqueria/protocol/SanitizedAbsPath';
import * as TaqError from '@taqueria/protocol/TaqError';
import { chain, chainRej, map, mapRej } from 'fluture';
import { pipe } from 'https://deno.land/x/fun@v1.0.0/fns.ts';
import { getConfig } from './taqueria-config.ts';
import * as utils from './taqueria-utils/taqueria-utils.ts';

// Get utils
const { execText, readJsonFile, writeJsonFile } = utils.inject({
	stdout: Deno.stdout,
	stderr: Deno.stderr,
});

// Alias
const exec = execText;

// import {log, debug} from './taqueria-utils/taqueria-utils.ts'

// This file contains logic for handling plugins distributed
// and installable using NPM

export type NpmPluginName = string & { __kind__: 'NpmPluginName' };

interface Manifest {
	name: string;
}

export const getPluginName = (input: string): NpmPluginName => {
	const endIndex = input.lastIndexOf('@');
	const hasVersion = endIndex > 0;
	const retval = hasVersion
		? input.substring(0, endIndex).trim()
		: input.trim();
	return (retval as NpmPluginName);
};

export const requireNPM = (projectDir: SanitizedAbsPath.t, i18n: i18n) =>
	pipe(
		SanitizedAbsPath.make(`${projectDir}/package.json`),
		chain(abspath => readJsonFile<Manifest>(abspath)),
		mapRej(previous => {
			const taqErr: TaqError.t = {
				kind: 'E_NPM_INIT',
				msg: i18n.__('npmInitRequired'),
				context: projectDir,
				previous,
			};
			return taqErr;
		}),
	);

export const getPluginPackageJson = (pluginNameOrPath: string, projectDir: SanitizedAbsPath.t) =>
	pipe(
		/^\//.test(pluginNameOrPath)
			// If starts with a slash, we can assume that its a path
			? SanitizedAbsPath.make(pluginNameOrPath)
			: // Otherwise, we assume that its a relative path
				SanitizedAbsPath.make(`${projectDir}/${pluginNameOrPath}`),
		chain(pluginPath => SanitizedAbsPath.make(`${pluginPath}/package.json`)),
		chain(readJsonFile),
		chainRej(() =>
			// Assumptions failed above. Assume that we're given a package name
			pipe(
				SanitizedAbsPath.make(`${projectDir}/node_modules/${pluginNameOrPath}/package.json`),
				chain(readJsonFile),
			)
		),
		map(value => value as Manifest),
	);

const addToPluginList = (pluginName: NpmPluginName, loadedConfig: LoadedConfig.t) =>
	pipe(
		getPluginPackageJson(pluginName, loadedConfig.projectDir),
		chain((manifest: { name: string }) => {
			const allPlugins = loadedConfig.plugins ?? [];
			const existingPlugins = allPlugins.filter(plugin => plugin.name != manifest.name);

			return InstalledPlugin.make({ name: manifest.name, type: 'npm' })
				.pipe(map(installedPlugin => [...existingPlugins, installedPlugin]));
		}),
		chain(plugins =>
			LoadedConfig.toConfig({
				...loadedConfig,
				plugins,
			})
		),
		chain(writeJsonFile(loadedConfig.configFile)),
	);

export const installPlugin = (projectDir: SanitizedAbsPath.t, i18n: i18n, plugin: string) =>
	pipe(
		requireNPM(projectDir, i18n),
		chain(_ => exec('npm install -D <%= it.plugin %>', { plugin }, false, projectDir)),
		chain(_ => getConfig(projectDir, i18n, false)),
		chain(config => {
			// The plugin name could look like this: @taqueria/plugin-ligo@1.2.3
			// We need to trim @1.2.3 from the end
			const pluginName = getPluginName(plugin);

			// Note, pluginName could be something like @taqueria/plugin-ligo
			// or ../taqueria-plugin-ligo. Thus, we still need to determine
			// what the real package name is
			return addToPluginList(pluginName, config);
		}),
		map(_ => Deno.run({ cmd: ['sh', '-c', 'taq'], cwd: projectDir, stdout: 'piped', stderr: 'piped' })), // temp hack for #528
		map(_ => i18n.__('pluginInstalled')),
	);

export const uninstallPlugin = (projectDir: SanitizedAbsPath.t, i18n: i18n, plugin: string) =>
	pipe(
		requireNPM(projectDir, i18n),
		chain(() => exec('npm uninstall -D <%= it.plugin %>', { plugin }, false, projectDir)),
		chain(() => getConfig(projectDir, i18n, false)),
		chain((config: LoadedConfig.t) => {
			const pluginName = getPluginName(plugin);
			const plugins = config.plugins.filter(plugin => plugin.name != pluginName);

			return pipe(
				LoadedConfig.toConfig({
					...config,
					plugins,
				}),
				chain(writeJsonFile(config.configFile)),
			);
		}),
		map(_ => Deno.run({ cmd: ['sh', '-c', 'taq'], cwd: projectDir, stdout: 'piped', stderr: 'piped' })), // temp hack for #528
		map(() => i18n.__('pluginUninstalled')),
	);
