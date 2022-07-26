import createType, { Flatten } from '@taqueria/protocol/Base';
import * as Contract from '@taqueria/protocol/Contract';
import * as Environment from '@taqueria/protocol/Environment';
import * as InstalledPlugin from '@taqueria/protocol/InstalledPlugin';
import * as MetadataConfig from '@taqueria/protocol/MetadataConfig';
import * as NetworkConfig from '@taqueria/protocol/NetworkConfig';
import * as SandboxConfig from '@taqueria/protocol/SandboxConfig';
import * as Tz from '@taqueria/protocol/Tz';
import { z } from 'zod';

export const pluginsRawSchema = z.preprocess(
	val => val ?? [],
	z.array(
		InstalledPlugin.rawSchema,
		{ description: 'config.plugins' },
	),
);

export const pluginsInternalSchema = z.preprocess(
	val => val ?? [],
	z.array(
		InstalledPlugin.schemas.schema,
		{ description: 'config.plugins' },
	),
);

const networkMap = z
	.record(
		z.union([
			NetworkConfig.schemas.schema,
			z.string({ description: 'config.network' })
				.nonempty('Default network must reference the name of an  existing network configuration.'),
		]),
		{ description: 'Network configurations' },
	)
	.optional();

const sandboxMap = z
	.record(
		z.union([
			SandboxConfig.schemas.schema,
			z.string({ description: 'config.sandbox' })
				.min(1, 'Default sandbox must reference the name of an existing sandbox configuration.'),
		]),
		{ description: 'Sandbox configurations' },
	)
	.optional();

const environmentMap = z
	.record(
		z.union([
			Environment.schemas.schema,
			z.string().min(1, 'Default environment must reference the name of an existing environment.'),
		]),
		{ description: 'Environment configurations' },
	)
	.optional();

const accountsMap = z.preprocess(
	(val: unknown) =>
		val ?? {
			'bob': '5_000_000_000',
			'alice': '5_000_000_000',
			'john': '5_000_000_000',
		},
	z.record(
		z.union([Tz.rawSchema, z.number()]),
		{ description: 'config.accounts' },
	),
);

const commonSchema = z.object({
	language: z.preprocess(
		val => val ?? 'en',
		z.union([
			z.literal('en'),
			z.literal('fr'),
		], { description: 'config.language' })
			.optional(),
	),
	plugins: pluginsInternalSchema.optional(),
	contractsDir: z
		.preprocess(
			(val: unknown) => val ?? 'contracts',
			z.string({ description: 'config.contractsDir' })
				.min(1, 'config.contractsDir must have a value'),
		),
	artifactsDir: z
		.preprocess(
			(val: unknown) => val ?? 'artifacts',
			z.string({ description: 'config.artifactsDir' })
				.min(1, 'config.artifactsDir must have a value'),
		),
	contracts: z.record(
		Contract.rawSchema,
	).optional(),
}).describe('config');

export const internalSchema = commonSchema.extend({
	network: networkMap,
	sandbox: sandboxMap,
	environment: environmentMap,
	accounts: accountsMap,
	contracts: z.record(Contract.schemas.schema).optional(),
	metadata: MetadataConfig.schemas.schema.optional(),
});

export const rawSchema = commonSchema.extend({
	plugins: pluginsRawSchema.optional(),
	network: z
		.record(
			z.union([
				NetworkConfig.rawSchema,
				z.string({ description: 'config.network' })
					.min(1, 'Default network must reference the name of an  existing network configuration.'),
			]),
		)
		.optional(),
	sandbox: z
		.record(
			z.union([
				SandboxConfig.rawSchema,
				z.string({ description: 'config.sandbox' })
					.min(1, 'Default sandbox must reference the name of an existing sandbox configuration.'),
			]),
		)
		.optional(),
	environment: z
		.record(
			z.union([
				Environment.rawSchema,
				z.string({ description: 'config.environment' })
					.min(1, 'Default environment must reference the name of an existing environment.'),
			]),
		)
		.optional(),
	accounts: z
		.record(
			z.union([Tz.rawSchema, z.number()]),
			{ description: 'config.accounts' },
		)
		.optional(),
	metadata: MetadataConfig.rawSchema.optional(),
}).describe('config');

type RawInput = z.infer<typeof rawSchema>;
type Input = z.infer<typeof internalSchema>;

export const { schemas: generatedSchemas, factory } = createType<RawInput, Input>({
	rawSchema,
	internalSchema,
	parseErrMsg: (value: unknown) => `${value} is not a configuration`,
	unknownErrMsg: 'Something went wrong trying to parse your configuration',
});

export const { create, of, make } = factory;
export type Config = z.infer<typeof generatedSchemas.schema>;
export type t = Config;

export const schemas = {
	...generatedSchemas,
	schema: generatedSchemas.schema.transform(val => val as Config),
};
