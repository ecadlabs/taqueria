import createType from '@taqueria/protocol/Base';
import { z } from 'zod';

export const rawSchema = z.object({
	consent: z.union(
		[z.literal('opt_in'), z.literal('opt_out')],
		{ description: 'Consent' },
	),
}).strict().describe('Setting');

type RawInput = z.infer<typeof rawSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, RawInput>({
	rawSchema,
	parseErrMsg: (value: unknown) => `${value} is not a valid settings type`,
	unknownErrMsg: 'Something went wrong when parsing the settings file',
});

export type Settings = z.infer<typeof generatedSchemas.schema>;
export type t = Settings;

export const { create, of, make } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as Settings),
};
