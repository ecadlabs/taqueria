import createType from '@taqueria/protocol/Base';
import * as Command from '@taqueria/protocol/Command';
import * as Config from '@taqueria/protocol/Config';
import type { i18n } from '@taqueria/protocol/i18n';
import * as InstalledPlugin from '@taqueria/protocol/InstalledPlugin';
import * as Option from '@taqueria/protocol/Option';
import * as ParsedPluginInfo from '@taqueria/protocol/ParsedPluginInfo';
import { E_TaqError, TaqError } from '@taqueria/protocol/TaqError';
import * as Task from '@taqueria/protocol/Task';
import * as Verb from '@taqueria/protocol/Verb';
import { attemptP, FutureInstance as Future, mapRej, promise } from 'fluture';
import { z } from 'zod';

const eager = <T>(f: Future<TaqError, T>) =>
	promise(
		mapRej((err: TaqError) => new E_TaqError(err))(f),
	);

const taskToPluginMap = z.record(
	z.union([
		InstalledPlugin.schemas.schema,
		Task.schemas.schema,
	], { description: 'Task/Plugin Mapping' }),
);

const rawSchema = z.object({
	build: z.string({ description: 'cache.build' }),
	configHash: z.string({ description: 'cache.configHash' }),
	tasks: taskToPluginMap,
	plugins: z.array(ParsedPluginInfo.schemas.schema, { description: 'cache.plugins' }),
}).describe('Ephemeral State');

type RawInput = z.infer<typeof rawSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, RawInput>({
	rawSchema,
	parseErrMsg: (value: unknown) => `${value} is not a valid representation of ephemeral state`,
	unknownErrMsg: 'Something went wrong when parsing the ephemeral state',
});

export type EphemeralState = z.infer<typeof generatedSchemas.schema>;
export type t = EphemeralState;
export type TaskToPluginMap = z.infer<typeof taskToPluginMap>;

export const { create, of, make } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as EphemeralState),
};

/**
 * Private functions
 */
type Counts = Record<Verb.t, ParsedPluginInfo.t[]>;
const getTaskCounts = (pluginInfo: ParsedPluginInfo.t[]): Counts => {
	return pluginInfo.reduce(
		(retval, pluginInfo) =>
			pluginInfo.tasks === undefined
				? {}
				: pluginInfo.tasks.reduce(
					(retval: Counts, task: Task.t) => {
						const taskName = task.task;
						const providers: ParsedPluginInfo.t[] = retval[taskName]
							? [...retval[taskName], pluginInfo]
							: [pluginInfo];
						const mapping: Counts = {};
						mapping[taskName] = providers.filter(provider => provider !== undefined);
						return { ...retval, ...mapping };
					},
					retval,
				),
		{} as Counts,
	);
};

const toChoices = (plugins: ParsedPluginInfo.t[]) =>
	plugins.reduce(
		(retval, pluginInfo) => {
			return [...retval, pluginInfo.name as string, pluginInfo.alias as string];
		},
		[] as string[],
	);

const isComposite = (name: Verb.t, counts: Counts) => counts[name].length > 1;

const getInstalledPlugin = (config: Config.t, name: string) =>
	config.plugins?.find(
		(plugin: InstalledPlugin.t) => [`taqueria-plugin-${name}`, name].includes(plugin.name),
	);

export const mapTasksToPlugins = (config: Config.t, pluginInfo: ParsedPluginInfo.t[], i18n: i18n) => {
	const taskCounts = getTaskCounts(pluginInfo);
	return attemptP<TaqError, TaskToPluginMap>(async () =>
		await pluginInfo.reduce(
			async (retval, pluginInfo) =>
				!pluginInfo.tasks
					? Promise.resolve({} as TaskToPluginMap)
					: await pluginInfo.tasks.reduce(
						async (retval, { task }) => {
							if (isComposite(task, taskCounts)) {
								const command = await eager(Command.make(task));
								const compositeTask = await eager(Task.make({
									task,
									command,
									description: i18n.__('providedByMany'),
									hidden: false,
									options: [
										await eager(Option.make({
											flag: await eager(Verb.make('plugin')),
											description: 'Specify which plugin should be used to execute this task',
											choices: toChoices(taskCounts[task]),
											required: true,
											type: 'string',
										})),
									],
									handler: 'proxy',
								}));
								return { ...await retval, [task]: compositeTask };
							}

							// Task is provided by just a single plugin
							const installedPlugin = getInstalledPlugin(config, pluginInfo.name);
							return installedPlugin
								? { ...await retval, [task]: installedPlugin }
								: retval;
						},
						retval,
					),
			Promise.resolve({} as TaskToPluginMap),
		)
	).pipe(mapRej(rej => rej as TaqError));
};

export const getTasks = (pluginInfo: ParsedPluginInfo.t[]) =>
	pluginInfo.reduce(
		(retval: Task.t[], pluginInfo) => [...retval, ...(pluginInfo.tasks ?? [])],
		[],
	);
