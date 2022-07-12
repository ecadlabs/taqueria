export const expectedConfig = `
{
    "language": "en",
    "contractsDir": "contracts",
    "artifactsDir": "artifacts",
    "network": {},
    "sandbox": {
        "local": {
            "label": "Local Tezos Sandbox",
            "rpcUrl": "http://localhost:20000",
            "protocol": "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"
        }
    },
    "environment": {
        "default": "development",
        "development": {
            "networks": [],
            "sandboxes": [
                "local"
            ],
            "storage": {}
        }
    },
    "accounts": {
        "bob": "3_000_000_000",
        "alice": "3_000_000_000",
        "john": "3_000_000_000",
        "jane": "3_000_000_000",
        "joe": "3_000_000_000"
    }
}
`;

export const newConfig = `
{
    "language": "en",
    "contractsDir": "contracts",
    "artifactsDir": "artifacts",
    "network": {},
    "sandbox": {
        "local": {
            "label": "Local Tezos Sandbox",
            "rpcUrl": "http://localhost:20000",
            "protocol": "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"
        }
    },
    "environment": {
        "default": "development",
        "development": {
            "networks": [],
            "sandboxes": [
                "local"
            ],
            "storage": {}
        },
		"testing": {
			"networks": [],
			"sandboxes": [
				"local"
			],
			"storage": {}
		}
    },
    "accounts": {
        "bob": "3_000_000_000",
        "alice": "3_000_000_000",
        "john": "3_000_000_000",
        "jane": "3_000_000_000",
        "joe": "3_000_000_000"
    }
}
`;

export const expectedProvisionerDeclaration = `
import development_state from "./development-state.json" assert {type: "json"}

declare global {
export type development = typeof development_state

export type RawState = development

export interface State {
raw: RawState
}

export type ID = string

export interface Provision {
readonly id: ID
after: ID[]
when: (fn: (state: State) => boolean) => Provision
task: (fn: (state: State) => unknown) => Provision
}

export function provision(id: ID): Provision

export interface Tasks {
}
export const tasks: Tasks
}
`;
