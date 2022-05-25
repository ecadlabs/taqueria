import {z, ZodError, ZodSchema, ZodEffects} from 'zod'
import {toFutureParseErr, toFutureParseUnknownErr} from "@taqueria/protocol/TaqError"
import {resolve, FutureInstance} from "fluture"

type Future<L, R> = FutureInstance<L, R>

type ErrMsg = string | ((value: unknown) => string)

interface CreateSchemaParams {
    rawSchema: ZodSchema
    internalSchema?: ZodSchema
    transformer?: (value: unknown) => unknown,
    isStringLike?: boolean
}

interface CreateTypeParams extends CreateSchemaParams {
    parseErrMsg: ErrMsg,
    unknownErrMsg: ErrMsg    
}
export type Flatten<T> = { [k in keyof T]: T[k] }

export const createSchema = <I>(params: CreateSchemaParams) => {
    const {rawSchema, isStringLike} = params
    const internalSchema = params.internalSchema ?? params.rawSchema
    const noop = (val: unknown) => val
    const transformer = params.transformer ?? noop
        
    const schema = isStringLike
        ? internalSchema
            .transform((val: unknown) => transformer(val) as I & {
                readonly __kind: "generated" & typeof internalSchema
            })
        : internalSchema
            .transform((val: unknown) => transformer(val) as Flatten<I & {
                readonly __kind: "generated" & typeof internalSchema
            }>)

    type GeneratedSchema = typeof schema         

    return {
        rawSchema,
        internalSchema,
        schema
    }
}

export const createType = <R, I = R>(params: CreateTypeParams) => {
    const schemas = createSchema<I>(params)
    const {parseErrMsg, unknownErrMsg} = params

    type T = z.infer<typeof schemas.schema>

    const of = (input: I | unknown) => {
        try {
            return resolve<T>(schemas.schema.parse(input))
        }
        catch (previous) {
            const parseMsg = typeof parseErrMsg === 'string'
                ? parseErrMsg
                : parseErrMsg(input)

            const unknownMsg = typeof unknownErrMsg === 'string'
                ? unknownErrMsg
                : unknownErrMsg(input)

            if (previous instanceof ZodError) {
                return toFutureParseErr<T>(previous, parseMsg, input)
            }
            return toFutureParseUnknownErr<T>(previous, unknownMsg, input)
        }
    }

    const make = (input: I) => of(input)

    const create = (input: R | I | unknown) => schemas.schema.parse(input)

    const factory = {
        make,
        of,
        create
    }

    return {
        schemas,
        factory
    }
}

export default createType