import * as Alias from '@taqueria/protocol/Alias';
import createType, { Flatten } from '@taqueria/protocol/Base';
import * as Task from '@taqueria/protocol/Task';
import * as VersionNumber from '@taqueria/protocol/VersionNumber';
import { z } from 'zod';

export const internalSchema = z.object({
	name: z.string({ description: 'Plugin Name' }).min(1),
	version: VersionNumber.schemas.schema.describe('Plugin Version #'),
	schema: VersionNumber.schemas.schema.describe('Plugin Schema Version #'),
	alias: Alias.schemas.schema.describe('Plugin Alias'),
	tasks: z.preprocess(
		val => val ?? [],
		z.array(
			Task.schemas.schema.describe('Plugin Task'),
			{ description: 'Plugin Tasks' },
		).optional(),
	),
}).describe('Plugin Schema');

export const rawSchema = z.object({
	name: z.string({ description: 'Plugin Name' }).min(1),
	version: VersionNumber.rawSchema.describe('Plugin Version #'),
	schema: VersionNumber.rawSchema.describe('Plugin Schema Version #'),
	alias: Alias.rawSchema.describe('Plugin Alias'),
	tasks: z.preprocess(
		val => val ?? [],
		z.array(
			Task.rawSchema.describe('Plugin Task'),
			{ description: 'Plugin Tasks' },
		).optional(),
	),
}).describe('Plugin Schema');

type RawInput = z.infer<typeof rawSchema>;
type Input = Flatten<z.infer<typeof internalSchema>>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, Input>({
	rawSchema,
	internalSchema,
	parseErrMsg: 'The schema returned from the plugin is invalid',
	unknownErrMsg: 'Something went wrong parsing the schema from a plugin',
});

export type PluginInfo = Flatten<z.infer<typeof generatedSchemas.schema>>;
export type t = PluginInfo;
export const { create, of, make } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as unknown as PluginInfo),
};
