---
title: init
---

## Overview

Taq `generate types` is used to initialize a Taqueria project. It can be used to create a new project from scratch, or can `taq'ify` an existing project

Running `taq init` with no argumets will `taq`ify the current directory, while `taq init <path>` will create a new taq`ified directory at the given path

The task will create the following directories:

- `./taq` - Taqueria configuation files (`config.json`, `state.json`, `development-state.json`)
- `./contracts` - The default directory for smart contract source files
- `./artifacts` - The default directory for Michelson files

:::note
This is one of two ways to create a taq`ified project, the other is to use the `taq scaffold` task
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                            | Description                             |
| -------------------------------------- | --------------------------------------- |
| N/A                                    | Core task - no plugin implementations   |

### Command

```shell
taq init [path]
```

### Task Details

| Task Name        | Command                       | Type                      | Description                                                  | 
| ---------------- | ----------------------------- | ------------------------- | ------------------------------------------------------------ |
| `init`           | `taq generate types [path]`   | Core CLI                  | Creates a Taqueria project (taq`ifies a directory)           |

### Command-Line Arguments

| Argument          | Required | Description                                            | Example Usage                                         |
| ----------------- | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `[path]`          | No       | Path of the directory to taq`ify                       | `taq init ./myNewTaqueriaProject`                     |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Taq`ify the current directory             | `taq init`                         | Generates types for each Michelson file in the `/artifacts` directory         |
| Create and taq`ify the given directory    | `taq init [path]`                  | Generates types for the contract at the given path                            |

