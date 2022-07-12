import { Option, Plugin, PositionalArg, Task } from '@taqueria/node-sdk';
import proxy from './proxy';

Plugin.create(() => ({
	schema: '0.1',
	version: '0.4.0',
	alias: 'jest',
	tasks: [
		Task.create({
			task: 'test',
			command: 'test [partition]',
			description: 'Setup a directory as a partition to run Jest tests',
			aliases: ['jest'],
			handler: 'proxy',
			positionals: [
				PositionalArg.create({
					placeholder: 'partition',
					description: 'Name of the partition for these tests',
					defaultValue: 'tests',
					type: 'string',
				}),
			],
			options: [
				Option.create({
					flag: 'init',
					shortFlag: 'i',
					description: 'Initializes the partition for Jest',
					type: 'boolean',
				}),
				Option.create({
					flag: 'testPattern',
					shortFlag: 't',
					description: 'Run test files that match the provided pattern',
					type: 'string',
				}),
			],
		}),
	],
	proxy,
}), process.argv);
