import { Option, Plugin, PositionalArg, Task } from '@taqueria/node-sdk';
import { tasks } from './tasks';

Plugin.create(i18n => ({
	alias: 'contract-types',
	schema: '1.0',
	version: '0.1',
	tasks: [
		Task.create({
			task: 'generate types',
			command: 'generate types [typescriptDir]',
			description: 'Generate types for a contract to be used with taquito',
			positionals: [
				PositionalArg.create({
					placeholder: 'typescriptDir',
					description: 'The output directory for the generated type files',
					defaultValue: 'types',
					type: 'string',
				}),
			],
			options: [
				Option.create({
					shortFlag: 't',
					flag: 'typeAliasMode',
					choices: ['file', 'simple'],
					description: 'The type aliases used in the generated types',
					type: 'string',
				}),
			],
			aliases: ['gen types', 'gentypes'],
			handler: 'proxy',
		}),
	],
	proxy: tasks.generateTypes,
}), process.argv);
