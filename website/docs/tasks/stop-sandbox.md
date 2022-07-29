---
title: stop sandbox
---

## Overview

Taq `stop sandbox` is used to stop a running sandbox

The task will fail if the sandbox is not running, or if the sandbox was started from a different project

:::note
Sandbox configuration is done in `config.json` and additional documentation about adding new named sandboxes can be found in the [sandbox configuration documentation](/docs/config/sandbox-config)
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                  | Description                       |
| ---------------------------- | --------------------------------- |
| `@taqueria/plugin-flextesa`  | Provides Flextesa sandboxes       |

### Command

```shell
taq stop sandbox <sandboxName>
```

### Task Details

| Task Name        | Command                          | Type                | Description                                           | 
| ---------------- | -------------------------------- | ------------------- | ----------------------------------------------------- |
| `stop sandbox`   | `taq stop sandbox <sandboxName>` |  Plugin - sandboxes | Stops the sandbox with the provided name              |

### Command-Line Arguments

| Argument          | Required | Description                                            | Example Usage                                         |
| ----------------- | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `<sandboxName>`   | Yes      | Name of the sandbox to stop (from `config.json`        | `taq stop sandbox jakarta_sandbox`                    |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Stop the default sandbox                  | `taq stop sandbox local`           | Stops the default sandbox named `local`                                       |

