import {z} from 'zod'
import * as Verb from '@taqueria/protocol/Verb'
import * as SingleChar from '@taqueria/protocol/SingleChar'
import createType, {Flatten} from "@taqueria/protocol/Base"

export const internalSchema = z.object({
    shortFlag: SingleChar.schemas.schema.describe("Option Short Flag").optional(),
    flag: Verb.schemas.schema.describe("Option Long Flag"),
    description: z.string({description: "Option Description"}).nonempty(),
    defaultValue: z.union(
        [z.string(), z.number(), z.boolean()],
        {description: "Option Default Value"}
    ).optional(),
    choices: z.array(
        z.string({description: "Option Choice"}),
        {description: "Option Choices"}
    ).optional(),
    required: z.boolean({description: "Option Is Required"}).default(false).optional(),
    boolean: z.boolean({description: "Option Is Boolean"}).default(false).optional()
}).describe("Option")

export const rawSchema = z.object({
    shortFlag: SingleChar.rawSchema.describe("Option Short Flag").optional(),
    flag: Verb.rawSchema.describe("Option Long Flag"),
    description: z.string({description: "Option Description"}).nonempty(),
    defaultValue: z.union(
        [z.string(), z.number(), z.boolean()],
        {description: "Option Default Value"}
    ).optional(),
    choices: z.array(
        z.string({description: "Option Choice"}),
        {description: "Option Choices"}
    ).optional(),
    required: z.boolean({description: "Option Is Required"}).default(false).optional(),
    boolean: z.boolean({description: "Option Is Boolean"}).default(false).optional()
}).describe("Option")

type RawInput = z.infer<typeof rawSchema>
type Input = z.infer<typeof internalSchema>

export const {schemas, factory} = createType<RawInput, Input>({
    rawSchema,
    internalSchema,
    parseErrMsg: (value: unknown) => `The following option is invalid: ${value}`,
    unknownErrMsg: "Something went wrong trying to parse the option"
})

export type Option = Flatten<z.infer<typeof schemas.schema>>
export type t = Option

export const {make, create, of} = factory