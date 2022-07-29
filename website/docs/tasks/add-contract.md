---
title: add-contract
---

## Overview

Taq `add-contract` adds a smart contract file to the contract registry. This is a required step before compiling or originating a smart contract

:::note
Contracts created from [Templates](/docs/features/templates) (`taq create contract example.mligo`) will automatically be added to the registry and this task will not be necessary
:::

## Plugin Implementations

This task is part of the core CLI and is not implemented in any of the plugins

### Command

```shell
taq add-contract <path> 
```

### Task Details

| Task Name      | Command                       | Type           | Description                     |
| -------------- | ----------------------------- | -------------- | ------------------------------- |
| `add-contract` | `taq add-contract <path>`     | Taqueria Core  | Adds a contract to the registry |

### Command-Line Arguments

| Argument       | Required | Description                                  | Example Usage                                     |
| -------------- | -------- | -------------------------------------------- | ------------------------------------------------- |
| `<path>`       | Yes      | Path to the Ligo, SmartPy, or Archetype file | `taq add-contract ./contracts/my-contract.jsligo` |

### Supported Filetypes

| Type             | Extension  |
| ---------------- | ---------- |
| Archetype        | `.arl`     |
| CameLigo         | `.mligo`   |
| JsLigo           | `jsligo`   |
| Michelson        | `.tz`      |
| PascaLigo        | `.pligo`   |
| ReasonLigo       | `.rligo`   |
| SmartPy          | `.py`      |

## Using in a Taqueria Workflow

The `add-contract` task is used when importing an existing smart contract to your project or creating one without Taqueria.  It also is used when Taq'ifying a project to register the contracts in the registry

### Importing a Ligo, SmartPy, or Archetype file

1. Import a contract to your project `example.arl`
2. Add the contract to the registry `taq add-contract example.arl`
3. Compile the contract `taq compile example.arl`
4. Originate the contract `taq originate example.arl`
5. Update dApp
6. Deploy dApp
7. Test

### Creating a Contract without Taqueria 

1. Create a contract in your project via IDE or CLI `example.mligo`
2. Add the contract to the registry `taq add-contract example.mligo`
3. Add or edit source code in contract file
4. Compile the contract `taq compile example.mligo`
5. Originate the contract `taq originate example.mligo`
6. Update dApp
7. Deploy dApp
8. Test

### Taq'ifying a project

1. Clone a project
2. Add a smart contract from the project to the registry `taq add-contract router.py`
3. Repeat 2 till each contract with a main entrypoint has been added to the registry
4. Compile the contracts `taq compile`
5. Originate the contracts `taq originate`
6. Update dApp
7. Deploy dApp
8. Test

