import createType from '@taqueria/protocol/Base';
import * as PluginInfo from '@taqueria/protocol/PluginInfo';
import { z } from 'zod';

const internalSchema = PluginInfo.internalSchema.extend({}).describe('ParsedPluginInfo');

export const rawSchema = PluginInfo.internalSchema.extend({}).describe('ParsedPluginInfo');

type Input = z.infer<typeof internalSchema>;

type RawInput = z.infer<typeof rawSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, Input>({
	rawSchema,
	internalSchema,
	parseErrMsg: (value: unknown) =>
		`The following plugin info gave us trouble when parsing the following plugin information: ${value}`,
	unknownErrMsg: 'Something went wrong trying to parse the plugin information',
});

export type ParsedPluginInfo = z.infer<typeof generatedSchemas.schema>;
export type t = ParsedPluginInfo;
export const { create, of, make } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as ParsedPluginInfo),
};
