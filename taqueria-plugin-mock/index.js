const { Plugin, Task, Option, Operation, sendAsyncRes, sendAsyncJsonRes } = require('@taqueria/node-sdk');

const tableResponse = JSON.stringify({
	render: 'table',
	data: [{ ping: 'pong' }],
});

Plugin.create(i18n => ({
	schema: '1.0',
	version: '0.1',
	alias: 'mock',
	tasks: [
		Task.create({
			task: 'proxy',
			command: 'proxy',
			aliases: ['ping'],
			description: 'Return predefined result for CLI integration testing',
			options: [
				Option.create({
					shortFlag: 'e',
					flag: 'error',
					description: 'Forces the task to return an error.',
					type: 'boolean',
				}),
			],
			handler: 'proxy',
		}),
		Task.create({
			task: 'proxy-json',
			command: 'proxy-json',
			description: 'Gets a JSON response from a plugin and outputs a string',
			options: [
				Option.create({
					shortFlag: 'r',
					flag: 'return',
					description: 'Return either a string or object in the JSON response',
					choices: [
						'string',
						'object',
					],
					required: true,
					type: 'string',
				}),
				Option.create({
					shortFlag: 'e',
					flag: 'error',
					description: 'Forces the task to return an error.',
					type: 'boolean',
				}),
			],
			handler: 'proxy',
			encoding: 'json',
		}),
		Task.create({
			task: 'without-proxy',
			command: 'without-proxy',
			description: 'Tests handling a task without proxy',
			options: [
				Option.create({
					shortFlag: 'e',
					flag: 'error',
					description: 'Forces the task to return an error.',
					type: 'boolean',
				}),
			],
			handler: 'echo pong',
		}),
		Task.create({
			task: 'json-without-proxy',
			command: 'json-without-proxy',
			description: 'Tests handling a task that returns JSON without proxy',
			options: [
				Option.create({
					shortFlag: 'r',
					flag: 'return',
					description: 'Return either a string or object in the JSON response',
					choices: [
						'string',
						'object',
					],
					required: true,
					type: 'string',
				}),
				Option.create({
					shortFlag: 'o',
					flag: 'object',
					description: 'Render object in table encoded in JSON response',
					type: 'boolean',
				}),
			],
			encoding: 'application/json',
			handler: `echo '<% if (it.return == 'object') { %>${tableResponse}<% } else %><%= "pong" %>'`,
		}),
	],
	proxy: parsedArgs => {
		switch (parsedArgs.task) {
			case 'proxy':
			case 'ping':
				return parsedArgs.error
					? Promise.reject('error')
					: sendAsyncRes('pong', false);
				break;
			case 'proxy-json':
				return parsedArgs.error
					? sendAsyncErr('error')
					: sendAsyncJsonRes(
						parsedArgs.return === 'object'
							? [{ 'ping': 'pong' }]
							: 'pong',
					);
				break;
			default:
				return sendAsyncErr('Non-expected task');
		}
	},
}), process.argv);
