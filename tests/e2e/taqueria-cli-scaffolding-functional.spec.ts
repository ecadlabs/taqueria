import { exec as exec1 } from 'child_process';
import fsPromises from 'fs/promises';
import util from 'util';
const exec = util.promisify(exec1);

const scaffoldDirName = `taqueria-taco-shop`;

describe('E2E Testing for taqueria scaffolding initialization,', () => {
	beforeAll(async () => {
		await exec('taq scaffold');
		await exec(`cd ${scaffoldDirName} && npm run setup`);
	});

	test('Verify that scaffold project is set up after running setup', async () => {
		const appContents = await exec(`ls ${scaffoldDirName}/app`);
		const taqContents = await exec(`ls ${scaffoldDirName}`);
		expect(appContents.stdout).toContain('node_modules');
		expect(taqContents.stdout).toContain('node_modules');
		expect(taqContents.stdout).toContain('contracts');
		expect(taqContents.stdout).toContain('artifacts');
	});
	test('Verify that scaffold project compiles contracts as part of setup', async () => {
		const taqContents = await exec(`ls ${scaffoldDirName}/artifacts`);
		expect(taqContents.stdout).toContain('hello-tacos.tz');
	});

	test('Verify that scaffold project can start and stop taqueria locally', async () => {
		const startResults = await exec(`taq start sandbox local`, {cwd: `${scaffoldDirName}`});
		expect(startResults.stdout).toContain('Started local.');

		const stopResults = await exec(`taq stop sandbox local`, {cwd: `${scaffoldDirName}`});
		expect(stopResults.stdout).toContain('Stopped local.');
	});

	afterAll(async () => {
		await fsPromises.rm(`${scaffoldDirName}`, { recursive: true });
	});
});
