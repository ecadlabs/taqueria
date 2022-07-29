---
title: typecheck
---

## Overview

Taq `typecheck` is used to run a typecheck on a Michelson source file. The task expects the Michelson file(s) to be located in the `/artifacts` directory

:::note
Typechecking is executed by a Tezos node. The current implementation of the Tezos Client plugin requires a running Flextesa node. Before running `taq typecheck`, you will need to install the [Flextesa plugin](/docs/plugins/plugin-flextesa) and start up a sandbox `taq start sandbox local`
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                      | Description                                |
| -------------------------------- | ------------------------------------------ |
| `@taqueria/plugin-tezos-client`  | Provides an abstraction of `tezos-client`  |

### Command

```shell
taq typecheck [file] [sandboxName]
```

### Task Details

| Task Name        | Aliases | Command                   | Type                | Description                                           | 
| ---------------- | ------- | ------------------------- | ------------------- | ----------------------------------------------------- |
| `typecheck`      | `tc`    | `taq typecheck [file]`    |  Plugin - nodes     | Runs a typecheck on one or more Michelson contracts   |


### Command-Line Arguments

| Argument        | Required | Shortflag | Description                                            | Example Usage                                   |
| --------------- | -------- | --------- | ------------------------------------------------ | ----------------------------------------------------- |
| `[file]`        | No       |           | Name of the Michelson file to typecheck          | `taq typecheck counter.tz`                            |
| `[sandboxName]` | No       | `-s`      | Name of the sandbox to use                       | `taq typecheck -s jakarta_sandbox`                    |

### Usage

| Description                            | Command                                | Behaviour                                                                       |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Typecheck all Michelson files          | `taq typecheck`                        | Typechecks each Michelson file in `/artifacts` against the default sandbox      |
| Typecheck one Michelson file           | `taq typecheck example.tz`             | Typechecks the file `example.tz` against the default sandbox                    |
| Typecheck two Michelson files          | `taq typecheck example.tz example2.tz` | Typechecks the files `example.tz` and `example2.tz` against the default sandbox |
| Typecheck files with a custom sandbox  | `taq typecheck -s jakarta_sandbox`     | Typechecks each Michelson file in `/artifacts` against the default sandbox      |

