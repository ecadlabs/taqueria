---
title: opt-out
---

## Overview

Taq `opt-out` is used to disable the sharing of anonymous usage data with the Taqueria team 

This task will set the `consent` property in the file `~/.taq-settings/taq-settings.json` to `opt-out`

:::note
This is a global action and will opt-out of usage analytics for all projects
:::


## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                            | Description                             |
| -------------------------------------- | --------------------------------------- |
| N/A                                    | Core task - no plugin implementations   |

### Command

```shell
taq opt-out
```

### Task Details

| Task Name        | Command                       | Type                      | Description                                                   | 
| ---------------- | ----------------------------- | ------------------------- | ------------------------------------------------------------- |
| `opt-out`        | `taq opt-out`                 | Core CLI                  | Opt-out of sharing anonymous usage data                       |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Opt-out of sharing usage analytics        | `taq opt-out`                      | Enables usage analytics sharing in all Taqueria projects                      |

