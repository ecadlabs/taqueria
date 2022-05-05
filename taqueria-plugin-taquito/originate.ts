import { RequestArgs, PluginResponse, Failure, LikeAPromise, Protocol} from "@taqueria/node-sdk/types";
import { TezosToolkit, WalletOperationBatch } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { getSandboxAccountNames, getCurrentEnvironmentConfig, getNetworkConfig, getSandboxAccountConfig, getInitialStorage, sendErr, getSandboxConfig, getDefaultAccount, sendJsonRes, sendAsyncErr } from "@taqueria/node-sdk";
import { BatchWalletOperation } from "@taquito/taquito/dist/types/wallet/batch-operation";
import { OperationContentsAndResultOrigination } from "@taquito/rpc";
import glob from 'fast-glob'
import {join} from 'path'
import {readFile} from 'fs/promises'

interface Opts extends RequestArgs.t {
    contract?: string
}

interface ContractStorageMapping {
    filename: string,
    storage?: unknown
}

interface OriginationResult {
    contract: string
    address: string
    destination: string
}

const getFirstAccountAlias = (sandboxName: string, opts: Opts) => {
    const aliases = getSandboxAccountNames(opts) (sandboxName)
    return aliases.shift()
}

const getContractAbspath = (contractFilename: string, parsedArgs: Opts) => 
    join(parsedArgs.config.artifactsDir, /\.tz$/.test(contractFilename) ? contractFilename : `${contractFilename}.tz`)

const addOrigination = (parsedArgs: Opts, batch: Promise<WalletOperationBatch>) => async (mapping: ContractStorageMapping) => {
    const contractAbspath = getContractAbspath(mapping.filename, parsedArgs)
    const contractData = await readFile(contractAbspath, "utf-8")
    return (await batch).withOrigination({
        code: contractData,
        storage: mapping.storage,
        
    })
}

const getValidContracts = async (parsedArgs: Opts) => {
    const contracts = parsedArgs.contract
        ? [parsedArgs.contract]
        : (await glob("**/*.tz", {cwd: parsedArgs.config.artifactsDir})) as string[]

    return contracts.reduce(
        (retval, filename) => {
            const storage = getInitialStorage(parsedArgs) (filename)
            if (!storage) throw(`No initial storage provided for ${filename}`)
            return [...retval, {filename, storage}]
        },
        [] as ContractStorageMapping[]
    )    
}

const mapOpToContract = async (contracts: ContractStorageMapping[], op: BatchWalletOperation, destination: string) => {
    const results = await op.operationResults()

    return contracts.reduce(
        (retval, contract) => {

            // If initial storage was provided for the contract
            // then we submitted an operation to originate that contract
            if (contract.storage) {
                const result = results.pop() as OperationContentsAndResultOrigination
                const address = result && result.metadata.operation_result.originated_contracts
                    ? result.metadata.operation_result.originated_contracts.join(',')
                    : 'Error'

                return [
                    ...retval, {
                        contract: contract.filename,
                        address,
                        destination
                    }
                ]
            }

            return [
                ...retval, {
                    contract: contract.filename,
                    address: "Error",
                    destination
                }
            ]
        },
        [] as OriginationResult[]
    )
}


const createBatch = async (parsedArgs: Opts, tezos: TezosToolkit, destination: string) => {
    const contracts = await getValidContracts (parsedArgs)                                
    
    const batch = await contracts.reduce(
        (batch, contractMapping) => 
            contractMapping.storage
                ? addOrigination(parsedArgs, batch) (contractMapping)
                : batch,
        Promise.resolve(tezos.wallet.batch())
    )
    
    try {
        const op = await batch.send()
        const confirmed = await op.confirmation()
        return await mapOpToContract(contracts, op, destination)
    }
    catch (err) {
        const error = (err as {message: string})
        if (error.message) sendErr(error.message)
        return undefined
    }
}

const originateToNetworks = (parsedArgs: Opts, currentEnv: Protocol.Environment.t) =>
    currentEnv.networks
        ? currentEnv.networks.reduce(
            (retval, networkName) => {
                const network = getNetworkConfig (parsedArgs) (networkName)
                if (network) {
                    if (network.rpcUrl) {
                        if (network.faucet) {
                            const result = (async () => {
                                const tezos = new TezosToolkit(network.rpcUrl as string)
                                await importKey(tezos, network.faucet.email, network.faucet.password, network.faucet.mnemonic.join(' '), network.faucet.activation_code)
                                return await createBatch(parsedArgs, tezos, networkName)
                            })()
    
                            return [...retval, result]
                        }
                        else sendErr(`Network ${networkName} requires a valid faucet in config.json.`)
                    }
                    else sendErr(`Network "${networkName} is missing an RPC url in config.json."`)
                }
                else sendErr(`The current environment is configured to use a network called '${networkName}'; however, no network of this name has been configured in .taq/config.json.`)
                
                return retval
            },
            [] as  Promise<OriginationResult[]|undefined>[]
        )
        : []

const originateToSandboxes = (parsedArgs: Opts, currentEnv: Protocol.Environment.t) =>
    currentEnv.sandboxes
        ? currentEnv.sandboxes.reduce(
            (retval, sandboxName) => {
                const sandbox = getSandboxConfig (parsedArgs) (sandboxName)
                if (sandbox) {
                    if (sandbox.rpcUrl) {
                        let defaultAccount = getDefaultAccount(parsedArgs) (sandboxName)
                        if (!defaultAccount) {
                            const first = getFirstAccountAlias(sandboxName, parsedArgs)
                            if (first) {
                                defaultAccount = getSandboxAccountConfig(parsedArgs) (sandboxName) (first)
                                sendErr(`No default account has been configured for the sandbox called ${sandboxName}. Using the account called ${first} for origination.`)
                            }
                        }
                        if (defaultAccount) {
                            const secretKey = defaultAccount.secretKey
                            const result = (async () => {
                                const tezos = new TezosToolkit(sandbox.rpcUrl as string)
                                tezos.setProvider({
                                    signer: new InMemorySigner(secretKey.replace(/^unencrypted:/, '')),
                                });
                                return await createBatch(parsedArgs, tezos, sandboxName)
                            })()
                            
                            return [...retval, result]
                        }
                        else sendErr(`No accounts are available for the sandbox called ${sandboxName} to perform origination.`)
                    }
                    else sendErr(`Sandbox "${sandboxName} is missing an RPC url in config.json."`)
                }
                else sendErr(`The current environment is configured to use a sandbox called '${sandboxName}'; however, no sandbox of this name has been configured in .taq/config.json.`)

                return retval
            },
            [] as Promise<OriginationResult[]|undefined>[]
        )
        : []
    
    

export const originate = <T>(parsedArgs: Opts): LikeAPromise<PluginResponse, Failure<T>> => {
    const env = getCurrentEnvironmentConfig(parsedArgs)

    if (!env) {
        return sendAsyncErr(`There is no environment called ${parsedArgs.env} in your config.json.`)
    }

    const jobs = [
        ...originateToNetworks(parsedArgs, env),
        ...originateToSandboxes(parsedArgs, env)
    ]

    return Promise.all(jobs)
        .then(jobs => jobs.reduce(
            (retval, originations) => {
                return originations
                    ? [...retval as OriginationResult[], ...originations]
                    : retval
            },
            []
        ))
        .then(results => results && results.length > 0 ? sendJsonRes(results): sendErr(`No contracts originated.`))
}

export default originate
