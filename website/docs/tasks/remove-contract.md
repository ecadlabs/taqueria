---
title: remove-contract
---

## Overview

Taq `remove-contract` removes a smart contract file from the contract registry

### Command

```shell
taq remove-contract <path> 
```

### Task Details
 
| Task Name         | Command                       | Type           | Description                        | 
| ----------------- | ----------------------------- | -------------- | ---------------------------------- |
| `remove-contract` | `taq remove-contract <path> ` | Taqueria Core  | Removes a contract to the registry |

### Command-Line Arguments

| Argument       | Required | Description                                  | Example Usage                                        |
| -------------- | -------- | -------------------------------------------- | ---------------------------------------------------- |
| `<path>`       | Yes      | Path to the Ligo, SmartPy, or Archetype file | `taq remove-contract ./contracts/my-contract.jsligo` |

### Supported Filetypes

| Type             | Extension  |
| ---------------- | ---------- |
| Michelson        | `.tz`      |
| JsLigo           | `jsligo`   |
| CameLigo         | `.mligo`   |
| PascaLigo        | `.pligo`   |     
| ReasonLigo       | `.rligo`   |

## Plugin Implementations

This task is part of the core CLI and is not implemented in any of the plugins
