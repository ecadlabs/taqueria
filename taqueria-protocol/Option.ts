import createType, { Flatten } from '@taqueria/protocol/Base';
import * as SingleChar from '@taqueria/protocol/SingleChar';
import * as Verb from '@taqueria/protocol/Verb';
import { z } from 'zod';

export const internalSchema = z.object({
	shortFlag: SingleChar.schemas.schema.describe('Option Short Flag').optional(),
	flag: Verb.schemas.schema.describe('Option Long Flag'),
	description: z.string({ description: 'Option Description' }).min(1),
	defaultValue: z.union(
		[z.string(), z.number(), z.boolean()],
		{ description: 'Option Default Value' },
	).optional(),
	choices: z.array(
		z.string({ description: 'Option Choice' }),
		{ description: 'Option Choices' },
	).optional(),
	required: z.boolean({ description: 'Option Is Required' }).default(false).optional(),
	type: z.union(
		[z.literal('string'), z.literal('number'), z.literal('boolean')],
		{ description: 'Positional Arg Datatype' },
	),
}).describe('Option');

export const rawSchema = z.object({
	shortFlag: SingleChar.rawSchema.describe('Option Short Flag').optional(),
	flag: Verb.rawSchema.describe('Option Long Flag'),
	description: z.string({ description: 'Option Description' }).min(1),
	defaultValue: z.union(
		[z.string(), z.number(), z.boolean()],
		{ description: 'Option Default Value' },
	).optional(),
	choices: z.array(
		z.string({ description: 'Option Choice' }),
		{ description: 'Option Choices' },
	).optional(),
	required: z.boolean({ description: 'Option Is Required' }).default(false).optional(),
	type: z.union(
		[z.literal('string'), z.literal('number'), z.literal('boolean')],
		{ description: 'Positional Arg Datatype' },
	),
}).describe('Option');

type RawInput = z.infer<typeof rawSchema>;
type Input = z.infer<typeof internalSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, Input>({
	rawSchema,
	internalSchema,
	parseErrMsg: (value: unknown) => `The following option is invalid: ${value}`,
	unknownErrMsg: 'Something went wrong trying to parse the option',
});

export type Option = Flatten<z.infer<typeof generatedSchemas.schema>>;
export type t = Option;

export const { make, create, of } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as Option),
};
