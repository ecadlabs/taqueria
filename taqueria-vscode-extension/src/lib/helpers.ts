import loadI18n, { i18n } from '@taqueria/protocol/i18n';
import { TaqError } from '@taqueria/protocol/TaqError';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { stat } from 'fs/promises';
import path, { join } from 'path';
import * as api from 'vscode';
import { ArtifactsDataProvider, ArtifactTreeItem } from './gui/ArtifactsDataProvider';
import { ContractTreeItem } from './gui/ContractsDataProvider';
import { ContractsDataProvider } from './gui/ContractsDataProvider';
import { EnvironmentTreeItem } from './gui/EnvironmentsDataProvider';
import { EnvironmentsDataProvider } from './gui/EnvironmentsDataProvider';
import { PluginsDataProvider, PluginTreeItem } from './gui/PluginsDataProvider';
import { SandboxesDataProvider, SandboxTreeItem } from './gui/SandboxesDataProvider';
import * as Util from './pure';
import { TaqVsxError } from './TaqVsxError';

export const COMMAND_PREFIX = 'taqueria.';

export enum Commands {
	init = 'taqueria.init',
	scaffold = 'taqueria.scaffold',
	install = 'taqueria.install',
	uninstall = 'taqueria.uninstall',
	optIn = 'taqueria.optIn',
	optOut = 'taqueria.optOut',
	originate = 'taqueria.originate',
}

export enum OutputLevels {
	output,
	fatal,
	error,
	warn,
	info,
	debug,
	trace,
}

export type OutputFunction = (currentLogLevel: OutputLevels, log: string) => void;

const outputLevelsOrder = [
	OutputLevels.trace,
	OutputLevels.debug,
	OutputLevels.info,
	OutputLevels.warn,
	OutputLevels.error,
	OutputLevels.fatal,
	OutputLevels.output,
];

const shouldOutput = (currentLogLevel: OutputLevels, configuredLogLevel: OutputLevels) => {
	const currentLogIndex = outputLevelsOrder.indexOf(currentLogLevel);
	const configuredLogIndex = outputLevelsOrder.indexOf(configuredLogLevel);
	return currentLogIndex >= configuredLogIndex;
};

export type Output = {
	outputChannel: api.OutputChannel;
	logLevel: OutputLevels;
	logChannel: api.OutputChannel;
};

type VSCodeAPI = typeof api;

export interface InjectedDependencies {
	vscode: VSCodeAPI;
}

export const sanitizeDeps = (deps?: InjectedDependencies) =>
	deps
		? deps
		: { vscode: api };

export const showOutput = (output: Output) => {
	return (data: string) => {
		output.outputChannel.appendLine(data);
		output.outputChannel.show();
	};
};

export const showLog = (output: Output) => {
	return (currentOutputLevel: OutputLevels, data: string) => {
		if (!shouldOutput(currentOutputLevel, output.logLevel)) {
			return;
		}
		output.logChannel.appendLine(data);
	};
};

export interface HasFileName {
	fileName: string;
}

export interface HasRefresh {
	refresh(): void;
}

export function mapAsync<T, U>(
	array: T[],
	callbackfn: (value: T, index: number, array: T[]) => Promise<U>,
): Promise<U[]> {
	return Promise.all(array.map(callbackfn));
}

export async function filterAsync<T>(
	array: T[],
	callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>,
): Promise<T[]> {
	const filterMap = await mapAsync(array, callbackfn);
	return array.filter((value, index) => filterMap[index]);
}

export type TaskTitles = {
	progressTitle: string;
	finishedTitle: string;
};

export class VsCodeHelper {
	private constructor(
		private context: api.ExtensionContext,
		private vscode: VSCodeAPI,
		private outputChannel: api.OutputChannel,
		private output: Output,
		private i18: i18n,
		private folders: readonly api.WorkspaceFolder[],
	) {}

	static async construct(context: api.ExtensionContext, deps: InjectedDependencies) {
		const vscode = deps.vscode;
		const logLevelText = process.env.LogLevel ?? OutputLevels[OutputLevels.warn];
		const logLevel = OutputLevels[logLevelText as keyof typeof OutputLevels] ?? OutputLevels.warn;
		const outputChannel = vscode.window.createOutputChannel('Taqueria');
		const logChannel = vscode.window.createOutputChannel('Taqueria Logs');
		const output = {
			outputChannel,
			logChannel,
			logLevel,
		};
		showLog(output)(OutputLevels.info, 'the activate function was called for the Taqueria VsCode Extension.');

		const i18n = await loadI18n();

		const folders = vscode.workspace.workspaceFolders
			? vscode.workspace.workspaceFolders
			: [];

		return new VsCodeHelper(context, vscode, outputChannel, output, i18n, folders);
	}

	get i18n() {
		return this.i18;
	}

	getFolders() {
		return this.folders;
	}

	getOutput() {
		return showOutput(this.output);
	}

	getLog() {
		return showLog(this.output);
	}

	showOutput(data: string) {
		return showOutput(this.output)(data);
	}

	showLog(currentOutputLevel: OutputLevels, data: string) {
		return showLog(this.output)(currentOutputLevel, data);
	}

	exposeInitTask() {
		this.registerCommand(Commands.init, async () => {
			const uri = await this.getFolderForInitOrScaffold('init');
			if (uri === undefined) {
				return;
			}
			await this.proxyToTaqAndShowOutput(
				`init ${uri.path}`,
				{
					finishedTitle: `Taqified folder ${uri.fsPath}`,
					progressTitle: `Taqifying folder ${uri.fsPath}`,
				},
				uri.path as Util.PathToDir,
				false,
			);
			try {
				await this.proxyToTaq(``, uri.path as Util.PathToDir);
			} catch {
				// Ignored
			}
			await this.updateCommandStates(uri.path as Util.PathToDir);
			this.vscode.workspace.updateWorkspaceFolders(0, undefined, { uri });
		});
	}

	exposeScaffoldTask() {
		this.registerCommand(Commands.scaffold, async () => {
			const availableScaffolds: { name: string; url: string }[] = await this.getAvailableScaffolds();
			const projectUri = await this.getFolderForInitOrScaffold('scaffold');
			if (projectUri === undefined) {
				return;
			}
			const scaffold = await this.promptForScaffoldSelection(
				this.i18,
				api.debug.activeDebugSession,
				availableScaffolds.map(template => template.name),
			);
			if (scaffold === null) {
				return;
			}
			const scaffoldUrl = availableScaffolds.find(template => template.name === scaffold)?.url;
			if (scaffoldUrl === undefined) {
				return;
			}
			const projectDir = await Util.makeDir(projectUri.path, this.i18);
			await this.proxyToTaqAndShowOutput(
				`scaffold ${scaffoldUrl} ${projectDir}`,
				{
					finishedTitle: `scaffolded ${scaffoldUrl}`,
					progressTitle: `scaffolding ${scaffoldUrl}`,
				},
				projectDir,
				false,
			);
			await this.proxyToTaq(``, projectDir);
			await this.updateCommandStates(projectDir);
		});
	}

	async getTaqifiedDirectories() {
		const taqified = await filterAsync([...this.folders], async folder => {
			try {
				const taqifiedPath = join(folder.uri.path, '.taq');
				await stat(taqifiedPath);
				return true;
			} catch (e: unknown) {
				return false;
			}
		});

		return await mapAsync(taqified, folder => Util.makeDir(folder.uri.path, this.i18));
	}

	async getFolderForInitOrScaffold(
		taskTitle: string,
	) {
		let uris: api.Uri[] | undefined = this.folders.map(folder => folder.uri);
		if (uris.length === 0) {
			uris = await this.vscode.window.showOpenDialog({
				canSelectFolders: true,
				canSelectFiles: false,
				openLabel: 'Select project folder',
				title: `Select a project folder to ${taskTitle} into`,
				canSelectMany: false,
			});
			if (uris === undefined) {
				return undefined;
			}
		}

		if (uris.length === 0) {
			return undefined;
		}
		if (uris.length === 1) {
			return uris[0];
		} else {
			this.vscode.window.showWarningMessage(
				`Error: running ${taskTitle} with multiple open folders is not yet implemented.`,
			);
			return undefined;
		}
	}

	async getFolderForTasksOnTaqifiedFolders(taskTitle: string) {
		const taqifiedDirectories = await this.getTaqifiedDirectories();

		if (taqifiedDirectories.length === 0) {
			// The developer has no taqified workspace folders. As such,
			// we cannot proceed
			this.showError({
				kind: 'E_NO_TAQUERIA_PROJECTS',
				msg:
					`You don't have any Taqueria projects. You'll need to taq'ify a project using \"Taqueria: Init\" and open the folder in VsCode before you can ${taskTitle}.`,
			});
			return undefined;
		}

		if (taqifiedDirectories.length === 1) {
			// The developer has a single taqified workspace folder, so we know
			// exactly where to install a plugin
			return taqifiedDirectories[0];
		}

		// The developer has multiple taqified folders
		const selectedDir = await this.promptForTaqProject(taqifiedDirectories);
		if (!selectedDir) {
			return undefined;
		}
		return await Util.makeDir(selectedDir, this.i18);
	}

	async getPathForPluginSource(pluginName: string) {
		if (pluginName && process.env.InstallDevPlugins === 'true') {
			const pathToTaq = await this.getTaqBinPath();
			const taqFolder = path.dirname(pathToTaq);
			const pluginFolder = pluginName.replace('@', '').replace('/', '-');
			const pluginPath = path.join(taqFolder, pluginFolder);
			return pluginPath;
		}
		return pluginName;
	}

	async promptForPluginInstallation(
		projectDir: Util.PathToDir,
	) {
		const availablePlugins = await this.getAvailablePlugins();
		const config = await Util.TaqifiedDir.create(projectDir, this.i18);
		const availablePluginsNotInstalled = config.config?.plugins
			? availablePlugins.filter(name => config.config.plugins?.findIndex(p => p.name === name) === -1)
			: availablePlugins;
		const pluginName = await this.vscode.window.showQuickPick(availablePluginsNotInstalled, {
			canPickMany: false,
			ignoreFocusOut: false,
			placeHolder: 'Plugin name',
			title: 'Select a plugin',
		});
		return pluginName;
	}

	async promptForPluginUninstall(
		projectDir: Util.PathToDir,
	) {
		const config = await Util.TaqifiedDir.create(projectDir, this.i18);
		if (!config.config || !config.config.plugins || !config.config.plugins.length) {
			return undefined;
		}
		const pluginNames = config.config.plugins.map(plugin => plugin.name);
		const selectedPluginName = await this.vscode.window.showQuickPick(pluginNames, {
			canPickMany: false,
			ignoreFocusOut: false,
			placeHolder: 'Plugin name',
			title: 'Select a plugin',
		});
		return selectedPluginName;
	}

	promptForScaffoldSelection(_i18n: i18n, _debug: api.DebugSession | undefined, availablePlugins: string[]) {
		return this.vscode.window.showQuickPick(availablePlugins, {
			canPickMany: false,
			ignoreFocusOut: false,
			placeHolder: 'Scaffold name',
			title: 'Select a scaffold',
		});
	}

	promptForTaqProject(availableProjects: readonly string[]) {
		return this.vscode.window.showQuickPick(availableProjects, {
			canPickMany: false,
			ignoreFocusOut: false,
			title: 'Select a project',
			placeHolder: 'Directory',
		});
	}

	getWellKnownPlugins() {
		return [
			'@taqueria/plugin-ligo',
			'@taqueria/plugin-smartpy',
			'@taqueria/plugin-taquito',
			'@taqueria/plugin-flextesa',
			'@taqueria/plugin-archetype',
			'@taqueria/plugin-contract-types',
			'@taqueria/plugin-tezos-client',
			'@taqueria/plugin-jest',
		];
	}

	async getAvailablePlugins() {
		try {
			const HOME_DIR = process.env.HOME;
			if (HOME_DIR) {
				const availablePluginsFile = join(HOME_DIR, 'taqueria-plugins.json');
				const contents = await readFile(availablePluginsFile, { encoding: 'utf-8' });
				const decoded = JSON.parse(contents);
				return decoded as string[];
			}
		} catch {
			// Ignore
		}
		return this.getWellKnownPlugins();
	}

	async getAvailableScaffolds() {
		return [
			{
				name: 'Quick Start',
				url: 'https://github.com/ecadlabs/taqueria-scaffold-quickstart',
			},
			{
				name: 'Demo',
				url: 'https://github.com/ecadlabs/taqueria-scaffold-demo',
			},
			{
				name: 'Taco Shop',
				url: 'https://github.com/ecadlabs/taqueria-scaffold-taco-shop',
			},
			{
				name: 'Hello Tacos Tutorial',
				url: 'https://github.com/ecadlabs/taqueria-scaffold-hello-tacos-tutorial',
			},
			{
				name: 'NFT',
				url: 'https://github.com/ecadlabs/taqueria-scaffold-nft',
			},
		];
	}

	async exposeInstallTask() {
		this.registerCommand(Commands.install, async (pluginInfo?: PluginTreeItem | undefined) => {
			const projectDir = await this.getFolderForTasksOnTaqifiedFolders('install');
			if (projectDir === undefined) {
				return;
			}
			let pluginName = pluginInfo?.label;
			if (!pluginName) {
				pluginName = await this.promptForPluginInstallation(projectDir);
				if (!pluginName) {
					return;
				}
			}
			pluginName = await this.getPathForPluginSource(pluginName);
			await this.proxyToTaqAndShowOutput(
				`install ${pluginName}`,
				{
					finishedTitle: `installed ${pluginName}`,
					progressTitle: `installing ${pluginName}`,
				},
				projectDir,
				false,
			);
		});
	}

	async exposeUninstallTask() {
		this.registerCommand(Commands.uninstall, async (pluginInfo?: PluginTreeItem | undefined) => {
			const projectDir = await this.getFolderForTasksOnTaqifiedFolders('install');
			if (projectDir === undefined) {
				return;
			}
			let pluginName = pluginInfo?.label;
			if (!pluginName) {
				pluginName = await this.promptForPluginUninstall(projectDir);
			}
			if (!pluginName) {
				return;
			}
			await this.proxyToTaqAndShowOutput(
				`uninstall ${pluginName}`,
				{
					finishedTitle: `uninstalled ${pluginName}`,
					progressTitle: `uninstalling ${pluginName}`,
				},
				projectDir,
				false,
			);
		});
	}

	getArtifactFileNameFromContract(fileName: string) {
		return fileName.replace(/\.[^/.]+$/, '') + '.tz';
	}

	async exposeOriginateTask() {
		this.registerCommand(Commands.originate, async (arg?: ArtifactTreeItem | EnvironmentTreeItem | undefined) => {
			const projectDir = await this.getFolderForTasksOnTaqifiedFolders('install');
			if (projectDir === undefined) {
				return;
			}
			let environmentName: string | undefined = undefined;
			let fileName: string | undefined = undefined;
			if (arg) {
				if (arg instanceof EnvironmentTreeItem) {
					environmentName = arg.label;
				}
				if (arg instanceof ArtifactTreeItem) {
					fileName = arg.fileName;
				}
			}
			if (!environmentName) {
				const config = await Util.TaqifiedDir.create(projectDir, this.i18);
				const environmentNames = [...Object.keys(config.config?.environment ?? {})].filter(x => x !== 'default');
				environmentName = await this.vscode.window.showQuickPick(environmentNames, {
					canPickMany: false,
					ignoreFocusOut: false,
					placeHolder: 'Environment Name',
					title: 'Select an environment',
				});
				if (!environmentName) {
					return;
				}
			}
			await this.proxyToTaqAndShowOutput(
				`originate -e ${environmentName} ${fileName ?? ''}`,
				{
					finishedTitle: 'originated contracts',
					progressTitle: 'originating contracts',
				},
				projectDir,
				true,
			);
		});
	}

	async getTaqBinPath() {
		let providedPath = this.vscode.workspace.getConfiguration('taqueria').get('path', '');
		if (!providedPath || (providedPath as string).length === 0) {
			providedPath = await Util.findTaqBinary(this.i18, this.getLog());
		}
		return Util.makePathToTaq(this.i18, this.getLog())(providedPath);
	}

	registerCommand(cmdId: string, callback: (...args: any[]) => any) {
		this.context.subscriptions.push(
			this.vscode.commands.registerCommand(cmdId, async (...args: any[]) => {
				try {
					const result = callback(...args);
					if (result.then) {
						await result;
					}
				} catch (e: any) {
					this.notifyAndLogError(`Error while running ${cmdId}`, e);
				}
			}),
		);
	}

	showError(err: TaqVsxError) {
		Util.log('Error:')(err);
		return (err.context
			? this.vscode.window.showErrorMessage(err.msg, err.context)
			: this.vscode.window.showErrorMessage(err.msg))
			.then(_ => Promise.resolve()) as Promise<void>;
	}

	async workspaceHasTaqFolder() {
		if (this.folders.length === 0) {
			return false;
		}
		const folder = this.folders[0];
		try {
			await Util.makeDir(path.join(folder.uri.path, '.taq'), this.i18);
			return true;
		} catch (_: unknown) {
			return false;
		}
	}

	async notifyAndLogError(message: string, err: TaqVsxError | TaqError | Error | unknown) {
		const hasTaqFolder = await this.workspaceHasTaqFolder();
		if (hasTaqFolder) {
			this.vscode.window.showErrorMessage(`${message}\nPlease check out the output window for diagnostics information`);
		}
		this.logAllNestedErrors(err, !hasTaqFolder);
	}

	logAllNestedErrors(err: TaqVsxError | TaqError | Error | unknown, suppressWindow?: boolean | undefined) {
		const outputLevel = suppressWindow ? OutputLevels.debug : OutputLevels.error;
		if (!err) {
			return;
		}
		try {
			if (!shouldOutput(outputLevel, this.output.logLevel)) {
				return;
			}
			this.output.logChannel.appendLine(JSON.stringify(err, undefined, 4));
			if (!suppressWindow) {
				this.output.logChannel.show();
			}
		} catch {
			try {
				this.output.logChannel.appendLine(`unknown error occurred while trying to log an error.`);
			} catch {
				// at this point, we cannot do anything
			}
		}
	}

	exposeTypecheckCommand() {
		this.registerCommand(COMMAND_PREFIX + 'typecheck', async (arg: SandboxTreeItem | ContractTreeItem | undefined) => {
			const projectDir = await this.getFolderForTasksOnTaqifiedFolders('install');
			if (projectDir === undefined) {
				return;
			}
			let fileName: string | undefined = undefined;
			let sandboxName: string | undefined = undefined;
			if (arg) {
				if (arg instanceof SandboxTreeItem) {
					sandboxName = arg.label;
				}
				if (arg instanceof ContractTreeItem) {
					fileName = this.getArtifactFileNameFromContract(arg.fileName);
				}
			}
			if (!sandboxName) {
				const config = await Util.TaqifiedDir.create(projectDir, this.i18);
				const sandboxNames = [...Object.keys(config?.config?.sandbox ?? {})];
				if (sandboxNames.length === 1) {
					sandboxName = sandboxNames[0];
				} else {
					sandboxName = await this.vscode.window.showQuickPick(sandboxNames, {
						canPickMany: false,
						ignoreFocusOut: false,
						placeHolder: 'Sandbox Name',
						title: 'Select a sandbox',
					});
					if (!sandboxName) {
						return;
					}
				}
			}
			await this.proxyToTaqAndShowOutput(
				`typecheck -s ${sandboxName} ${fileName ?? ''}`,
				{
					finishedTitle: 'checked contract types',
					progressTitle: 'checking types',
				},
				projectDir,
				true,
			);
		});
	}

	getSandboxNames(projectDir: Util.TaqifiedDir) {
		return projectDir.config.sandbox
			? Object.keys(projectDir.config.sandbox)
			: [];
	}

	private _currentlyRunningTask: string | undefined;

	async proxyToTaqAndShowOutput(
		taskWithArgs: string,
		taskTitles: TaskTitles,
		projectDir: Util.PathToDir | undefined,
		logStandardErrorToOutput: boolean | undefined,
	) {
		if (this._currentlyRunningTask !== undefined) {
			this.vscode.window.showErrorMessage(
				`Taqueria is currently busy ${this._currentlyRunningTask}. Please wait for it to finish before running another command.`,
			);
			return;
		}
		this.vscode.window.withProgress({
			location: this.vscode.ProgressLocation.Notification,
			cancellable: false,
			title: `Taqueria is ${taskTitles.progressTitle}`,
		}, async progress => {
			this._currentlyRunningTask = taskTitles.progressTitle;
			progress.report({ increment: 0 });
			try {
				const result = await this.proxyToTaq(taskWithArgs, projectDir);
				if (result.executionError) {
					this.logAllNestedErrors(result.executionError);
				}
				if (result.standardError) {
					if (logStandardErrorToOutput) {
						this.showOutput(result.standardError);
					} else {
						this.showLog(OutputLevels.warn, result.standardError);
					}
				}
				if (result.standardOutput) {
					this.showOutput(result.standardOutput);
				}
				if (result.executionError || result.standardError) {
					this.vscode.window.showWarningMessage(
						`Warnings while ${taskTitles.progressTitle}. Please check the Taqueria Log window for diagnostics information.`,
					);
				} else {
					this.vscode.window.showInformationMessage(`Successfully ${taskTitles.finishedTitle}.`);
				}
			} catch (e: unknown) {
				this.vscode.window.showErrorMessage(
					`Error while ${taskTitles.progressTitle}. Please check the Taqueria Log window for diagnostics information.`,
				);
				this.logAllNestedErrors(e);
			}
			progress.report({ increment: 100 });
			this._currentlyRunningTask = undefined;
		});
	}

	async proxyToTaq(taskWithArgs: string, projectDir?: Util.PathToDir | undefined) {
		const pathToTaq = await this.getTaqBinPath();
		if (projectDir) {
			return await Util.execCmd(
				`${pathToTaq} -p ${projectDir} --fromVsCode ${taskWithArgs}`,
				this.getLog(),
				projectDir,
			);
		} else {
			return await Util.execCmd(`${pathToTaq} --fromVsCode ${taskWithArgs}`, this.getLog());
		}
	}

	exposeTaqTaskAsCommandWithOptionalFileArgument(
		cmdId: string,
		taskWithArgs: string,
		outputTo: 'output' | 'notify',
		taskTitles: TaskTitles,
		projectDir?: Util.PathToDir,
	) {
		this.registerCommand(
			cmdId,
			async (item?: HasFileName | undefined) => {
				const pathToTaq = await this.getTaqBinPath();
				if (item) {
					taskWithArgs = `${taskWithArgs} ${item.fileName}`;
				}
				await this.proxyToTaqAndShowOutput(taskWithArgs, taskTitles, projectDir, outputTo === 'output');
			},
		);
	}

	exposeTaqTaskAsCommand(
		cmdId: string,
		taskWithArgs: string,
		outputTo: 'output' | 'notify',
		taskTitles: TaskTitles,
		projectDir?: Util.PathToDir,
	) {
		this.registerCommand(
			cmdId,
			async () => {
				await this.proxyToTaqAndShowOutput(taskWithArgs, taskTitles, projectDir, outputTo === 'output');
			},
		);
	}

	async exposeSandboxTaskAsCommand(
		cmdId: string,
		taskName: string,
		taskTitles: TaskTitles,
		outputTo: 'output' | 'notify',
		projectDir: Util.PathToDir,
		otherNotification?: string,
	) {
		this.registerCommand(cmdId, async (sandbox?: SandboxTreeItem | undefined) => {
			let sandboxName = sandbox?.label;
			if (!sandboxName) {
				const taqifiedDir = await Util.TaqifiedDir.create(projectDir, this.i18);
				const sandboxes = this.getSandboxNames(taqifiedDir);
				sandboxName = await this.vscode.window.showQuickPick(sandboxes, {
					canPickMany: false,
					ignoreFocusOut: false,
					placeHolder: 'Sandbox name',
					title: 'Select a sandbox',
				});
			}
			if (!sandboxName) {
				return;
			}
			await this.proxyToTaqAndShowOutput(`${taskName} ${sandboxName}`, taskTitles, projectDir, false);
			this.sandboxesDataProvider?.refresh();
		});
	}

	async updateCommandStates(projectDir?: Util.PathToDir | undefined) {
		if (projectDir === undefined) {
			this.showLog(OutputLevels.debug, 'No folder is open, enabling init and scaffold');
			this.vscode.commands.executeCommand(
				'setContext',
				'@taqueria-state/enable-init-scaffold',
				true,
			);
			return;
		}
		this.dataProviders.forEach(dataProvider => dataProvider.refresh());

		this.showLog(OutputLevels.debug, 'Project config changed, updating command states...');
		let taqFolderFound: boolean;
		try {
			await Util.makeDir(join(projectDir, '.taq'), this.i18);
			this.showLog(OutputLevels.debug, 'Taq folder is found');
			taqFolderFound = true;
		} catch {
			taqFolderFound = false;
			this.showLog(OutputLevels.debug, 'Taq folder not found');
		}
		let enableAllCommands: boolean;
		let config: Util.TaqifiedDir | null;
		try {
			config = await Util.TaqifiedDir.create(projectDir, this.i18);
			enableAllCommands = false;
		} catch (e: unknown) {
			config = null;
			enableAllCommands = taqFolderFound;
			// We don't want to show messages to users when they are working with non-taqified folders (Except when output level is set to info or more verbose)
			if (shouldOutput(OutputLevels.info, this.output.logLevel) || taqFolderFound) {
				this.vscode.commands.executeCommand('setContext', '@taqueria-state/enable-all-commands', true);
				this.showLog(OutputLevels.error, 'Error: Could not update command states:');
				this.logAllNestedErrors(e);
				if (taqFolderFound) {
					this.showLog(
						OutputLevels.warn,
						'The Taqueria config for this project could not be loaded. All Taqueria commands will be temporarily enabled.\nPlease check for errors in the .taq/config.json file\n',
					);
				}
			}
		}
		const availablePlugins = await this.getAvailablePlugins();
		const availablePluginsNotInstalled = config?.config?.plugins
			? availablePlugins.filter(name => config?.config.plugins?.findIndex(p => p.name === name) === -1)
			: availablePlugins;
		this.showLog(
			OutputLevels.debug,
			`@taqueria-state/enable-init-scaffold: ${enableAllCommands || !config?.config}`,
		);
		this.vscode.commands.executeCommand(
			'setContext',
			'@taqueria-state/enable-init-scaffold',
			enableAllCommands || !config?.config,
		);

		this.showLog(
			OutputLevels.debug,
			`@taqueria-state/enable-install-uninstall: ${enableAllCommands || !!config?.config}`,
		);
		this.vscode.commands.executeCommand(
			'setContext',
			'@taqueria-state/enable-install-uninstall',
			enableAllCommands || !!config?.config,
		);

		this.showLog(OutputLevels.debug, `@taqueria-state/is-taqified: ${!!config?.config}`);
		this.vscode.commands.executeCommand('setContext', '@taqueria-state/is-taqified', !!config?.config);

		this.vscode.commands.executeCommand(
			'setContext',
			'@taqueria-state/installed-plugin-count',
			enableAllCommands ? 1 : config?.config?.plugins?.length ?? 0,
		);
		this.vscode.commands.executeCommand(
			'setContext',
			'@taqueria-state/not-installed-plugin-count',
			enableAllCommands ? 1 : availablePluginsNotInstalled.length,
		);
		const plugins = this.getWellKnownPlugins();
		this.showLog(OutputLevels.debug, `Known plugins: ${JSON.stringify(plugins)}`);
		for (const plugin of plugins) {
			const found = config?.config?.plugins?.find(item => item.name === plugin) !== undefined;
			this.showLog(OutputLevels.debug, `plugins ${plugin}: ${found}`);
			this.vscode.commands.executeCommand('setContext', plugin, enableAllCommands || found);
		}
	}

	createWatcherIfNotExists(
		projectDir: Util.PathToDir,
		addConfigWatcherIfNotExists: (folder: string, factory: () => api.FileSystemWatcher[]) => void,
	) {
		this.showLog(OutputLevels.debug, `Directory ${projectDir} should be watched.`);
		addConfigWatcherIfNotExists(projectDir, () => {
			this.showLog(OutputLevels.info, `Adding watchers for directory ${projectDir}.`);
			try {
				this.updateCommandStates(projectDir);
			} catch (error: any) {
				this.logAllNestedErrors(error);
			}
			try {
				const folderWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, '.taq'));
				const configWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, '.taq/config.json'));
				const stateWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, '.taq/state.json'));

				const contractsFolderWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, 'contracts'));
				const contractsWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, 'contracts/*'));

				const artifactsFolderWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, 'artifacts'));
				const artifactsWatcher = this.vscode.workspace.createFileSystemWatcher(join(projectDir, 'artifacts/*'));

				// TODO: Is passing these arguments to the callback of a long lived watcher prevent GC? Are these short lived objects?
				folderWatcher.onDidChange((e: api.Uri) => this.updateCommandStates(projectDir));
				folderWatcher.onDidCreate((e: api.Uri) => this.updateCommandStates(projectDir));
				folderWatcher.onDidDelete((e: api.Uri) => this.updateCommandStates(projectDir));

				configWatcher.onDidChange((e: api.Uri) => this.updateCommandStates(projectDir));
				configWatcher.onDidCreate((e: api.Uri) => this.updateCommandStates(projectDir));
				configWatcher.onDidDelete((e: api.Uri) => this.updateCommandStates(projectDir));

				stateWatcher.onDidChange((e: api.Uri) => this.updateCommandStates(projectDir));
				stateWatcher.onDidCreate((e: api.Uri) => this.updateCommandStates(projectDir));
				stateWatcher.onDidDelete((e: api.Uri) => this.updateCommandStates(projectDir));

				contractsFolderWatcher.onDidChange(_ => this.contractsDataProvider?.refresh());
				contractsFolderWatcher.onDidCreate(_ => this.contractsDataProvider?.refresh());
				contractsFolderWatcher.onDidDelete(_ => this.contractsDataProvider?.refresh());
				contractsWatcher.onDidChange(_ => this.contractsDataProvider?.refresh());
				contractsWatcher.onDidCreate(_ => this.contractsDataProvider?.refresh());
				contractsWatcher.onDidDelete(_ => this.contractsDataProvider?.refresh());

				artifactsFolderWatcher.onDidChange(_ => this.artifactsDataProvider?.refresh());
				artifactsFolderWatcher.onDidCreate(_ => this.artifactsDataProvider?.refresh());
				artifactsFolderWatcher.onDidDelete(_ => this.artifactsDataProvider?.refresh());
				artifactsWatcher.onDidChange(_ => this.artifactsDataProvider?.refresh());
				artifactsWatcher.onDidCreate(_ => this.artifactsDataProvider?.refresh());
				artifactsWatcher.onDidDelete(_ => this.artifactsDataProvider?.refresh());

				return [folderWatcher, configWatcher, stateWatcher, contractsFolderWatcher, contractsWatcher];
			} catch (error: unknown) {
				throw {
					kind: 'E_UnknownError',
					msg: `Unexpected error occurred while trying to watch ${join(projectDir, '.taq/config.json')}`,
					context: projectDir,
					previous: error,
				} as TaqVsxError;
			}
		});
	}

	private dataProviders: { refresh: () => void }[] = [];
	private contractsDataProvider?: ContractsDataProvider;
	private artifactsDataProvider?: ArtifactsDataProvider;
	private sandboxesDataProvider?: SandboxesDataProvider;

	registerDataProviders(workspaceFolder: string) {
		this.registerDataProvider('taqueria-plugins', new PluginsDataProvider(workspaceFolder, this));
		this.sandboxesDataProvider = this.registerDataProvider(
			'taqueria-sandboxes',
			new SandboxesDataProvider(workspaceFolder, this),
		);
		this.registerDataProvider('taqueria-environments', new EnvironmentsDataProvider(workspaceFolder, this));
		this.contractsDataProvider = this.registerDataProvider(
			'taqueria-contracts',
			new ContractsDataProvider(workspaceFolder, this),
		);
		this.artifactsDataProvider = this.registerDataProvider(
			'taqueria-artifacts',
			new ArtifactsDataProvider(workspaceFolder, this),
		);
	}

	private registerDataProvider<T extends api.TreeDataProvider<unknown> & HasRefresh>(
		treeViewName: string,
		dataProvider: T,
	) {
		this.vscode.window.createTreeView(treeViewName, {
			treeDataProvider: dataProvider,
		});
		this.dataProviders.push(dataProvider);
		return dataProvider;
	}

	listenToDockerEvents() {
		const child = spawn(`docker`, [
			`events`,
			`--filter 'type=container'`,
			`--filter 'event=stop'`,
			`--filter 'event=start'`,
			`--filter 'event=destroy'`,
		], {
			shell: true,
		});
		child.stdout.on('data', _data => {
			this.sandboxesDataProvider?.refresh();
		});
	}
}
