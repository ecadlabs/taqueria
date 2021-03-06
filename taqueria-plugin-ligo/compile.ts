import { execCmd, getArch, getContracts, sendAsyncErr, sendErr, sendJsonRes } from '@taqueria/node-sdk';
import { RequestArgs } from '@taqueria/node-sdk/types';
import { basename, extname, join } from 'path';

interface Opts extends RequestArgs.t {
	entrypoint?: string;
	syntax?: string;
	sourceFile?: string;
}

const getContractArtifactFilename = (opts: Opts) =>
	(sourceFile: string) => {
		const outFile = basename(sourceFile, extname(sourceFile));
		return join(opts.config.artifactsDir, `${outFile}.tz`);
	};

const getInputFilename = (opts: Opts) =>
	(sourceFile: string) => {
		return join(opts.config.contractsDir, sourceFile);
	};

const getCompileCommand = (opts: Opts) =>
	(sourceFile: string) => {
		const projectDir = process.env.PROJECT_DIR ?? opts.projectDir;

		if (!projectDir) throw `No project directory provided`;

		const inputFile = getInputFilename(opts)(sourceFile);
		const baseCommand =
			`DOCKER_DEFAULT_PLATFORM=linux/amd64 docker run --rm -v \"${projectDir}\":/project -w /project -u $(id -u):$(id -g) ligolang/ligo:next compile contract ${inputFile}`;
		const entryPoint = opts.entrypoint ? `-e ${opts.entrypoint}` : '';
		const syntax = opts['syntax'] ? `-s ${opts['syntax']} : ""` : '';
		const outFile = `-o ${getContractArtifactFilename(opts)(sourceFile)}`;
		const cmd = `${baseCommand} ${entryPoint} ${syntax} ${outFile}`;
		return cmd;
	};

const compileContract = (opts: Opts) =>
	(sourceFile: string): Promise<{ contract: string; artifact: string }> =>
		getArch()
			.then(() => getCompileCommand(opts)(sourceFile))
			.then(execCmd)
			.then(({ stderr }) => { // How should we output warnings?
				if (stderr.length > 0) sendErr(stderr);
				return {
					contract: sourceFile,
					artifact: getContractArtifactFilename(opts)(sourceFile),
				};
			})
			.catch(err => {
				sendErr(' ');
				sendErr(err.message.split('\n').slice(1).join('\n'));
				return Promise.resolve({
					contract: sourceFile,
					artifact: 'Not compiled',
				});
			});

const compileAll = (parsedArgs: Opts) =>
	Promise.all(getContracts(/\.(ligo|religo|mligo|jsligo)$/, parsedArgs.config))
		.then(entries => entries.map(compileContract(parsedArgs)))
		.then(processes => {
			if (processes.length > 0) return processes;
			return [];
		})
		.then(promises => Promise.all(promises));

export const compile = (parsedArgs: Opts) => {
	const p = parsedArgs.sourceFile
		? compileContract(parsedArgs)(parsedArgs.sourceFile as string)
			.then(result => [result])
		: compileAll(parsedArgs)
			.then(results => {
				if (results.length === 0) {
					sendErr('No contracts found to compile. Have you run "taq add-contract [sourceFile]" ?');
				}
				return results;
			});

	return p
		.then(sendJsonRes)
		.catch(err => sendAsyncErr(err, false));
};

export default compile;
