import { exec as exec1 } from 'child_process';
import { createHash } from 'crypto';
import fsPromises from 'fs/promises';
import path from 'path';
import util from 'util';
import * as contents from './data/help-contents/ligo-contents';
import { checkFolderExistsWithTimeout, generateTestProject } from './utils/utils';
const exec = util.promisify(exec1);

const taqueriaProjectPath = 'e2e/auto-test-ligo-plugin';

describe('E2E Testing for taqueria ligo plugin', () => {
	beforeAll(async () => {
		await generateTestProject(taqueriaProjectPath, ['ligo']);
		// TODO: This can removed after this is resolved:
		// https://github.com/ecadlabs/taqueria/issues/528
		try {
			await exec(`taq -p ${taqueriaProjectPath}`);
		} catch (_) {}
	});

	test('Verify that the ligo plugin exposes the associated commands in the help menu', async () => {
		try {
			const ligoHelpContents = await exec(`taq --help --projectDir=${taqueriaProjectPath}`);
			expect(ligoHelpContents.stdout).toBe(contents.helpContentsLigoPlugin);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that the ligo plugin exposes the associated options in the help menu', async () => {
		try {
			const ligoHelpContents = await exec(`taq compile --help --projectDir=${taqueriaProjectPath}`);
			expect(ligoHelpContents.stdout).toBe(contents.helpContentsLigoPluginSpecific);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that the ligo plugin aliases expose the correct info in the help menu', async () => {
		try {
			const ligoAliasCHelpContents = await exec(`taq c --help --projectDir=${taqueriaProjectPath}`);
			expect(ligoAliasCHelpContents.stdout).toBe(contents.helpContentsLigoPluginSpecific);

			const ligoAliasCompileLigoHelpContents = await exec(
				`taq compile-ligo --help --projectDir=${taqueriaProjectPath}`,
			);
			expect(ligoAliasCompileLigoHelpContents.stdout).toBe(contents.helpContentsLigoPluginSpecific);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that taqueria ligo plugin outputs no contracts message if no contracts exist', async () => {
		try {
			const noContracts = await exec(`taq compile`, { cwd: `./${taqueriaProjectPath}` });
			expect(noContracts.stderr).toContain(contents.ligoNoContracts);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that taqueria ligo plugin can compile one contract under contracts folder', async () => {
		try {
			// 1. Copy contract from data folder to taqueria project folder
			await exec(`cp e2e/data/hello-tacos.mligo ${taqueriaProjectPath}/contracts`);

			// 2. Register the contracts
			await exec(`taq add-contract hello-tacos.mligo`, { cwd: `./${taqueriaProjectPath}` });

			// 3. Run taq compile ${contractName}
			await exec(`taq compile`, { cwd: `./${taqueriaProjectPath}` });

			// 4. Verify that compiled michelson version has been generated
			await checkFolderExistsWithTimeout(`./${taqueriaProjectPath}/artifacts/hello-tacos.tz`);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that taqueria ligo plugin can compile one contract using compile [sourceFile] command', async () => {
		try {
			// 1. Copy contract from data folder to taqueria project folder
			await exec(`cp e2e/data/hello-tacos.mligo ${taqueriaProjectPath}/contracts`);

			// 2. Register the contracts
			// await exec(`taq add-contract hello-tacos.mligo`, { cwd: `./${taqueriaProjectPath}` });

			// 2. Run taq compile ${contractName}
			await exec(`taq compile hello-tacos.mligo`, { cwd: `./${taqueriaProjectPath}` });

			// 3. Verify that compiled michelson version has been generated
			await checkFolderExistsWithTimeout(`./${taqueriaProjectPath}/artifacts/hello-tacos.tz`);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that taqueria ligo plugin can compile multiple contracts under contracts folder', async () => {
		try {
			// 1. Copy two contracts from data folder to /contracts folder under taqueria project
			await exec(`cp e2e/data/hello-tacos.mligo ${taqueriaProjectPath}/contracts/hello-tacos-one.mligo`);
			await exec(`cp e2e/data/hello-tacos.mligo ${taqueriaProjectPath}/contracts/hello-tacos-two.mligo`);

			// 2. Register the contracts
			await exec(`taq add-contract hello-tacos-one.mligo`, { cwd: `./${taqueriaProjectPath}` });
			await exec(`taq add-contract hello-tacos-two.mligo`, { cwd: `./${taqueriaProjectPath}` });

			// 3. Run taq compile ${contractName}
			await exec(`taq compile`, { cwd: `./${taqueriaProjectPath}` });

			// 4. Verify that compiled michelson version for both contracts has been generated
			await checkFolderExistsWithTimeout(`./${taqueriaProjectPath}/artifacts/hello-tacos-one.tz`);
			await checkFolderExistsWithTimeout(`./${taqueriaProjectPath}/artifacts/hello-tacos-two.tz`);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that taqueria ligo plugin will display proper message if user tries to compile contract that does not exist', async () => {
		try {
			// 1. Run taq compile ${contractName} for contract that does not exist
			const { stdout, stderr } = await exec(`taq compile test.mligo`, { cwd: `./${taqueriaProjectPath}` });

			// 2. Verify that output includes next messages:
			// There was a compilation error.
			// contracts/test.mligo: No such file or directory
			expect(stdout).toBe(contents.compileNonExistent);
			expect(stderr).toContain('contracts/test.mligo: No such file or directory');
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that taqueria ligo plugin emits error and yet displays table if contract is invalid', async () => {
		try {
			await exec(`cp e2e/data/invalid-contract.mligo ${taqueriaProjectPath}/contracts`);
			await exec(`taq add-contract invalid-contract.mligo`, { cwd: `./${taqueriaProjectPath}` });

			const { stdout, stderr } = await exec(`taq compile invalid-contract.mligo`, { cwd: `./${taqueriaProjectPath}` });

			expect(stdout).toBe(contents.compileInvalid);
			expect(stderr).toContain('File "contracts/invalid-contract.mligo", line 1, characters 23-27');
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that the LIGO contract template is instantiated with the right content and registered', async () => {
		try {
			await exec(`taq create contract counter.mligo`, { cwd: `./${taqueriaProjectPath}` });
			const artifactsContents = await exec(`ls ${taqueriaProjectPath}/contracts`);
			expect(artifactsContents.stdout).toContain('counter.mligo');

			const bytes = await fsPromises.readFile(path.join(taqueriaProjectPath, 'contracts', 'counter.mligo'));
			const digest = createHash('sha256');
			digest.update(bytes);
			const hash = digest.digest('hex');

			const configFile = path.join(taqueriaProjectPath, '.taq', 'config.json');
			const config = await fsPromises.readFile(configFile, { encoding: 'utf-8' });
			const json = JSON.parse(config);
			expect(json).toBeInstanceOf(Object);
			expect(json).toHaveProperty('contracts');
			return expect(json.contracts).toEqual({
				'counter.mligo': {
					'hash': '241556bb7f849d22564378991ce6c15ffd7fd5727620f207fb53e6dc538e66ef',
					'sourceFile': 'counter.mligo',
				},
				'hello-tacos-one.mligo': {
					'hash': '530f224fb713e4fb6d250f1c94fdc4a10a4cdde16fe02385071021637cc914e6',
					'sourceFile': 'hello-tacos-one.mligo',
				},
				'hello-tacos-two.mligo': {
					'hash': '530f224fb713e4fb6d250f1c94fdc4a10a4cdde16fe02385071021637cc914e6',
					'sourceFile': 'hello-tacos-two.mligo',
				},
				'hello-tacos.mligo': {
					'hash': '530f224fb713e4fb6d250f1c94fdc4a10a4cdde16fe02385071021637cc914e6',
					'sourceFile': 'hello-tacos.mligo',
				},
				'invalid-contract.mligo': {
					'hash': '2c7affa29be3adc8cb8b751a27a880165327e96cf8b446a9f73df323b1dceb0f',
					'sourceFile': 'invalid-contract.mligo',
				},
			});
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	// Remove all files from artifacts folder without removing folder itself
	afterEach(async () => {
		try {
			const files = await fsPromises.readdir(`${taqueriaProjectPath}/artifacts/`);
			for (const file of files) {
				await fsPromises.rm(path.join(`${taqueriaProjectPath}/artifacts/`, file));
			}
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	// Clean up process to remove taquified project folder
	// Comment if need to debug
	afterAll(async () => {
		try {
			fsPromises.rm(taqueriaProjectPath, { recursive: true });
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});
});
