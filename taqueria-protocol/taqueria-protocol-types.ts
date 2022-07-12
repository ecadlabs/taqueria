import * as Alias from '@taqueria/protocol/Alias';
import * as Config from '@taqueria/protocol/Config';
import * as EconomicalProtocolHash from '@taqueria/protocol/EconomicalProtocolHash';
import * as Environment from '@taqueria/protocol/Environment';
import * as EphemeralState from '@taqueria/protocol/EphemeralState';
import * as HumanReadableIdentifier from '@taqueria/protocol/HumanReadableIdentifier';
import * as i18n from '@taqueria/protocol/i18n';
import * as InstalledPlugin from '@taqueria/protocol/InstalledPlugin';
import * as LoadedConfig from '@taqueria/protocol/LoadedConfig';
import * as NetworkConfig from '@taqueria/protocol/NetworkConfig';
import * as Option from '@taqueria/protocol/Option';
import * as ParsedPluginInfo from '@taqueria/protocol/ParsedPluginInfo';
import * as PersistentState from '@taqueria/protocol/PersistentState';
import * as PluginInfo from '@taqueria/protocol/PluginInfo';
import * as PositionalArg from '@taqueria/protocol/PositionalArg';
import * as RequestArgs from '@taqueria/protocol/RequestArgs';
import * as SandboxAccountConfig from '@taqueria/protocol/SandboxAccountConfig';
import * as SandboxConfig from '@taqueria/protocol/SandboxConfig';
import * as SanitizedAbsPath from '@taqueria/protocol/SanitizedAbsPath';
import * as SanitizedArgs from '@taqueria/protocol/SanitizedArgs';
import * as SanitizedPath from '@taqueria/protocol/SanitizedPath';
import * as SHA256 from '@taqueria/protocol/SHA256';
import * as TaqError from '@taqueria/protocol/TaqError';
import * as Task from '@taqueria/protocol/Task';
import * as Url from '@taqueria/protocol/Url';
import * as Verb from '@taqueria/protocol/Verb';
import * as VersionNumber from '@taqueria/protocol/VersionNumber';
export interface RuntimeDependency {
	readonly name: string;
	readonly path: string;
	readonly version: string;
	readonly kind: 'required' | 'optional';
}

export type PluginActionName =
	| 'checkRuntimeDependencies'
	| 'installRuntimeDependencies'
	| 'proxy'
	| 'pluginInfo'
	| string;

export type PluginProxyAction = Task.t;

export type PluginAction = 'checkRuntimeDependencies' | 'installRuntimeDependencies' | 'pluginInfo' | PluginProxyAction;

export interface RuntimeDependencyReport extends RuntimeDependency {
	readonly met: boolean;
}

export interface CheckRuntimeDependenciesResponse {
	readonly report: RuntimeDependencyReport[];
}

export interface InstallRuntimeDependenciesResponse {
	readonly report: RuntimeDependencyReport[];
}

export type PluginActionNotSupportedResponse = {
	readonly status: 'notSupported';
	readonly msg: string;
};

export interface PluginJsonResponse {
	readonly data?: unknown;
	readonly render?: 'none' | 'string' | 'table';
}

export type PluginResponse =
	| PluginJsonResponse
	| CheckRuntimeDependenciesResponse
	| InstallRuntimeDependenciesResponse
	| PluginInfo.t
	| PluginActionNotSupportedResponse
	| void;

export {
	Alias,
	Config,
	EconomicalProtocolHash,
	Environment,
	EphemeralState,
	HumanReadableIdentifier,
	i18n,
	InstalledPlugin,
	LoadedConfig,
	NetworkConfig,
	Option,
	ParsedPluginInfo,
	PersistentState,
	PluginInfo,
	PositionalArg,
	RequestArgs,
	SandboxAccountConfig,
	SandboxConfig,
	SanitizedAbsPath,
	SanitizedArgs,
	SanitizedPath,
	SHA256,
	TaqError,
	Task,
	Url,
	Verb,
	VersionNumber,
};
