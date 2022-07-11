import assert from 'assert';
import { exec } from 'child_process';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { CancellationToken, ExtensionContext, QuickPickOptions, Uri, workspace } from 'vscode';
import * as taqueriaExtension from '../../extension';
import * as MockedObject from './MockedObject';
import { sleep } from './utils/utils';

const taqRoot = path.resolve(__dirname, '../../../../../');
const projectRoot = path.resolve(__dirname, '../../../../');
const testProjectDestination = `${projectRoot}/out/vscode-taq-test-project`;
const testProjectSource = `${projectRoot}/src/test/suite/data/vscode-taq-test-project`;

const mockedMethods = {
	'window.showInformationMessage': (msg: string) => Promise.resolve(console.log(msg)),
	// 'taqueria.install': (msg: string) => Promise.resolve(console.log('Test2')),
	'window.showQuickPick': (
		_availablePlugins: readonly string[] | Thenable<readonly string[]>,
		_options: QuickPickOptions & { canPickMany: true },
		cancellationToken: CancellationToken,
	) => Promise.resolve(['@taqueria/plugin-ligo']),
	// window.showQuickPick(availablePlugins, {
	// 		canPickMany: false,
	// 		ignoreFocusOut: false,
	// 		placeHolder: 'Plugin name',
	// 		title: 'Select a plugin',
	// 	});
};

describe('Extension Test Suite', async () => {
	let vscodeMock: typeof vscode;

	before(async () => {
		// await fse.copy(testProjectSource, testProjectDestination);
		// taqueriaExtension.deactivate();
		vscodeMock = MockedObject.make(vscode, mockedMethods);
		const context: ExtensionContext = {
			subscriptions: [],
		} as any;
		await taqueriaExtension.activate(context, { vscode: vscodeMock });

		vscode.window.showInformationMessage('Start all tests.');
	});

	it.skip('Verify that Taqueria Initiate will init new taquifed  project ', async () => {
		await vscode.commands.getCommands(true).then(allCommands => {
			const taqCommands = allCommands.filter(command => command.toLowerCase().includes('taq'));
			assert.notEqual(taqCommands, undefined);
		});

		// TODO: Need to figure out if it is possible to interact with showDialogBox
		//      If no this test cannot be automated
		//      I tried to use RobotJS, but it has an issue to work with parser properly
		//      Even if I exclude it it keeps asking to rebuild it due to an old version of npm
		//      https://stackoverflow.com/questions/46384591/node-was-compiled-against-a-different-node-js-version-using-node-module-versio

		// await vscode.commands.executeCommand("taqueria.init").then( ()=>{
		// });

		// Example how to use sleep to stop VS Code for a moment
		// await sleep(60000);
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/605
	it.skip('Verify that VS Code command Taqueria Scaffold will scaffold a project', async () => {
		// Open taquified project in workspace under testProjectDestination
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(testProjectDestination));

		// Run taqueria scaffold command
		await vscode.commands.executeCommand('taqueria.scaffold');
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/686
	it.skip('Verify that VS Code command Taqueria Start Sandbox starts flextesa sandbox', async () => {
		// Open taquified project in workspace under testProjectDestination
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(testProjectDestination));

		// Install plugin
		await vscode.commands.executeCommand('taqueria.install @taqueria/plugin-flextesa');

		// Verify that
		await vscode.commands.executeCommand('taqueria.start_sandbox local');
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/686
	it.skip('Verify that VS Code command Taqueria List Accounts display accounts on running sandbox', async () => {
		await vscode.commands.executeCommand('taqueria.list_accounts local');
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/686
	it.skip('Verify that VS Code command Taqueria Stop Sandbox stops flextesa sandbox', async () => {
		await vscode.commands.executeCommand('taqueria.stop_sandbox local');
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/645
	it('Verify that VS Code command Taqueria Compile Ligo will compile Ligo contract', async () => {
		// Run taq init
		await vscodeMock.commands.executeCommand('taqueria.init');

		// Install plugin currently disabled and it will require to
		// Need to mock the function that display the quick-pick that we can return a pre-defined list
		// And then compare with expected output -
		// await vscodeMock.commands.executeCommand(`taqueria.install @taqueria/plugin-ligo`);
		// mockedMethods['window.showInformationMessage']("Hello")
		await vscodeMock.commands.executeCommand('taqueria.install');

		// Execute ligo compile command
		await vscodeMock.commands.executeCommand('taqueria.compile_ligo');

		// Run ls command
		const checkArtifact = await exec(`ls ${testProjectDestination}\artifacts`);
		// Need to find library to use contains or build it
		assert.notEqual(checkArtifact, undefined);

		// await fse.rmdir(`${projectRoot}/.vscode-test/user-data/`, {recursive: true})

		// In last test or after all block
		// vscode.commands.executeCommand("workbench.action.closeActiveEditor");
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/687
	it.skip('Verify that VS Code command Taqueria Compile SmartPy will compile SmartPy contract', async () => {
		// Open taquified project in workspace under testProjectDestination
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(testProjectDestination));

		// Install plugin
		await vscode.commands.executeCommand('taqueria.install @taqueria/plugin-smartpy');

		await vscode.commands.executeCommand('taqueria.compile_smartpy');

		const checkArtifact = await exec(`ls ${testProjectDestination}\artifacts`);
		// Need to find library to use contains or build it
		assert.notEqual(checkArtifact, undefined);
	});

	// TODO: https://github.com/ecadlabs/taqueria/issues/688
	it.skip('Verify that VS Code command Taqueria Deploy Contract will deploy contract to a test network', async () => {
		// Open taquified project in workspace under testProjectDestination
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.parse(testProjectDestination));

		// Install plugin
		await vscode.commands.executeCommand('taqueria.install @taqueria/plugin-smartpy');

		await vscode.commands.executeCommand('taqueria.deploy');
	});

	after(async () => {
		await fse.rmdir(testProjectDestination, { recursive: true });
		// Uncomment for local development
		// await fse.rmdir(`${projectRoot}/.vscode-test/user-data/`, {recursive: true})
	});
});
