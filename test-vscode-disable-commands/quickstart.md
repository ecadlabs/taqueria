## Overview


Welcome to Taqueria! This quickstart guide will teach you the fundamentals of using Taqueria in 10 minutes by going through the process of running some basic tasks in Taqueria from the CLI

What you will accomplish:
- Initialize a new Taqueria project
- Install plugins for LIGO, Flextesa, and Taquito
- Compile a LIGO smart contract
- Start a local Flextesa sandbox 
- Originate the compiled smart contract to the sandbox

## Requirements

To successfully use Taqueria, you must ensure that:
- The Taqueria CLI has been [installed](./installation.mdx) and is available in your `$PATH` 
- Docker v0.8 or later is installed and currently running
- Node.js v16.3 or later

## Starting a Taqueria Project

To start using Taqueria on a project, the project directory must be initialized by Taqueria. This process creates a hidden directory `./.taq` inside the project directory that contains the configuration and state files required by Taqueria, and ensures the required directories `/contracts`, `/artifacts`, and `/tests` have been created 

Taqueria provides the command `init` which will create a new directory with the correct structure and configuration. To create a new Taqueria project called `my-first-project`, run the command:
```shell
taq init my-first-project
```
:::caution
If a project has already been initialized, Taqueria will not re-initialize the project, but will still return a success message. This will be fixed in an upcoming release
:::

## Working with Plugins

Now that the project has been properly initialized, plugins can be installed to provide support for specific functionality such as compilation, smart contract origination, or sandbox environments

Plugins are installed using the `taq install [pluginName]` command (requires the project to be initialized). Once a plugin has been installed, it's tasks will become available in Taqueria

You can view the list of commands available in the current project context by running `taq` from the command line

### Available Plugins

| name           |  pluginName                       |  description                                                        |
|----------------|------------------------------     |---------------------------------------------------------------------|
| LIGO           | `@taqueria/plugin-ligo`           | A compiler for the LIGO smart contract language                     |
| SmartPy        | `@taqueria/plugin-smartpy`        | A compiler for the SmartPy contract language                        |
| Flextesa       | `@taqueria/plugin-flextesa`       | A sandbox test network running Tezos Flextesa                       | 
| Taquito        | `@taqueria/plugin-taquito`        | A front-end Tezos framework used to originate                       |
| Contract Types | `@taqueria/plugin-contract-types` | A type generator that produces TS types from Michelson code         |
| Tezos Client   | `@taqueria/plugin-tezos-client`   | Interacts with a Tezos node, providing simulation and type checking |
| Jest           | `@taqueria/plugin-jest`           | A Jest plugin for testing smart contracts                           |

## Compiling a LIGO Smart Contract

To add support for the LIGO smart contract language, install the LIGO plugin by running:
```shell
taq install @taqueria/plugin-ligo
```

Once installed, the plugin provides the command `taq compile` which when run, will look for any LIGO files in the `/contracts` directory and compile them to Michelson `.tz` files in the `/artifacts` directory

To demonstrate this, create a file called `counter.jsligo` in the `/contracts` directory and insert the following JSLigo code:
```ligo title="/contracts/counter.jsligo"
type storage = int;

type parameter =
| ["Increment", int]
| ["Decrement", int]
| ["Reset"];

type return_ = [list <operation>, storage];

/* Two entrypoints */
let add = ([store, delta] : [storage, int]) : storage => store + delta;
let sub = ([store, delta] : [storage, int]) : storage => store - delta;

/* Main access point that dispatches to the entrypoints according to
   the smart contract parameter. */
let main = ([action, store] : [parameter, storage]) : return_ => {
 return [
   (list([]) as list <operation>),    // No operations
   (match (action, {
    Increment: (n: int) => add ([store, n]),
    Decrement: (n: int) => sub ([store, n]),
    Reset:     ()  => 0}))
  ]
}
```

You can now compile this contract by running the following command from the project directory:
```shell
taq compile
```

Taqueria will then output a list of contracts compiled, and the artifacts created:
```shell
❯ taq compile                     
┌────────────────┬──────────────────────┐
│ Contract       │ Artifact             │
├────────────────┼──────────────────────┤
│ counter.jsligo │ artifacts/counter.tz │
└────────────────┴──────────────────────┘
```

If you open this file (`/artifacts/counter.tz`), you can view the raw Michelson code which will later be originated to the sandbox:
```
{ parameter (or (or (int %decrement) (int %increment)) (unit %reset)) ;
  storage int ;
  code { UNPAIR ;
         IF_LEFT { IF_LEFT { SWAP ; SUB } { ADD } } { DROP 2 ; PUSH int 0 } ;
         NIL operation ;
         PAIR } }
```

### Starting a Flextesa Sandbox

The next step is to install the Flextesa plugin which provides a local Tezos sandbox network:
```shell
taq install @taqueria/plugin-flextesa
```

Once installed, the plugin provides three commands to start, stop, and query a sandbox:
- `taq start sandbox [sandboxName]`
- `taq stop sandbox [sandboxName]`
- `taq list accounts [sandboxName]`

:::note
Sandboxes are configured in the project's Taqueria configuration file (`./.taq/config.json`). Each named sandbox configuration can then be called from the CLI.
By default, every Taqueria project comes pre-configured with a sandbox named `local`
:::

Start up the sandbox named `local` by running:
```shell
taq start sandbox local
```

To confirm the sandbox is running, query the sandbox for the account information:
```shell
taq list accounts local
```

If successful, you will see a list of the accounts and balances specified in the `config.json` file that have been created on the Tezos blockchain in the sandbox:
```
❯ taq list accounts local
┌─────────┬─────────┬──────────────────────────────────────┐
│ Account │ Balance │ Address                              │
├─────────┼─────────┼──────────────────────────────────────┤
│ bob     │ 3000 ꜩ  │ tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6 │
├─────────┼─────────┼──────────────────────────────────────┤
│ alice   │ 2000 ꜩ  │ tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb │
├─────────┼─────────┼──────────────────────────────────────┤
│ john    │ 4000 ꜩ  │ tz1Zwoh1QCVAvJ4sVTojMp9pLYp6Ji4NoZy6 │
├─────────┼─────────┼──────────────────────────────────────┤
│ jane    │ 5000 ꜩ  │ tz1aHUAC4oviwJuZF1EvVSvFz7cu9KMNYBph │
├─────────┼─────────┼──────────────────────────────────────┤
│ joe     │ 1000 ꜩ  │ tz1MVGjgD1YtAPwohsSfk8i3ZiT1yEGM2YXB │
└─────────┴─────────┴──────────────────────────────────────┘
```

### Originating a Contract with Taquito

With a sandbox now running, the next step is to originate the `counter.tz` file to the sandbox network using the Taquito plugin

First, install the plugin:
```shell
taq install @taqueria/plugin-taquito
```

Next, you need to configure some values for origination:
- The initial storage for the smart contract 
- The name of the sandbox to target (by default it is pre-configured to the sandbox named `local`)
:::note
As the default configuration comes with the sandbox named `local` preconfigured, simply provide a value for the initial storage in the `"storage"` property 
:::

To set these values in Taqueria, navigate to the file `./.taq/config.json` and locate the `"environment"` property. For the `counter.tz` contract, simply need to provide an integer value for the `counter.tz` file which looks like this:
```
    "environment": {
        "default": "development",
        "development": {
            "networks": [],
            "sandboxes": [
                "local"
            ],
            "storage": {
                "counter.tz": 42
            }
        }
    },
```

Now you can originate the contract by running:
```shell
taq originate
```

This will originate all contracts in the `/artifacts` directory to the sandbox and return the on-chain addresses for the originated contracts. This will look something like this:
```shell
┌────────────┬──────────────────────────────────────┬─────────────┐
│ Contract   │ Address                              │ Destination │
├────────────┼──────────────────────────────────────┼─────────────┤
│ counter.tz │ KT1Ayz8qos7G4U3Jucp6QWoM7ayhbShNXcat │ local       │
└────────────┴──────────────────────────────────────┴─────────────┘
```

## Finishing Up

Congratulations! At this point, you have run through the basic usage of Taqueria

For more details on the usage of specific Taqueria tasks, you can refer to the plugin documentation which contains additional context, configuration, and usage of the many Taqueria tasks; or continue on with the getting started guides