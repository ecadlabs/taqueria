import { exec as nodeExec } from 'child_process';
import { readdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import util from 'util';
import { generateTestProject } from './utils/utils';
const exec = util.promisify(nodeExec);

const taqueriaProjectPath = 'e2e/taq-bootstrap';
import { expectedConfig, expectedProvisionerDeclaration, newConfig } from './data/bootstrap-contents';

const expectedProvisioner = `/// <reference types="./provisioner.d.ts" />\n`;

describe('Taqueria Bootstrap Files', () => {
	beforeAll(async () => {
		await generateTestProject(taqueriaProjectPath, []);
	});

	afterAll(async () => {
		await rm(taqueriaProjectPath, { recursive: true });
	});

	test('Assure that bootstrap files are created after running taq', async () => {
		const filesBefore = await readdir(join(taqueriaProjectPath, '.taq'));
		expect(filesBefore).toEqual(['config.json']);

		try {
			await exec('taq', { cwd: taqueriaProjectPath });
		} catch {
			// Deliberately empty
		}

		const filesAfter = await readdir(join(taqueriaProjectPath, '.taq'));
		expect(filesAfter.sort()).toEqual([
			'config.json', // config file
			'development-state.json', // state registry / persistent state for development env
			'provisioner.d.ts', // dynamic types declarations
			'provisioner.ts', // provisioner file
			'state.json', // ephemeral state
		]);
	});

	test("Assure that config file's content matches what is expected", async () => {
		const filepath = join(taqueriaProjectPath, '.taq', 'config.json');
		const actual = await readFile(filepath, { encoding: 'utf-8' });
		expect(actual).toBe(expectedConfig.trim());
	});

	test('Assure that development-state.json (state registry) matches what is expected', async () => {
		const filepath = join(taqueriaProjectPath, '.taq', 'development-state.json');
		const actual = await readFile(filepath, { encoding: 'utf-8' });
		const expected = '{}';
		expect(actual).toBe(expected);
	});

	test('Assure that provisioner.ts matches what is expected', async () => {
		const filepath = join(taqueriaProjectPath, '.taq', 'provisioner.ts');
		const actual = await readFile(filepath, { encoding: 'utf-8' });
		expect(actual).toBe(expectedProvisioner.trimStart());
	});

	test('Assure that provisioner.d.ts matches what is expected', async () => {
		const filepath = join(taqueriaProjectPath, '.taq', 'provisioner.d.ts');
		const actual = await readFile(filepath, { encoding: 'utf-8' });
		expect(actual).toBe(expectedProvisionerDeclaration.trim());
	});

	test('Assure that testing-state.json is generated when a different environment is targeted', async () => {
		const configFile = join(taqueriaProjectPath, '.taq', 'config.json');
		await writeFile(configFile, newConfig, { encoding: 'utf8' });
		try {
			await exec('taq -e testing', { cwd: taqueriaProjectPath });
		} catch {
			// Deliberately empty
		}

		const filesAfter = await readdir(join(taqueriaProjectPath, '.taq'));
		expect(filesAfter.sort()).toEqual([
			'config.json', // config file
			'development-state.json', // state registry / persistent state for development env
			'provisioner.d.ts', // dynamic types declarations
			'provisioner.ts', // provisioner file
			'state.json', // ephemeral state
			'testing-state.json', // testing state registry
		]);

		const filepath = join(taqueriaProjectPath, '.taq', 'testing-state.json');
		const actual = await readFile(filepath, { encoding: 'utf-8' });
		const expected = '{}';
		expect(actual).toBe(expected);
	});
});
