import {z} from "zod"
import * as SandboxConfig from "@taqueria/protocol/SandboxConfig"
import * as Config from "@taqueria/protocol/Config"
import { readJsonFile} from '@taqueria/node-sdk'

const internalSchema = z
    .object({
        configAbsPath: z.preprocess(
            val => val ?? '/project/.taq/config.json',
            z.string()
        ),
        sandbox: z.string().nonempty(),
        configure: z.preprocess(
            val => val ?? false,
            z.boolean()
        ),
        importAccounts: z.preprocess(
            val => val ?? false,
            z.boolean()
        )
    })

type Input = z.infer<typeof internalSchema>

const configInternalSchema = Config.internalSchema.omit({sandbox: true}).extend({
    sandbox: z.record(
        z.union([
            SandboxConfig.schema,
            z.string().nonempty()
        ])
    )
})

export type ParsedConfig = z.infer<typeof configInternalSchema>

const schema = z.object({
    configAbsPath: z.string().nonempty(),
    sandbox: z.string().nonempty(),
    configure: z.boolean().default(false),
    importAccounts: z.boolean().default(false),
    config: configInternalSchema.transform(val => val as ParsedConfig)
})

export type SanitizedArgs = z.infer<typeof schema>

export type t = SanitizedArgs

export const create = async (data: unknown) => {
    const inputArgs = internalSchema.parse(data)
    const rawConfig = await readJsonFile<Record<string, unknown>>(inputArgs.configAbsPath)
    const config = Config.create(rawConfig)
    if (!config.sandbox) throw `No sandboxes have been defined in your .taq/config.json file.`
    
    return schema.parse({
        ...inputArgs,
        config,
    }) as SanitizedArgs
}