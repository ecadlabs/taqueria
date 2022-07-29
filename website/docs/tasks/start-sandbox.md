---
title: start sandbox
---

## Overview

Taq `start sandbox` is used to start a Flextesa sandbox

:::note
Named sandboxes are configuredin `config.json`. Additional documentation about adding new named sandboxes can be found in the [sandbox configuration documentation](/docs/config/sandbox-config)
:::

## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                  | Description                       |
| ---------------------------- | --------------------------------- |
| `@taqueria/plugin-flextesa`  | Provides Flextesa sandboxes       |

### Command

```shell
taq start sandbox <sandboxName>
```

### Task Details

| Task Name        | Command                            | Type                | Description                                           | 
| ---------------- | ---------------------------------- | ------------------- | ----------------------------------------------------- |
| `start sandbox`   | `taq start sandbox <sandboxName>` |  Plugin - sandboxes | Starts the sandbox with the provided name             |

### Command-Line Arguments

| Argument          | Required | Description                                            | Example Usage                                         |
| ----------------- | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `<sandboxName>`   | Yes      | Name of the sandbox to start (from `config.json`       | `taq start sandbox jakarta_sandbox`                   |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Start the default sandbox                 | `taq start sandbox local`          | Starts the default sandbox named `local`                                       |

