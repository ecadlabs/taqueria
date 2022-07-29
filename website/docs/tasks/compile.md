---
title: compile
---

## Overview

Taq `compile` is used to compile smart contracts to Michelson. It is implemeted by compiler plugins and can be used to compile one or more contracts in one or more languages / dialects

The Michelson contracts produced by the compilers will be created in the `/artifacts` directory

:::note
Contracts must be added to the [Contract Registry](/docs/tasks/add-contract) (`taq add-contract example.mligo`) in order to be compiled
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                  | Description                       |
| ---------------------------- | --------------------------------- |
| `@taqueria/plugin-ligo`      | Compiles Ligo contracts           |
| `@taqueria/plugin-smartpy`   | Compiles SmartPy contracts        |
| `@taqueria/plugin-archetype` | Compiles Archetype contracts      |

### Command

```shell
taq compile <path> 
```

### Task Details

| Task Name      | Command                       | Type                | Description                                           | 
| -------------- | ----------------------------- | ------------------- | ----------------------------------------------------- |
| `compile`      | `taq compile [path]`          | Plugin - compilers  | Compiles one, multiple, or all contracts in a project |

### Command-Line Arguments

| Argument     | Required | Description                                            | Example Usage                                         |
| ------------ | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `<path>`     | No       | Path to one or more Ligo, SmartPy, or Archetype files  | `taq compile ./contracts/my-contract.jsligo`          |
| `--plugin`   | No       | Compiles contracts using the compiler plugin specified | `taq compile --plugin archetype`                      |
|  `-e`        | No       | The entry point that will be compiled                  | `taq compile ./contracts/test.mligo -e transferTo`    |
|  `-s`        | No       | The syntax used in the contract                        | `taq compile -s jsligo`                               |      
|  -i          | No       | Enable type inference                                  | `taq compile ./contracts/counter.mligo -i`            |  

### Usage

| Description                 | Command                            | Behaviour                                                                     |
| --------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Compile all contracts       | `taq compile`                      | Compiles all Ligo, SmartPy, and Archetype files in the `/contracts` directory |
| Compile one contract        | `taq compile [path]`               | Compiles the contract at the given path                                       |
| Compile Ligo contracts      | `taq compile --plugin ligo`        | Compiles Ligo contracts using the Ligo compiler                               |
| Compile SmartPy contracts   | `taq compile --plugin smartpy`     | Compiles SmartPy contracts using the SmartPy compiler                         |
| Compile Archetype contracts | `taq compile --plugin archetype`   | Compiles Archetype contracts using the Archetype compiler                     |
 
### Supported Filetypes

| Type             | Extension  |
| ---------------- | ---------- |
| Michelson        | `.tz`      |
| JsLigo           | `.jsligo`  |
| CameLigo         | `.mligo`   |
| PascaLigo        | `.pligo`   |     
| ReasonLigo       | `.rligo`   |

### Multi-File Contracts

:::note
When developing multi-file LIGO contracts, you only need to add the file that contains the `main` entrypoint for each multi-file smart contract to the [contract registry](/docs/tasks/add-contract). The other files will be automatically included during compilation
:::

## Using in a Taqueria Workflow

The `compiile` task is used to produce Michelson code that can be deployed to a sandbox, testnet, or mainnet 

