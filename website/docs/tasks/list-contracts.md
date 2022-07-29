---
title: list-contracts
---

## Overview

Taq `list-contracts` is used to list all contracts that exist in the project's contract registry

:::note
Contracts must be registered ( before they can be originated or compiled

Contracts can be registered in one of two ways:

1. Adding a file manually `taq add-contract <path>`
2. Using a contract template `taq create contract test.mligo`
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                            | Description                             |
| -------------------------------------- | --------------------------------------- |
| N/A                                    | Core task - no plugin implementations   |

### Command

```shell
taq list-contracts
```

### Task Details

| Task Name              | Command                             | Type                      | Description                                                  | 
| ---------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `list-contracts`       | `taq list-contracts`                | Core CLI                  | Lists the contracts that are registered in the project       |

### Usage

| Description                               | Command                               | Behaviour                                                                     |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| List the contracts registered on the project | `taq list-contracts`               | Lists all known contracts that have been registered                           |
