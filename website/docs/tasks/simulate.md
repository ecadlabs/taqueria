---
title: simulate
---

## Overview

Taq `simulate` is used to simulate the behavior of an entrypoint in a given smart contract. It takes an initial storage value, and the input parameters of the entrypoint and will execute the associated code on a running Flextesa sandbox, and return the results

:::note
`taq simulate` is executed by a Tezos node. The current implementation of the Tezos Client plugin requires a running Flextesa node. Before running `taq typecheck`, you will need to install the [Flextesa plugin](/docs/plugins/plugin-flextesa) and start up a sandbox `taq start sandbox local`
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                      | Description                                |
| -------------------------------- | ------------------------------------------ |
| `@taqueria/plugin-tezos-client`  | Provides an abstraction of `tezos-client`  |

### Command

```shell
taq simulate <file> <input> [sandboxName] [storage]
```

:::note
The `storage` parameter is mandatory, but can be omitted if the contract has an initial storage value defined in `config.json`
:::

### Task Details

| Task Name        | Aliases | Command                                               | Type                | Description                                           | 
| ---------------- | ------- | ----------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| `simulate`       | `sim`   | `taq simulate <file> <input> [sandboxName] [storage]` |  Plugin - nodes     | Simulates the execution of a smart contract call      |


### Command-Line Arguments


| Flag          |  Name       | Description                                  |   
|:-------------:|:------------|----------------------------------------------|
|  -s           | sandboxName | The name of the sandbox to target            |
|  --storage    | storage     | The initial storage value for the contract   |
|  --entryPoint | entryPoint  | The annotated name of the entrypoint to call |

| Argument        | Required | Shortflag | Description                                            | Example Usage                                   |
| --------------- | -------- | --------- | ------------------------------------------------ | ----------------------------------------------------- |
| `<file>`        | Yes      |           | Path to the Michelson file to typecheck          | `taq simulate counter.tz 1`                           |
| `<inputData>`   | Yes      |           | Michelson encoded input parameters               | `taq simulate counter.tz 1`                           |
| `--sandboxName` | No       | `-s`      | Path to the Michelson file to typecheck          | `taq simulate counter.tz 1 -s jakarta_sandbox`        |
| `--storage`     | Yes      |           | The storage value to used for the simulation     | `taq simulate counter.tz 1 --storage`                 |
| `--entryPoint`  | No       | `-e`      | The entrypoint to call in the smart contract     | `taq simulate counter.tz 1 --entryPoint increment`    |

<!-- ### Usage

| Description                            | Command                                | Behaviour                                                                       |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Typecheck all Michelson files          | `taq typecheck`                        | Typechecks each Michelson file in `/artifacts` against the default sandbox      |
| Typecheck one Michelson file           | `taq typecheck example.tz`             | Typechecks the file `example.tz` against the default sandbox                    |
| Typecheck two Michelson files          | `taq typecheck example.tz example2.tz` | Typechecks the files `example.tz` and `example2.tz` against the default sandbox |
| Typecheck files with a custom sandbox  | `taq typecheck -s jakarta_sandbox`     | Typechecks each Michelson file in `/artifacts` against the default sandbox      | -->

