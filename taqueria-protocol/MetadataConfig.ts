import createType from '@taqueria/protocol/Base';
import { z } from 'zod';

export const rawSchema = z.object({
	name: z.string({ description: 'Project Name' }).optional(),
	projectDescription: z.string({ description: 'Project Description' }).optional(),
	authors: z.array(z.string({ description: 'Project Author' })).default([]).describe('Project Authors').optional(),
	license: z.string({ description: 'Project License' }).optional(),
	homepage: z.string({ description: 'Project Web Url' }).optional(),
});

const internalSchema = z.object({
	name: z.string({ description: 'Project Name' }).optional(),
	projectDescription: z.string({ description: 'Project Description' }).optional(),
	authors: z.array(z.string({ description: 'Project Author' })).default([]).describe('Project Authors').optional(),
	license: z.string({ description: 'Project License' }).optional(),
	homepage: z.string({ description: 'Project Web Url' }).optional(),
}, { description: 'Project Metadata' });

type RawInput = z.infer<typeof rawSchema>;
type Input = z.infer<typeof internalSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, Input>({
	rawSchema,
	internalSchema,
	parseErrMsg: (value: unknown) => `${value} is not a valid metadata configuration `,
	unknownErrMsg: 'Something went wrong trying to parse the metadata configuration',
});

export type MetadataConfig = z.infer<typeof generatedSchemas.schema>;
export type t = MetadataConfig;
export const { create, of, make } = factory;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as MetadataConfig),
};
