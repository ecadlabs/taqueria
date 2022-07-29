import { map, reject } from 'fluture';
import { ZodError } from 'zod';

export type ErrorType =
	| 'E_INVALID_PATH_DOES_NOT_EXIST'
	| 'E_INVALID_PATH_EXISTS_AND_NOT_AN_EMPTY_DIR'
	| 'E_INVALID_PATH_ALREADY_EXISTS'
	| 'E_INVALID_CONFIG'
	| 'E_INVALID_JSON'
	| 'E_FORK'
	| 'E_INVALID_TASK'
	| 'E_READFILE'
	| 'E_NPM_INIT'
	| 'E_INVALID_PLUGIN_RESPONSE'
	| 'E_INVALID_ARGS'
	| 'E_MKDIR_FAILED'
	| 'E_GIT_CLONE_FAILED'
	| 'E_PROVISION'
	| 'E_PARSE'
	| 'E_PARSE_UNKNOWN'
	| 'E_INVALID_ARCH'
	| 'E_CONTRACT_REGISTERED'
	| 'E_CONTRACT_NOT_REGISTERED'
	| 'E_NO_PROVISIONS'
	| 'E_INTERNAL_LOGICAL_VALIDATION_FAILURE'
	| 'E_REQUEST_CONSENT_PROMPT_FROM_VSCODE'
	| 'E_EXEC';

export interface TaqError {
	readonly kind: ErrorType;
	msg: string;
	previous?: TaqError | Error | unknown;
	context?: unknown;
}

export type t = TaqError;

export class E_TaqError extends Error {
	readonly context;
	readonly kind;
	readonly previous;
	constructor(taqErr: TaqError) {
		super(taqErr.msg);
		this.context = taqErr.context;
		this.kind = taqErr.kind;
		this.name = this.kind;
		this.previous = taqErr.previous;
	}
}

export const toFutureParseErr = <T>(previous: ZodError, msg: string, context?: unknown) =>
	reject(toParseErr(previous, msg, context))
		.pipe(map((val: unknown) => val as T));

export const toParseErr = (previous: ZodError, msg: string, context?: unknown) =>
	create({
		kind: 'E_PARSE',
		msg: msg,
		context,
		previous,
	});

export const toParseUnknownErr = (previous: Error | TaqError | E_TaqError | unknown, msg: string, context?: unknown) =>
	create({
		kind: 'E_PARSE_UNKNOWN',
		msg: msg,
		context,
		previous,
	});

export const toFutureParseUnknownErr = <T>(
	previous: Error | TaqError | E_TaqError | unknown,
	msg: string,
	context?: unknown,
) =>
	reject(toParseUnknownErr(previous, msg, context))
		.pipe(map((val: unknown) => val as T));

export const create = (err: TaqError) => err;
