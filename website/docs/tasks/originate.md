---
title: originate
---

## Overview

Taq `originate` is used to originate one or many Michelson smart contracts to one or more sandboxes or networks. Before originating a contract, you must define the initial storage value for the contract in the envrionment you are originating to. Instructions for this can be found [here](/docs/config/environments)

[Taqueria Environments](/docs/config/environments) are used to specify the target for origination

The task expects the Michelson files to be in the `/artifacts` directory

:::note
Contracts must be added to the [Contract Registry](/docs/tasks/add-contract) (`taq add-contract example.mligo`) in order to be originated
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                  | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `@taqueria/plugin-taquito`   | Originates contracts to a target environment   |

### Command

```shell
taq originate [path]
``` 


### Task Details

| Task Name      | Command                       | Type                | Description                                             | 
| -------------- | ----------------------------- | ------------------- | ------------------------------------------------------- |
| `originate`    | `taq originate [path]`        | Plugin - Taquito    | Originates one, multiple, or all contracts in a project |

### Command-Line Arguments

| Argument     | Required | Shortflag | Description                                            | Example Usage                                   |
| ------------ | -------- | --------- | ------------------------------------------------ | ----------------------------------------------------- |
| `<path>`     | No       |           | Path to one or more Michelson files to originate | `taq originate my-contract.tz`                        |
|  `--env`     | No       | `-e`      | The environment to target for origination        | `taq originate -env testing`                          |      

### Usage

| Description                 | Command                              | Behaviour                                                                                 |
| --------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Originate all contracts       | `taq originate`                    | Originates all Michelson files in the `/artifacts` directory to the default environment   |
| Originate one contract        | `taq originate [path]`             | Originates the contract at the given path to the default environment                      |
| Originate to an environment   | `taq originate --env [envName]`    | Originates all contracts in the `/artifacts` directory to the environment named [envName] |

 
### Supported Filetypes

| Type             | Extension  |
| ---------------- | ---------- |
| Michelson        | `.tz`      |



