import { Option, Plugin, PositionalArg, Task } from '@taqueria/node-sdk';
import proxy from './src/proxy';

Plugin.create(() => ({
	schema: '0.1',
	version: '0.4.0',
	alias: 'metadata',
	tasks: [
		Task.create({
			task: 'metadata',
			command: 'generate metadata [contractName]',
			description: 'Create contract metadata.',
			aliases: [],
			handler: 'proxy',
			positionals: [
				PositionalArg.create({
					placeholder: 'contractName',
					description: 'Which contract?',
					type: 'string',
				}),
			],
			encoding: 'none',
		}),
		Task.create({
			task: 'project-metadata',
			command: 'generate project-metadata',
			description: 'Create project metadata to be used as defaults for contracts.',
			aliases: [],
			handler: 'proxy',
			encoding: 'none',
		}),
	],
	proxy,
}), process.argv);
