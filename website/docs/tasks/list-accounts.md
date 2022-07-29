---
title: list accounts
---

## Overview

Taq `list accounts` is a task exposed by the [Flextesa plugin](/docs/plugins/plugin-basics) which lists the accounts and balances that exist 

:::note
In order to use this plugin, you must first install the Flextesa plugin `taq install @taqueria/plugin-flextesa`, and have a sandbox started on the project `taq start sandbox <sandboxName>`
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                  | Description                       |
| ---------------------------- | --------------------------------- |
| `@taqueria/plugin-flextesa`  | Provides Flextesa sandboxes       |

### Command

```shell
taq list accounts <sandboxName>
```

### Task Details

| Task Name              | Command                             | Type                      | Description                                                  | 
| ---------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `list accounts`        | `taq list accounts <sandboxName>`   | Plugin - sandboxes        | Lists the accounts and balances that exist on the sandbox    |

### Command-Line Arguments

| Argument          | Required | Description                                                    | Example Usage                                         |
| ----------------- | -------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| `<sandboxName>`   | Yes      | The name of the sandbox to query (configured in `config.json`) | `taq list accounts local`                             |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| List accounts on the `<local>` sandbox    | `taq install <pluginName>`         | Lits the accounts on the default sandbox named local                          |

