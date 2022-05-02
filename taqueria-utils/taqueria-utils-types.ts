import * as TaqError from "./TaqError.ts"
import * as Future from './Future.ts'

type Callback = () => void

export type EnvKeys = "TAQ_CONFIG_DIR" | "TAQ_MAX_CONCURRENCY"

export interface EnvVars {
    get: (key: EnvKeys) => undefined | string
}

export interface UtilsDependencies {
    stdout: Deno.Writer
    stderr: Deno.Writer
}

export {
    Future,
    TaqError
}