import { toFutureParseErr, toFutureParseUnknownErr } from '@taqueria/protocol/TaqError';
import { FutureInstance, resolve } from 'fluture';
import { z, ZodError, ZodSchema } from 'zod';

type Future<L, R> = FutureInstance<L, R>;

type ErrMsg = string | ((value: unknown) => string);

interface CreateSchemaParams {
	rawSchema: ZodSchema;
	internalSchema?: ZodSchema;
	transformer?: (value: unknown) => unknown;
	isStringLike?: boolean;
	passthrough?: boolean;
}

interface CreateTypeParams extends CreateSchemaParams {
	parseErrMsg: ErrMsg;
	unknownErrMsg: ErrMsg;
}
export type Flatten<T> = { [k in keyof T]: T[k] };

export const createSchema = <I>(params: CreateSchemaParams) => {
	const { rawSchema, isStringLike, passthrough } = params;
	const baseSchema = params.internalSchema ?? params.rawSchema;
	const internalSchema: typeof baseSchema = passthrough
		? eval('baseSchema.passthrough()')
		: baseSchema;
	const noop = (val: unknown) => val;
	const transformer = params.transformer ?? noop;

	const schema = isStringLike
		? internalSchema
			.transform((val: unknown) =>
				transformer(val) as I & {
					readonly __kind: 'generated' & z.infer<typeof internalSchema>;
				}
			)
		: internalSchema
			.transform((val: unknown) =>
				transformer(val) as Flatten<
					I & {
						readonly __kind: 'generated' & z.infer<typeof internalSchema>;
					}
				>
			);

	type GeneratedSchema = typeof schema;

	return {
		rawSchema,
		internalSchema,
		schema,
	};
};

// TODO:
// TypeScript appears to have a bug with default generic values
// For instance, I'd like to use this:
// export const createType = <R, I = R>(params: CreateTypeParams) => {
//
// However, I == unknown when having I default to R if no I was given.
// So, we need to require R and I explicitly
export const createType = <R, I>(params: CreateTypeParams) => {
	const schemas = createSchema<I>(params);
	const { parseErrMsg, unknownErrMsg } = params;

	type T = z.infer<typeof schemas.schema>;

	const internalOf = (input: unknown) => {
		try {
			return resolve<T>(schemas.schema.parse(input));
		} catch (previous) {
			const parseMsg = typeof parseErrMsg === 'string'
				? parseErrMsg
				: parseErrMsg(input);

			const unknownMsg = typeof unknownErrMsg === 'string'
				? unknownErrMsg
				: unknownErrMsg(input);

			if (previous instanceof ZodError) {
				return toFutureParseErr<T>(previous, parseMsg, input);
			}
			return toFutureParseUnknownErr<T>(previous, unknownMsg, input);
		}
	};
	const of = internalOf;

	const make = (input: I) => internalOf(input);

	const create = (input: R | I) => schemas.schema.parse(input) as T;

	const from = (input: unknown) => schemas.schema.parse(input) as T;

	const factory = {
		make,
		of,
		create,
		from,
	};

	return {
		schemas,
		factory,
	};
};

export default createType;
