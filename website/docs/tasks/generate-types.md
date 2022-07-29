---
title: generate types
---

## Overview

Taq `generate types` is used to generate TypeScript types from the Michelson smart contracts in your project. These generated types can then be used in your dApp to interact with the smart contracts using type safety

The Michelson contracts that will be processed are those in the `/artifacts` directory. The default output directory will be a `/types` directory in the same directory as the `/artifacts` directory

For each contract that is processed, two output files are created:

- `<fileName>.types.ts` - This file contains a TypeScript definition for the contract, storage, and entrypoints and is what you will import into your TS dApp
- `<fileName>".code.ts`  - This file contains the code that is used to interact with the contract, you will not need to import this file into your TS dApp

Additionally, there are two helper files that are created:

- `type-aliases.ts` - This file contains the mapping from Michelson types to TypeScript types, and some helper objects that can be used to cast types (`tas`), and instantiate bigMaps
- `type-utils.ts`   - This file contains methods that allow the generated types to be used directly in calls to Taquito and will need to be imported to your dApp

:::note
If changes are made to the source code of a smart contract, first it will need to be compiled again, then the types can be re-generated
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                            | Description                             |
| -------------------------------------- | --------------------------------------- |
| `@taqueria/plugin-contract-types`      | Generates TS types from Michelson files |

### Command

```shell
taq generate types
```

### Task Details

| Task Name        | Command                       | Type                      | Description                                                  | 
| ---------------- | ----------------------------- | ------------------------- | ------------------------------------------------------------ |
| `generate types` | `taq generate types [path]`   | Plugin - Code Generators  | Generates TS definitions for one or more Michelson contracts |

### Command-Line Arguments

| Argument          | Required | Description                                            | Example Usage                                         |
| ----------------- | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `[path]`          | No       | Path to one or more Michelson contracts to process     | `taq generate types ./contracts/my-contract.jsligo`   |
| `[typeOutputDir]` | No       | The output directory for the `.ts` files generated     | `taq generate types --typeOutputDir ../app/types`     |

### Aliases

The following aliases are interchangable with `generate types`
- `gen`
- `gentypes`


### Usage

| Description                       | Command                            | Behaviour                                                                     |
| --------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Generate types for all contracts  | `taq generate types`               | Generates types for each Michelson file in the `/artifacts` directory         |
| Generate types for one contract   | `taq generate types [path]`        | Generates types for the contract at the given path                            |

### Supported Filetypes

| Type             | Extension  |
| ---------------- | ---------- |
| Michelson        | `.tz`      |

<!-- 
## Using in a Taqueria Workflow

The `compiile` task is used to produce Michelson code that can be deployed to a sandbox, testnet, or mainnet 
 -->
