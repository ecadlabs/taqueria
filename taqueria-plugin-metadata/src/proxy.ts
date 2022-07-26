import { getContracts, sendAsyncErr, sendJsonRes } from '@taqueria/node-sdk';
import { RequestArgs } from '@taqueria/node-sdk/types';
import fs from 'fs/promises';
import path from 'path';
import prompts from 'prompts';

// TODO: What should this be, it was removed from the sdk
type PluginResponse =
	| void
	| {
		render: 'table';
		data: unknown[];
	};

interface Opts extends RequestArgs.ProxyRequestArgs {
	readonly contractName?: string;
}

const createContractMetadata = async (
	contractName: undefined | string,
	contracts: undefined | string[],
): Promise<PluginResponse> => {
	if (!contractName) {
		if (contracts?.length) {
			// Show contract options
			// console.log('contracts', { contracts });

			const result = contracts.length > 1
				? await prompts([
					{
						type: `select`,
						name: `contract`,
						message: `Pick a contract`,
						choices: contracts.map(x => ({ title: x, value: x })),
					},
				])
				: await prompts([
					{
						type: `text`,
						name: `contract`,
						message: `Enter a contract name`,
						initial: contracts[0],
					},
				]) as { contract: string };

			contractName = result.contract;
		}

		if (!contractName) {
			throw new Error(`contractName was not provided`);
		}
	}

	const destFilePath = path.resolve(process.cwd(), `./artifacts/${contractName}.json`);

	const loadContractMetadata = async (otherContractName: string) => {
		try {
			const otherContractFilePath = path.resolve(process.cwd(), `./artifacts/${otherContractName}.json`);
			const existingContent = await fs.readFile(otherContractFilePath, { encoding: 'utf-8' });
			return JSON.parse(existingContent) as Partial<typeof contractMetadata>;
		} catch (err) {
			// ignore missing file
			return undefined;
		}
	};

	let defaultValues = await loadContractMetadata(contractName);
	if (defaultValues) {
		console.log('Existing Metadata:', defaultValues);
	}

	if (!defaultValues && contracts?.length) {
		// Load other contracts for defaults
		const otherContractMetadata = (await Promise.all(contracts.map(async x => await loadContractMetadata(x))))
			.filter(x => x).map(x => x!) ?? [];
		defaultValues = {
			authors: otherContractMetadata.map(x => x.authors).filter(x => x?.length)[0],
			homepage: otherContractMetadata.map(x => x.homepage).filter(x => x?.length)[0],
			license: otherContractMetadata.map(x => x.license).filter(x => x?.length)[0],
		};
	}

	// Basic Tzip-16 contract metadata
	const response = await prompts([
		{
			type: `text`,
			name: `name`,
			message: `Enter contract name`,
			initial: defaultValues?.name ?? contractName,
		},
		{
			type: `text`,
			name: `description`,
			message: `Enter contract description`,
			initial: defaultValues?.description ?? '',
		},
		{
			type: 'list',
			name: 'authors',
			message: 'Enter contract authors (comma separated)',
			initial: defaultValues?.authors?.join(',') ?? '',
			separator: ',',
		},
		{
			type: 'text',
			name: 'homepage',
			message: 'Enter contract web url',
			initial: defaultValues?.homepage ?? '',
		},
		{
			type: 'text',
			name: 'license',
			message: 'Enter contract license',
			initial: defaultValues?.license ?? 'ISC',
		},
		// TODO: errors - mapping of error codes to human readable error messages
		// TODO: views - off-chain views
		// TODO: select optional interfaces and answer additional prompts
	]) as {
		name: string;
		description: string;
		authors: string[];
		license: string;
		homepage: string;
	};

	const contractMetadata = {
		name: response.name,
		version: 'v1.0.0',
		description: response.description,
		authors: response.authors,
		homepage: response.homepage,
		license: response.license,
		interfaces: [
			'TZIP-016',
		],
	};
	await fs.writeFile(destFilePath, JSON.stringify(contractMetadata, null, 2));

	return {
		render: 'table',
		data: [
			{
				contractName,
			},
		],
	};
};

const execute = async (opts: Opts): Promise<PluginResponse> => {
	const {
		task,
		contractName,
		config,
	} = opts;

	const contracts = Object.keys(config.contracts ?? {}).map(x => path.basename(x, path.extname(x)));

	switch (task) {
		case 'metadata':
			return createContractMetadata(contractName, contracts);
		default:
			throw new Error(`${task} is not an understood task by the metadata plugin`);
	}
};

export default async (args: RequestArgs.ProxyRequestArgs): Promise<PluginResponse> => {
	const opts = args as Opts;

	try {
		const resultRaw = await execute(opts) as Record<string, unknown>;
		// TODO: Fix deno parsing
		// Without this, `data.reduce is not a function`
		const result = ('data' in resultRaw) ? resultRaw.data : resultRaw;
		return sendJsonRes(result);
	} catch (err) {
		const error = err as Error;
		if (error.message) {
			return sendAsyncErr(error.message);
		}
	}
};
