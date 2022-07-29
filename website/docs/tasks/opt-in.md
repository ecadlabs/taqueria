---
title: opt-in
---

## Overview

Taq `opt-in` is used to enable the sharing of anonymous usage data with the Taqueria team in order to improve the product

This task will create the file `~/.taq-settings/taq-settings.json`, and set the property `"consent": "opt_in"`

:::note
This is a global action and will opt-in to usage analytics for all projects
:::


## Plugin Implementations

This task is implemented by the following plugins:

| Plugin Name                            | Description                             |
| -------------------------------------- | --------------------------------------- |
| N/A                                    | Core task - no plugin implementations |

### Command

```shell
taq opt-in
```

### Task Details

| Task Name        | Command                       | Type                      | Description                                                  | 
| ---------------- | ----------------------------- | ------------------------- | ------------------------------------------------------------ |
| `opt-in`         | `taq opt-in`                  | Core CLI                  | Opt-in to improving Taqueria by sharing anonymous usage data |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Opt-in to sharing usage analytics         | `taq opt-in`                       | Enables usage analytics sharing in all Taqueria projects                      |

