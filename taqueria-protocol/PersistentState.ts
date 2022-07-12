import createType from '@taqueria/protocol/Base';
import * as SHA256 from '@taqueria/protocol/SHA256';
import * as Timestamp from '@taqueria/protocol/Timestamp';
import * as Verb from '@taqueria/protocol/Verb';
import { z } from 'zod';

const rawTaskSchema = z.object({
	time: Timestamp.rawSchema.describe('state.task.time'),
	output: z.unknown().describe('state.task.output'),
});

const internalTaskSchema = z.object({
	task: Verb.schemas.schema,
	plugin: z.string().min(1),
	time: Timestamp.schemas.schema.describe('state.task.time'),
	output: z.unknown().describe('state.op.output'),
});

export type PersistedTask = z.infer<typeof internalTaskSchema>;

export const rawSchema = z.object({
	tasks: z.record(rawTaskSchema),
});

export const internalSchema = z.object({
	tasks: z.record(internalTaskSchema),
}).transform(val => ({
	tasks: val.tasks as unknown as Record<string, PersistedTask>,
}));

type RawInput = z.infer<typeof rawSchema>;

type Input = z.infer<typeof internalSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, Input>({
	rawSchema,
	parseErrMsg: `The persistent state is invalid`,
	unknownErrMsg: `Something went wrong trying to parse the persistent state`,
});

export type PersistentState = z.infer<typeof generatedSchemas.schema>;
export type t = PersistentState;
export type State = PersistentState;

export const { create, of, make } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as unknown as PersistentState),
};
