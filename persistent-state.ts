import * as EphemeralState from '@taqueria/protocol/EphemeralState';
import * as LoadedConfig from '@taqueria/protocol/LoadedConfig';
import * as PersistentState from '@taqueria/protocol/PersistentState';
import * as SanitizedArgs from '@taqueria/protocol/SanitizedArgs';
import * as TaqError from '@taqueria/protocol/TaqError';
import * as Timestamp from '@taqueria/protocol/Timestamp';
import * as Verb from '@taqueria/protocol/Verb';
import { chain, chainRej, map, reject, resolve } from 'fluture';
import { pipe } from 'https://deno.land/x/fun@v1.0.0/fns.ts';
import * as utils from './taqueria-utils/taqueria-utils.ts';

// Get utils
const {
	joinPaths,
	readJsonFile,
	writeTextFile,
	memoize,
	doesPathExist,
	isTaqError,
} = utils.inject({
	stdout: Deno.stdout,
	stderr: Deno.stderr,
});

const toTaskId = (task: Verb.t, plugin: string) => `${plugin}.${task}.${Timestamp.now()}`;

export const getStateRegistryAbspath = (parsedArgs: SanitizedArgs.t) =>
	joinPaths(
		parsedArgs.projectDir,
		'.taq',
		`${parsedArgs.env}-state.json`,
	);

export const load = memoize((parsedArgs: SanitizedArgs.t) =>
	pipe(
		readJsonFile<PersistentState.t>(getStateRegistryAbspath(parsedArgs)),
		chainRej(previous =>
			previous.kind === 'E_READFILE'
				? resolve({ tasks: {} })
				: reject(previous)
		),
		chain(PersistentState.of),
	)
);

export const save = (parsedArgs: SanitizedArgs.t) =>
	(updatedState: PersistentState.t) =>
		pipe(
			JSON.stringify(updatedState, undefined, 4),
			writeTextFile(getStateRegistryAbspath(parsedArgs)),
			map(_ => updatedState),
		);

export const addTask = (parsedArgs: SanitizedArgs.t, task: Verb.t, plugin: string) =>
	(output: { data: unknown } | unknown) =>
		pipe(
			load(parsedArgs),
			chain(state => {
				if (!output) {
					reject(TaqError.create({
						kind: 'E_PROVISION',
						msg: 'This task does not produce any output to persist',
						context: [task, plugin],
					}));
				}
				const id = toTaskId(task, plugin);
				const taskEntry: Record<string, PersistentState.PersistedTask> = {};
				taskEntry[id] = {
					plugin,
					task,
					output: typeof output === 'object' ? Object(output).data : null,
					time: Timestamp.now(),
				};
				const updatedState: PersistentState.t = {
					...state,
					tasks: {
						...state.tasks,
						...taskEntry,
					},
				};

				return PersistentState.make(updatedState);
			}),
			chain(save(parsedArgs)),
			chainRej(previous =>
				isTaqError(previous) && previous.kind === 'E_PROVISION'
					? load(parsedArgs)
					: reject(previous)
			),
			map(_ => output),
		);

export const createStateRegistry = (parsedArgs: SanitizedArgs.t) =>
	(state: EphemeralState.t) =>
		pipe(
			getStateRegistryAbspath(parsedArgs),
			doesPathExist,
			chainRej((_: TaqError.t) => writeTextFile(getStateRegistryAbspath(parsedArgs))('{}')),
			map((_: string) => state),
		);
