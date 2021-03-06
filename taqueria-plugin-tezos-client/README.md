# Taqueria Tezos Client Plugin

The Tezos Client plugin provides tasks for interacting with the Tezos client including type checking of Michelson smart contracts, and simulating smart contracts

In future releases, this plugin will be extended to support more Tezos Client features and interacting with testnets

## Requirements

- Node.js v16 or later
- Docker v0.8.2 or later
- Taqueria v0.8.0 or later
- [Taqueria Flextesa plugin](../plugin-flextesa) v0.2.1 or later

> ### :page_with_curl: Note
> Currently, the Tezos Client plugin requires the Tezos Client to be running in a local Flextesa sandbox. The recommended approach is to install the Taqueria Flextesa plugin on the project, and then run `taq start sandbox local` to start up the sandbox so the Tezos Client plugin can connect to it

## Installation

To install the Tezos Client plugin on a Taqueria project, navigate to the project folder and run:
```shell
taq install @taqueria/plugin-tezos-client
```

## Configuration

No project level configuration is available for the Tezos Client plugin

## Taqueria Tasks

The Tezos Client plugin currently provides the following tasks:
1. `taq typecheck [inputFiles]` - typechecks one or more Michelson smart contracts
2. `taq simulate <inputFile> <inputData>` - simulates calling a Michelson smart contract

As this plugin calls the tezos-client instance that is running in the sandbox, the protocol that will be used in the typecheck or simulation is the one that is currently running in the sandbox which can be configured in `./.taq/config.json`

### The `taq typecheck` task

The `taq typecheck` task typechecks one or more Michelson smart contracts against the Tezos network running in the Flextesa sandbox

The structure of the command for the typecheck task including all optional parameters is:
```shell
taq typecheck [inputFiles] -s sandboxName
```

A particular Michelson smart contract can be specified by the optional `<inputFile>` argument. If the file name is not specified, the task will typecheck all Michelson smart contracts in the `/artifacts` and `/contracts` directories

### Optional Parameters

The `typecheck` task will accept the following optional parameters:

| flag  |  name       | description                           |   
|:-----:|:------------|---------------------------------------|
|  -s   | sandboxName | The name of the sandbox to target.    |

### The `taq simulate` task

The `taq simulate` task uses the tezos-client instance running in the Flextesa sandbox to simulate calling a Michelson smart contract. You pass in the input parameters for the contract's `main` entrypoint, and specify the storage value for the contract through an optional flag or via the initial storage value set for the contract in the sandbox property of `config.json` 

The structure of the command for the typecheck task including all optional parameters is:
```shell
taq simulate <inputFile> <inputData> -s sandboxName --storage valueOfInitialStorage
```
 This command has 2 required parameters, and 2 optional parameters as shown above
 
### Required Parameters
- `<inputFile>` - The name of the Michelson smart contract to simulate. The task will first look in the `/artifacts` directory, then the `/contracts` directory and execute the first instance of the contract name
- `<inputData>` - The input data to pass to the Michelson smart contract. This is a single quote wrapped string value which is passed to the Michelson smart contract as the `input` parameter

### Storage Value

The storage value associated with the contract must be provided to the tezos-client and is what the simulation of the contract will use. There are two ways you can provide this value

It can be provided as an optional parameter to the `taq simulate [inputFile]` command by adding the optional parameter: `--storage 'storageValue'`

If not specified, the storage value will be set to the value of the `storage` property of the `config.json` file as seen here:
```json ./.taq/config.json
    "environment": {
        "default": "local",
        "sandbox": {
            "networks": [],
            "sandboxes": [
                "local"
            ],
            "storage": {
                "add_subtract_contract.tz": 10,
            }
        },
```

### Optional Parameters

The `simulate` task will accept the following optional parameters:

| Flag          |  Name       | Description                                  |   
|:-------------:|:------------|----------------------------------------------|
|  -s           | sandboxName | The name of the sandbox to target            |
|  --storage    | storage     | The initial storage value for the contract   |
|  --entryPoint | entryPoint  | The annotated name of the entrypoint to call |

## Plugin Architecture

This is a plugin developed for Taqueria built on NodeJS using the Taqueria Node SDK

The plugin requires the tezos-client software to be running in a local Flextesa sandbox to work. The recommended approach is to install the Taqueria Flextesa plugin on the project, and then run `taq start sandbox local` to start up the sandbox so the Tezos Client plugin can connect to it

The plugin provides two task to the Taqueria CLI:
- `taq typecheck [inputFiles] [--sandboxName sandbox]`
- `taq simulate <inputFile> <inputData> [--storage value] [--sandboxName sandbox]`