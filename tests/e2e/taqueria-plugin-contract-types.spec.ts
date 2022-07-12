import { exec as exec1 } from 'child_process';
import fsPromises from 'fs/promises';
import path from 'path';
import util from 'util';
import * as contents from './data/help-contents/contract-types-contents';
import { generateTestProject } from './utils/utils';
const exec = util.promisify(exec1);

const taqueriaProjectPath = 'e2e/auto-test-contract-types-plugin';

describe('E2E Testing for taqueria contract types plugin only', () => {
	beforeAll(async () => {
		await generateTestProject(taqueriaProjectPath, ['contract-types']);
		// TODO: This can removed after this is resolved:
		// https://github.com/ecadlabs/taqueria/issues/528
		try {
			await exec(`taq -p ${taqueriaProjectPath}`);
		} catch (_) {}
	});

	test('Verify that the contract types plugin exposes the associated commands in the help menu', async () => {
		try {
			const generateTypesHelpContents = await exec(`taq --help --projectDir=${taqueriaProjectPath}`);
			expect(generateTypesHelpContents.stdout).toBe(contents.helpContentsContractTypesPlugin);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that the contract types plugin exposes the associated options in the help menu', async () => {
		try {
			const generateTypesHelpContents = await exec(`taq generate types --help --projectDir=${taqueriaProjectPath}`);
			expect(generateTypesHelpContents.stdout).toBe(contents.helpContentsContractTypesPluginSpecific);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that the contract types plugin exposes the associated aliases in the help menu', async () => {
		try {
			const generateTypesHelpContentsGen = await exec(`taq gen --help --projectDir=${taqueriaProjectPath}`);
			expect(generateTypesHelpContentsGen.stdout).toBe(contents.helpContentsContractTypesPluginSpecific);

			const generateTypesHelpContentsGenTypes = await exec(`taq gentypes --help --projectDir=${taqueriaProjectPath}`);
			expect(generateTypesHelpContentsGenTypes.stdout).toBe(contents.helpContentsContractTypesPluginSpecific);
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});

	test('Verify that contract types plugin only outputs typeScriptDir and does not create types dir when no contracts exist', async () => {
		const generateTypesOutput = await exec(`taq generate types`, { cwd: `${taqueriaProjectPath}` });
		expect(generateTypesOutput.stdout).toContain(`generateTypes { typescriptDir: 'types' }`);

		const dirContents = await exec(`ls ${taqueriaProjectPath}`);
		expect(dirContents.stdout).not.toContain('types');
	});

	// Clean up process to remove taquified project folder
	// Comment if need to debug
	afterAll(async () => {
		try {
			await fsPromises.rm(taqueriaProjectPath, { recursive: true });
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});
});

describe('E2E Testing for taqueria contract types plugin with ligo', () => {
	beforeAll(async () => {
		await generateTestProject(taqueriaProjectPath, ['ligo', 'contract-types']);
		// TODO: This can removed after this is resolved:
		// https://github.com/ecadlabs/taqueria/issues/528
		try {
			await exec(`taq -p ${taqueriaProjectPath}`);
		} catch (_) {}
	});

	test('Verify that taqueria contract types plugin can compile one contract and generate types', async () => {
		const pwdPromise = await exec(`pwd`);
		const pwd = pwdPromise.stdout.trim();

		await exec(`cp e2e/data/increment.jsligo ${taqueriaProjectPath}/contracts`);
		await exec(`taq compile`, { cwd: `${taqueriaProjectPath}` });

		// TODO:
		// Related to issue #736 above, when investigating I found that
		// `generateTypesOutput.stdout` has been truncated - its just one
		// line of output which is why the expect assertion fails.
		// However, when I run the `generate types` task manually I see all
		// lines of output
		const generateTypesOutput = await exec(`taq generate types`, { cwd: `${taqueriaProjectPath}` });
		expect(generateTypesOutput.stdout).toContain(`generateTypes { typescriptDir: 'types' }`);

		expect(generateTypesOutput.stdout).toContain(
			`Generating Types: ${pwd}/${taqueriaProjectPath}/artifacts => ${pwd}/${taqueriaProjectPath}/types`,
		);

		expect(generateTypesOutput.stdout).toContain(
			`Contracts Found: \n\t- ${pwd}/${taqueriaProjectPath}/artifacts/increment.tz`,
		);

		expect(generateTypesOutput.stdout).toContain(`Processing /increment.tz...`);
		expect(generateTypesOutput.stdout).toContain(`increment.tz: Types generated`);

		const dirContents = await exec(`ls ${taqueriaProjectPath}`);
		expect(dirContents.stdout).toContain('types');

		const typesContents = await exec(`ls ${taqueriaProjectPath}/types`);
		expect(typesContents.stdout).toContain('increment.code.ts');
		expect(typesContents.stdout).toContain('increment.types.ts');
		expect(typesContents.stdout).toContain('type-aliases.ts');
		expect(typesContents.stdout).toContain('type-utils.ts');
	});

	test('Verify that taqueria contract types plugin allows for different types folder specification', async () => {
		const pwdPromise = await exec(`pwd`);
		const pwd = pwdPromise.stdout.trim();
		const folderName = 'otherFolder';

		await exec(`cp e2e/data/increment.jsligo ${taqueriaProjectPath}/contracts`);
		await exec(`taq compile`, { cwd: `${taqueriaProjectPath}` });

		const generateTypesOutput = await exec(`taq generate types ${folderName}`, { cwd: `${taqueriaProjectPath}` });
		expect(generateTypesOutput.stdout).toContain(`generateTypes { typescriptDir: '${folderName}' }`);

		expect(generateTypesOutput.stdout).toContain(
			`Generating Types: ${pwd}/${taqueriaProjectPath}/artifacts => ${pwd}/${taqueriaProjectPath}/${folderName}`,
		);

		const dirContents = await exec(`ls ${taqueriaProjectPath}`);
		expect(dirContents.stdout).toContain(`${folderName}`);

		const typesContents = await exec(`ls ${taqueriaProjectPath}/${folderName}`);
		expect(typesContents.stdout).toContain('increment.code.ts');
		expect(typesContents.stdout).toContain('increment.types.ts');
		expect(typesContents.stdout).toContain('type-aliases.ts');
		expect(typesContents.stdout).toContain('type-utils.ts');
	});

	test('Verify that taqueria contract types plugin can compile multiple contracts and generate types', async () => {
		const pwdPromise = await exec(`pwd`);
		const pwd = pwdPromise.stdout.trim();

		await exec(`cp e2e/data/increment.jsligo ${taqueriaProjectPath}/contracts`);
		await exec(`cp e2e/data/hello-tacos.mligo ${taqueriaProjectPath}/contracts`);
		await exec(`taq compile`, { cwd: `${taqueriaProjectPath}` });

		const generateTypesOutput = await exec(`taq generate types`, { cwd: `${taqueriaProjectPath}` });
		expect(generateTypesOutput.stdout).toContain(`generateTypes { typescriptDir: 'types' }`);
		expect(generateTypesOutput.stdout).toContain(
			`Generating Types: ${pwd}/${taqueriaProjectPath}/artifacts => ${pwd}/${taqueriaProjectPath}/types`,
		);

		expect(generateTypesOutput.stdout).toContain(
			`Contracts Found: \n\t- ${pwd}/${taqueriaProjectPath}/artifacts/increment.tz`,
		);
		expect(generateTypesOutput.stdout).toContain(
			`Contracts Found: \n\t- ${pwd}/${taqueriaProjectPath}/artifacts/hello-tacos.tz`,
		);

		expect(generateTypesOutput.stdout).toContain(`Processing /increment.tz...`);
		expect(generateTypesOutput.stdout).toContain(`Processing /hello-tacos.tz...`);
		expect(generateTypesOutput.stdout).toContain(`increment.tz: Types generated`);
		expect(generateTypesOutput.stdout).toContain(`hello-tacos.tz: Types generated`);
	});

	test(
		'Verify that users can properly use the generated types (involves origination to a testnet and calling an entrypoint, which will take a while)',
		async () => {
			await exec(`cp e2e/data/timelock.tz ${taqueriaProjectPath}/artifacts`);
			await exec(`taq generate types`, { cwd: `${taqueriaProjectPath}` });
			await exec(`cp e2e/data/timelock.ts ${taqueriaProjectPath}/types`);
			await exec(`cp e2e/data/tsconfig.timelock.json ${taqueriaProjectPath}/types`);
			await exec(`npm init -y`, { cwd: `./${taqueriaProjectPath}/types` });
			await exec(`npx tsc --project tsconfig.timelock.json`, { cwd: `./${taqueriaProjectPath}/types` });
			const { stdout, stderr } = await exec(`node timelock.js`, { cwd: `./${taqueriaProjectPath}/types` });
			expect(stdout).toBe('initialStorage: 00 , newStorage: 050080890f\n');
			expect(stderr).toBe('');
		},
	);

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
			await fsPromises.rm(taqueriaProjectPath, { recursive: true });
		} catch (error) {
			throw new Error(`error: ${error}`);
		}
	});
});
