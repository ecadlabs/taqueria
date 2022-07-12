import createType from '@taqueria/protocol/Base';
import * as SanitizedAbsPath from '@taqueria/protocol/SanitizedAbsPath';
import * as Url from '@taqueria/protocol/Url';
import { omit } from 'rambda';
import { z } from 'zod';

export const rawSchema = z.object({
	_: z.array(z.union([z.string().min(1), z.number()])),
	projectDir: SanitizedAbsPath.schemas.schema,
	maxConcurrency: z.preprocess(
		val => typeof val === 'string' ? parseInt(val) : Number(val),
		z.number().int().min(1).default(10),
	),
	debug: z.preprocess(
		val => Boolean(val),
		z.boolean().default(false),
	),
	disableState: z.preprocess(
		val => Boolean(val),
		z.boolean().default(false),
	),
	logPluginRequests: z.preprocess(
		val => Boolean(val),
		z.boolean().default(false),
	),
	fromVsCode: z.preprocess(
		val => Boolean(val),
		z.boolean().default(false),
	),
	version: z.preprocess(
		val => Boolean(val),
		z.boolean().optional(),
	),
	build: z.preprocess(
		val => Boolean(val),
		z.boolean().optional(),
	),
	help: z.preprocess(
		val => Boolean(val),
		z.boolean().optional(),
	),
	yes: z.preprocess(
		val => Boolean(val),
		z.boolean().optional(),
	),
	plugin: z.string().min(1).optional(),
	env: z.union([z.literal('production'), z.literal('testing'), z.literal('development'), z.string().nonempty()])
		.default('development'),
	quickstart: z.string().min(1).optional(),
	setBuild: z.preprocess(
		val => String(val),
		z.string().min(3),
	),
	setVersion: z.string().min(3),
	template: z.string().min(1).optional(),
	pluginName: z.string().min(1).optional(),
	task: z.string().min(1).optional(),
}, { description: 'Sanitizied Args' }).passthrough();

export const scaffoldRawSchema = rawSchema.extend({
	scaffoldProjectDir: z.string().min(1).transform((val: unknown) => val as SanitizedAbsPath.t),
	scaffoldUrl: z.string().min(1).url().transform((val: unknown) => val as Url.t),
});

export const provisionRawSchema = rawSchema
	.extend({
		task: z
			.string()
			.min(1)
			.describe('Task name'),
		name: z
			.string()
			.min(1)
			.regex(
				/^[a-z0-9]+[a-z0-9-_]$/,
				'Provisioner name must consist of one or more letters/numbers and may not start with an underscore or dash.',
			)
			.describe('Provisioner name')
			.optional(),
	})
	.passthrough();

export const managePluginRawSchema = rawSchema.omit({ pluginName: true }).extend({
	pluginName: z.string().min(1),
});

export const versionRawSchema = rawSchema.extend({
	version: z.boolean().default(true),
});

type RawInput = z.infer<typeof rawSchema>;
type RawScaffoldInput = z.infer<typeof scaffoldRawSchema>;
type RawProvisionInput = z.infer<typeof provisionRawSchema>;
type RawManagePluginInput = z.infer<typeof managePluginRawSchema>;
type RawVersionInput = z.infer<typeof versionRawSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, RawInput>({
	rawSchema,
	parseErrMsg: 'The arguments provided are invalid',
	unknownErrMsg: 'Something went wrong parsing the command-line arguments',
});

export const { create, of, make } = factory;

export type SanitizedArgs = z.infer<typeof generatedSchemas.schema>;
export type t = SanitizedArgs;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => omit(['p', 'project-dir'], val) as SanitizedArgs),
};

export const scaffoldTaskArgs = createType<RawScaffoldInput, RawScaffoldInput>({
	rawSchema: scaffoldRawSchema,
	parseErrMsg: 'The arguments provided are invalid for the scaffold task',
	unknownErrMsg: 'Something went wrong parsing the arguments for the scaffold task',
});

export const provisionTaskArgs = createType<RawProvisionInput, RawProvisionInput>({
	rawSchema: provisionRawSchema,
	parseErrMsg: 'The arguments provided are invalid for the provision task',
	unknownErrMsg: 'Something went wrong parsing the arguments for the provision task',
	passthrough: true,
});

export const installTaskArgs = createType<RawManagePluginInput, RawManagePluginInput>({
	rawSchema: managePluginRawSchema,
	parseErrMsg: 'The arguments provided are invalid for the install task',
	unknownErrMsg: 'Something went wrong parsing the arguments for the install task',
});

export const uninstallTaskArgs = createType<RawManagePluginInput, RawManagePluginInput>({
	rawSchema: managePluginRawSchema,
	parseErrMsg: 'The arguments provided are invalid for the uninstall task',
	unknownErrMsg: 'Something went wrong parsing the arguments for the uninstall task',
});

export type ScaffoldTaskArgs = z.infer<typeof scaffoldTaskArgs.schemas.schema>;
export type ProvisionTaskArgs = z.infer<typeof provisionTaskArgs.schemas.schema>;
export type InstallTaskArgs = z.infer<typeof installTaskArgs.schemas.schema>;
export type UninstallTaskArgs = z.infer<typeof uninstallTaskArgs.schemas.schema>;

export const createScaffoldTaskArgs = scaffoldTaskArgs.factory.from;
export const makeScaffoldTaskArgs = scaffoldTaskArgs.factory.make;
export const ofScaffoldTaskArgs = scaffoldTaskArgs.factory.of;

export const createProvisionTaskArgs = provisionTaskArgs.factory.create;
export const makeProvisionTaskArgs = provisionTaskArgs.factory.make;
export const ofProvisionTaskArgs = provisionTaskArgs.factory.of;

export const createInstallTaskArgs = installTaskArgs.factory.create;
export const makeInstallTaskArgs = installTaskArgs.factory.make;
export const ofInstallTaskArgs = installTaskArgs.factory.of;

export const createUninstallTaskArgs = uninstallTaskArgs.factory.create;
export const makeUninstallTaskArgs = uninstallTaskArgs.factory.make;
export const ofUninstallTaskArgs = uninstallTaskArgs.factory.of;
