import * as LoadedConfig from "@taqueria/protocol/LoadedConfig"
import * as SanitizedAbsPath from "@taqueria/protocol/SanitizedAbsPath"
import type {i18n} from "@taqueria/protocol/i18n"
import {TaqError, Future} from './taqueria-utils/taqueria-utils-types.ts'
import * as utils from './taqueria-utils/taqueria-utils.ts'
import {pipe} from "https://deno.land/x/fun@v1.0.0/fns.ts"
import {map, chain, chainRej, resolve, reject} from 'https://cdn.jsdelivr.net/gh/fluture-js/Fluture@14.0.0/dist/module.js';
import {getConfig} from './taqueria-config.ts'

// Get utils
const {execText, readJsonFile, writeJsonFile} = utils.inject({
    stdout: Deno.stdout,
    stderr: Deno.stderr
})

// Alias
const exec = execText

// import {log, debug} from './taqueria-utils/taqueria-utils.ts'

// This file contains logic for handling plugins distributed
// and installable using NPM

export type NpmPluginName = string & {__kind__: 'NpmPluginName'}

interface Manifest {
    name: string
}

export const getPluginName = (input:string): NpmPluginName => {
    const endIndex = input.lastIndexOf('@')
    const hasVersion = endIndex > 0
    const retval =  hasVersion
        ? input.substring(0, endIndex).trim()
        : input.trim()
    return (retval as NpmPluginName)
}

export const requireNPM = (projectDir: SanitizedAbsPath.t, i18n: i18n) : Future.t<TaqError.t, Manifest> => pipe(
    readJsonFile<Manifest>(SanitizedAbsPath.make(`${projectDir}/package.json`)),
    chainRej(previous => reject({kind: 'E_NPM_INIT', msg: i18n.__("npmInitRequired"), context: projectDir, previous})),
)

export const getPluginPackageJson = (pluginNameOrPath: string, projectDir: SanitizedAbsPath.t) => pipe(
    /^\//.test(pluginNameOrPath) 
        ? SanitizedAbsPath.make(pluginNameOrPath)
        : SanitizedAbsPath.make(`${projectDir}/${pluginNameOrPath}`),
    pluginPath => readJsonFile(SanitizedAbsPath.make(`${pluginPath}/package.json`)),
    chainRej (() => readJsonFile(SanitizedAbsPath.make(`node_modules/${pluginNameOrPath}/package.json`))),
    map(value => value as Manifest)
)

const addToPluginList = (pluginName: NpmPluginName, config: LoadedConfig.t) => pipe(
    getPluginPackageJson(pluginName, config.projectDir),
    map ((manifest: {name: string}) => {
        const allPlugins = config.plugins ?? []
        const existingPlugins = allPlugins.filter(plugin => plugin.name != manifest.name)
        const plugins = [...existingPlugins, {name: manifest.name, type: "npm"}]
        const updatedConfig = Object.entries(config).reduce(
            (retval: Record<string, unknown>, [key, val]) => {
                if (['configFile', 'hash', 'configDir', 'projectDir'].includes(key))
                    return retval
                else if (key === 'plugins') return {...retval, plugins}
                else {
                    const next = {...retval}
                    next[key] = val
                    return next
                }
            },
            {}
        )
        return updatedConfig
    }),
    chain (writeJsonFile(config.configFile))                    
)


export const installPlugin = (projectDir: SanitizedAbsPath.t, i18n: i18n, plugin: string) => pipe(
    requireNPM(projectDir, i18n),
    chain(_ => exec('npm install -D <%= it.plugin %>', {plugin}, false, projectDir)),
    chain(_ => getConfig(projectDir, i18n, false)),
    chain(config => {
        // The plugin name could look like this: @taqueria/plugin-ligo@1.2.3
        // We need to trim @1.2.3 from the end
        const pluginName = getPluginName(plugin)

        // Note, pluginName could be something like @taqueria/plugin-ligo
        // or ../taqueria-plugin-ligo. Thus, we still need to determine
        // what the real package name is
        return addToPluginList(pluginName, config)    
    }),
    map (_ => i18n.__('pluginInstalled'))
)

export const uninstallPlugin = (projectDir: SanitizedAbsPath.t, i18n: i18n, plugin: string) => pipe(
    requireNPM(projectDir, i18n),
    chain(() => exec('npm uninstall -D <%= it.plugin %>', {plugin}, false, projectDir)),
    chain (() => getConfig(projectDir, i18n, false)),
    chain ((config: LoadedConfig.t) => {
        const pluginName = getPluginName(plugin)
        const plugins = config.plugins?.filter(plugin => plugin.name != pluginName)
        return pipe(
            resolve({...config, plugins}),
            chain (writeJsonFile(config.configFile))                    
        )
    }),
    map (() => i18n.__('pluginUninstalled')),
)