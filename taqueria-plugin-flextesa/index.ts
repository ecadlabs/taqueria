import { Plugin, PositionalArg, Task } from '@taqueria/node-sdk';
import proxy from './proxy';

Plugin.create(_i18n => ({
	alias: 'flextesa',
	schema: '1.0',
	version: '0.1',
	tasks: [
		Task.create({
			task: 'start sandbox',
			command: 'start sandbox [sandboxName]',
			aliases: ['start flextesa'],
			description: 'Starts a flextesa sandbox',
			options: [],
			handler: 'proxy',
			positionals: [
				PositionalArg.create({
					placeholder: 'sandboxName',
					description: 'The name of the sandbox to start',
					type: 'string',
				}),
			],
		}),
		Task.create({
			task: 'stop sandbox',
			command: 'stop sandbox [sandboxName]',
			aliases: ['stop flextesa'],
			description: 'Stops a flextesa sandbox',
			options: [],
			handler: 'proxy',
			positionals: [
				PositionalArg.create({
					placeholder: 'sandboxName',
					description: 'The name of the sandbox to stop',
					type: 'string',
				}),
			],
		}),
		Task.create({
			task: 'list accounts',
			command: 'list accounts <sandboxName>',
			aliases: [],
			description: 'List the balances of all sandbox accounts',
			options: [],
			handler: 'proxy',
			positionals: [
				PositionalArg.create({
					placeholder: 'sandboxName',
					description: 'The name of the sandbox to use',
					type: 'string',
				}),
			],
			encoding: 'json',
		}),
	],
	checkRuntimeDependencies: () =>
		Promise.resolve({
			status: 'success',
			report: [
				{ name: 'Docker', path: '/usr/bin/docker', version: '>=0.8.4', kind: 'required', met: true },
			],
		}),
	installRunTimeDependencies: () =>
		Promise.resolve({
			status: 'success',
			output: 'Docker was found in /usr/bin/ligo', // TODO this should use i18n
		}),
	proxy: proxy,
}), process.argv);
