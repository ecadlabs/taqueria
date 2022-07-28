import {
	getCurrentEnvironment,
	getCurrentEnvironmentConfig,
	getDefaultAccount,
	getInitialStorage,
	getNetworkConfig,
	getSandboxAccountConfig,
	getSandboxAccountNames,
	getSandboxConfig,
	sendAsyncErr,
	sendErr,
	sendJsonRes,
} from '@taqueria/node-sdk';
import { Protocol, RequestArgs } from '@taqueria/node-sdk/types';
import { OperationContentsAndResultOrigination } from '@taquito/rpc';
import { importKey, InMemorySigner } from '@taquito/signer';
import { TezosToolkit, WalletOperationBatch } from '@taquito/taquito';
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation';
import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Opts extends RequestArgs.t {
	contract?: string;
}

interface ContractStorageMapping {
	filename: string;
	storage?: unknown;
}

interface OriginationResult {
	contract: string;
	address: string;
	destination: string;
}

const getFirstAccountAlias = (sandboxName: string, opts: Opts) => {
	const aliases = getSandboxAccountNames(opts)(sandboxName);
	return aliases.shift();
};

const getContractAbspath = (contractFilename: string, parsedArgs: Opts) =>
	join(parsedArgs.config.artifactsDir, /\.tz$/.test(contractFilename) ? contractFilename : `${contractFilename}.tz`);

const addOrigination = (parsedArgs: Opts, batch: Promise<WalletOperationBatch>) =>
	async (mapping: ContractStorageMapping) => {
		const contractAbspath = getContractAbspath(mapping.filename, parsedArgs);
		const contractData = await readFile(contractAbspath, 'utf-8');
		return (await batch).withOrigination({
			code: contractData,
			storage: mapping.storage,
		});
	};

const getValidContracts = async (parsedArgs: Opts) => {
	const contracts = parsedArgs.contract
		? [parsedArgs.contract]
		: (await glob('**/*.tz', { cwd: parsedArgs.config.artifactsDir })) as string[];

	return contracts.reduce(
		(retval, filename) => {
			const storage = getInitialStorage(parsedArgs)(filename);
			if (storage === undefined || storage === null) {
				sendErr(
					`Michelson artifact ${filename} has no initial storage specified for the target environment.\nStorage is expected to be specified in .taq/config.json at JSON path: environment.${
						getCurrentEnvironment(parsedArgs)
					}.storage."${filename}"\n`,
				);
				return retval;
			}
			return [...retval, { filename, storage }];
		},
		[] as ContractStorageMapping[],
	);
};

const mapOpToContract = async (contracts: ContractStorageMapping[], op: BatchWalletOperation, destination: string) => {
	const results = await op.operationResults();

	return contracts.reduce(
		(retval, contract) => {
			// If initial storage was provided for the contract
			// then we submitted an operation to originate that contract
			if (contract.storage) {
				// WARNING - using side effect here.
				// For each iteration of reduce, results array is being modified-in-place.
				// TODO: Adjust to use recursion to avoid side-effect.
				const result = results.shift() as OperationContentsAndResultOrigination;
				const address = result && result.metadata.operation_result.originated_contracts
					? result.metadata.operation_result.originated_contracts.join(',')
					: 'Error';

				return [
					...retval,
					{
						contract: contract.filename,
						address,
						destination,
					},
				];
			}

			return [
				...retval,
				{
					contract: contract.filename,
					address: 'Error',
					destination,
				},
			];
		},
		[] as OriginationResult[],
	);
};

const createBatch = async (parsedArgs: Opts, tezos: TezosToolkit, destination: string) => {
	const contracts = await getValidContracts(parsedArgs);
	if (!contracts.length) {
		return undefined;
	}

	const batch = await contracts.reduce(
		(batch, contractMapping) =>
			contractMapping.storage
				? addOrigination(parsedArgs, batch)(contractMapping)
				: batch,
		Promise.resolve(tezos.wallet.batch()),
	);

	try {
		const op = await batch.send();
		const confirmed = await op.confirmation();
		return await mapOpToContract(contracts, op, destination);
	} catch (err) {
		const error = (err as { message: string });
		if (error.message) {
			const msg = error.message;
			if (/ENOTFOUND/.test(msg)) {
				sendErr(msg + ' - The RPC URL may be invalid. Check your ./taq/config.json.');
			} else if (/ECONNREFUSED/.test(msg)) {
				sendErr(msg + ' - The RPC URL may be down or the sandbox is not running.');
			} else {
				sendErr(
					msg
						+ " - There was a problem communicating with the chain. Perhaps review your RPC URL of the network or sandbox you're targeting.",
				);
			}
		}
		return undefined;
	}
};

const originateToNetworks = (parsedArgs: Opts, currentEnv: Protocol.Environment.t) =>
	currentEnv.networks
		? currentEnv.networks.reduce(
			(retval, networkName) => {
				const network = getNetworkConfig(parsedArgs)(networkName);
				if (network) {
					if (network.rpcUrl) {
						if (network.faucet) {
							const result = (async () => {
								const tezos = new TezosToolkit(network.rpcUrl as string);
								await importKey(
									tezos,
									network.faucet.email,
									network.faucet.password,
									network.faucet.mnemonic.join(' '),
									network.faucet.activation_code,
								);
								return await createBatch(parsedArgs, tezos, networkName);
							})();

							return [...retval, result];
						} else sendErr(`Network ${networkName} requires a valid faucet in config.json.`);
					} else sendErr(`Network "${networkName} is missing an RPC url in config.json."`);
				} else {
					sendErr(
						`The current environment is configured to use a network called '${networkName}'; however, no network of this name has been configured in .taq/config.json.`,
					);
				}

				return retval;
			},
			[] as Promise<OriginationResult[] | undefined>[],
		)
		: [];

const originateToSandboxes = (parsedArgs: Opts, currentEnv: Protocol.Environment.t) =>
	currentEnv.sandboxes
		? currentEnv.sandboxes.reduce(
			(retval, sandboxName) => {
				const sandbox = getSandboxConfig(parsedArgs)(sandboxName);
				if (sandbox) {
					if (sandbox.rpcUrl) {
						let defaultAccount = getDefaultAccount(parsedArgs)(sandboxName);
						if (!defaultAccount) {
							const first = getFirstAccountAlias(sandboxName, parsedArgs);
							if (first) {
								defaultAccount = getSandboxAccountConfig(parsedArgs)(sandboxName)(first);
								// TODO: The error should be a warning, not an error. Descriptive string should not begin with 'Warning:'
								sendErr(
									`Warning: A default origination account has not been specified for sandbox ${sandboxName}. Taqueria will use the account ${first} for this origination.\nA default account can be specified in .taq/config.json at JSON path: sandbox.${sandboxName}.accounts.default\n`,
								);
							}
						}
						if (defaultAccount) {
							const secretKey = defaultAccount.secretKey;
							const result = (async () => {
								const tezos = new TezosToolkit(sandbox.rpcUrl as string);
								tezos.setProvider({
									signer: new InMemorySigner(secretKey.replace(/^unencrypted:/, '')),
								});
								return await createBatch(parsedArgs, tezos, sandboxName);
							})();

							return [...retval, result];
						} else sendErr(`No accounts are available for the sandbox called ${sandboxName} to perform origination.`);
					} else sendErr(`Sandbox "${sandboxName} is missing an RPC url in config.json."`);
				} else {
					sendErr(
						`The current environment is configured to use a sandbox called '${sandboxName}'; however, no sandbox of this name has been configured in .taq/config.json.`,
					);
				}

				return retval;
			},
			[] as Promise<OriginationResult[] | undefined>[],
		)
		: [];

export const originate = <T>(parsedArgs: Opts) => {
	const env = getCurrentEnvironmentConfig(parsedArgs);

	if (!env) {
		return sendAsyncErr(`There is no environment called ${parsedArgs.env} in your config.json.`);
	}

	const jobs = [
		...originateToNetworks(parsedArgs, env),
		...originateToSandboxes(parsedArgs, env),
	];

	return Promise.all(jobs)
		.then(jobs =>
			jobs.reduce(
				(retval, originations) => {
					return originations
						? [...retval as OriginationResult[], ...originations]
						: retval;
				},
				[],
			)
		)
		.then(results => results && results.length > 0 ? sendJsonRes(results) : sendErr(`No contracts originated.`));
};

export default originate;
