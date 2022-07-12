import * as Alias from '@taqueria/protocol/Alias';
import * as EphemeralState from '@taqueria/protocol/EphemeralState';
import * as InstalledPlugin from '@taqueria/protocol/InstalledPlugin';
import * as LoadedConfig from '@taqueria/protocol/LoadedConfig';
import * as PersistentState from '@taqueria/protocol/PersistentState';
import * as SanitizedAbsPath from '@taqueria/protocol/SanitizedAbsPath';
import * as SanitizedArgs from '@taqueria/protocol/SanitizedArgs';
import * as TaqError from '@taqueria/protocol/TaqError';
import { attemptP, chain, chainRej, Future, map, mapRej, reject, resolve } from 'fluture';
import batchingToposort from 'https://cdn.skypack.dev/batching-toposort';
import generate from 'https://cdn.skypack.dev/retronid';
import { pipe } from 'https://deno.land/x/fun@v1.0.0/fns.ts';
import { times } from 'rambda';
import { inject } from './taqueria-utils/taqueria-utils.ts';

const { doesPathExist, writeJsonFile, joinPaths, eager, isTaqError, renderTemplate, execText, readTextFile } = inject({
	stderr: Deno.stderr,
	stdout: Deno.stdout,
});

const getDynamicImportUrl = (file: string) => {
	const bytes = Deno.readFileSync(file);
	const decoded = new TextDecoder().decode(bytes);
	const import_map: [RegExp, string][] = [
		[/import(.*)from\s+\"\@taqueria\/provisioner\"/, '__provisioner'],
	];
	const contents = btoa(import_map.reduce(
		(retval, [search, replace]) => {
			const match = retval.match(search);
			return match ? retval.replace(search, `const ${match[1]} = ${replace}`) : retval;
		},
		decoded,
	));
	return `data:text/javascript;base64,${contents}`;
};

const getTaskParams = (state: EphemeralState.t) =>
	(taskName: string, pluginName: string) => {
		const op = state.plugins
			.find(plugin => plugin.alias === pluginName)
			?.tasks
			?.find(op => op.task === taskName);

		if (op) {
			const options = op.options ?? [];
			const args = op.positionals ?? [];
			const optionNames = options.reduce(
				(retval, option) =>
					option.shortFlag
						? [...retval, option.shortFlag, option.flag]
						: [...retval, option.flag],
				[] as string[],
			);
			return args.reduce(
				(retval, arg) => [...retval, arg.placeholder],
				optionNames,
			);
		}
		throw `Could not collect arguments for the task, ${taskName}`;
	};

/**
 * Gets the plugin associated with the request
 * @param parsedArgs
 * @returns {Alias.t}
 */
const getPluginAlias = (parsedArgs: SanitizedArgs.ProvisionTaskArgs, state: EphemeralState.t) => {
	if (parsedArgs.plugin) return parsedArgs.plugin;
	const taskName = parsedArgs.task;
	const task = state.tasks[taskName] as InstalledPlugin.t;
	const plugin = state.plugins.find(plugin => plugin.name == task.name);
	return plugin!.alias;
};

const getNumberOfProvisions = (sourceFile: string) => {
	const matches = sourceFile.match('export ');
	return matches ? matches.slice(1).length : 0;
};

const getNewProvisionName = (sourceFile: string) => (getNumberOfProvisions(sourceFile) + 1) * 10;

export const newProvision = (
	parsedArgs: SanitizedArgs.ProvisionTaskArgs,
	config: LoadedConfig.t,
	state: EphemeralState.t,
) => {
};

export const addNewProvision = (
	parsedArgs: SanitizedArgs.ProvisionTaskArgs,
	config: LoadedConfig.t,
	state: EphemeralState.t,
) =>
	pipe(
		joinPaths(config.projectDir, '.taq', 'provisioner.ts'),
		SanitizedAbsPath.make,
		chain(readTextFile),
		map(sourceFile => {
			// TODO
			return sourceFile;
		}),
		mapRej(previous =>
			TaqError.create({
				kind: 'E_PROVISION',
				msg: 'Could not provision. Please check the task name and try again',
				previous,
			})
		),
	);

// export const toDAGInput = (data: Provisions.t) =>
// 	data.reduce(
// 		(retval, provisioner) => {
// 			const deps = provisioner.depends_on?.reduce(
// 				(retval, parentId) => {
// 					if (retval[parentId]) {
// 						retval[parentId] = [
// 							...retval[parentId],
// 							provisioner.id,
// 						];
// 						return retval;
// 					}
// 					retval[parentId] = [provisioner.id];
// 					return retval;
// 				},
// 				retval,
// 			) ?? retval;
// 			deps[provisioner.id] = deps[provisioner.id] ?? [];
// 			return deps;
// 		},
// 		{} as Record<ProvisionerID.t, ProvisionerID.t[]>,
// 	);

// export const toDAG = (data: Provisions.t) =>
// 	batchingToposort(toDAGInput(data)).reduce(
// 		(retval, batch) => [
// 			...retval,
// 			batch.reduce(
// 				(retval, id) => {
// 					const provision = data.find(provision => String(provision.id) === id);
// 					return provision ? [...retval, provision] : retval;
// 				},
// 				[] as Provisioner.t[],
// 			),
// 		],
// 		[] as (Provisioner.t[])[],
// 	);

export const outputTab = (tabs: number) => new Array(tabs).fill('  ').join('');

// export const provisionerToMermaid = (parent: ProvisionID.t | string, tabs: number) =>
// 	(provisioner: Provision.t) => `${outputTab(tabs)}${provisioner.id}`;

// const mermaidConfig = {
// 	content: 'stateDiagram-v2\n',
// 	tabs: 1,
// 	parent: 'Start',
// };

// const toMermaidSubgraph = (batchName: string, batchDescription: string) =>
// 	({ content, tabs, parent }: typeof mermaidConfig, batch: unknown[]) => {
// 		const ops = batch.map(provisionerToMermaid(parent, tabs + 1)).join('\n');

// 		return {
// 			content: [
// 				content,
// 				`${outputTab(tabs)}${batchName} : ${batchDescription}`,
// 				`${outputTab(tabs)}${parent} --> ${batchName}`,
// 				`${outputTab(tabs)}state ${batchName} {`,
// 				ops,
// 				`${outputTab(tabs)}}`,
// 			].join('\n'),
// 			parent: batchName,
// 			tabs: 1,
// 		};
// 	};

// const toMermaid = (data: (unknown[])[]) =>
// 	data.reduce(
// 		({ content, parent }, batch, i) =>
// 			batch.length > 1
// 				? toMermaidSubgraph(`Batch${i + 1}`, `Parallel Operation Group #${i + 1}`)({ content, tabs: 1, parent }, batch)
// 				: ({
// 					content: `${content}${provisionerToMermaid(parent, 1)(batch[0])}`,
// 					parent: String(batch[0].id),
// 					tabs: 1,
// 				}),
// 		mermaidConfig,
// 	);

export const plan = (data: unknown) => {
	// const batches = toDAG(data);
	// return toMermaid(batches).content;
};

export const apply = (sanitizedArgs: SanitizedArgs.t, data: unknown) => {
};
