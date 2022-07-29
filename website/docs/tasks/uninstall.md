---
 title: uninstall
---

## Overview

Taq `uninstall` is a core CLI task used to uninstall [Taqueria plugins](/docs/plugins/plugin-basics)

The uninstall task does two things:

- Removes the plugin from the Taqueria configuration and cache
- Removes the package and dependencies from `node_modules`

:::note
To uninstall a plugin, it must be installed on the project
:::

## Plugin Implementations

This task can be used to uninstall the following plugins:

| Name                                                   |  `<pluginName>`                   |  Description                                                            |
|--------------------------------------------------------|-----------------------------------|-------------------------------------------------------------------------|
| [Archetype](/docs/plugins/plugin-archetype/)           | `@taqueria/plugin-archetype`      | A compiler for the Archetype smart contract language                    |
| [Contract Types](/docs/plugins/plugin-contract-types/) | `@taqueria/plugin-contract-types` | A type generator that produces TS types from Michelson code             |
| [Flextesa](/docs/plugins/plugin-flextesa/)             | `@taqueria/plugin-flextesa`       | A Tezos sandbox (testnet) that runs locally on your machine             | 
| [IPFS Pinata](/docs/plugins/plugin-ipfs-pinata/)       | `@taqueria/plugin-ipfs-pinata`    | Publishes metadata or media files to IPFS via Pinata                    |
| [Jest](/docs/plugins/plugin-jest/)                     | `@taqueria/plugin-jest`           | Provides support for Jest testing                                       |
| [LIGO](/docs/plugins/plugin-ligo/)                     | `@taqueria/plugin-ligo`           | A compiler for the LIGO smart contract language                         |
| [SmartPy](/docs/plugins/plugin-smartpy/)               | `@taqueria/plugin-smartpy`        | A compiler for the SmartPy smart contract language                      |
| [Taquito](/docs/plugins/plugin-taquito/)               | `@taqueria/plugin-taquito`        | A front-end Tezos framework used to originate smart contracts           |
| [Tezos Client](/docs/plugins/plugin-tezos-client/)     | `@taqueria/plugin-tezos-client`   | An abstraction of `tezos-client`, providing simulation and typechecking |

### Command

```shell
taq uninstall <pluginName>
```

### Task Details

| Task Name        | Command                             | Type                      | Description                                                  | 
| ---------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `uninstall`        | `taq uninstall <pluginName>`      | Core CLI                  | Uninstalls the plugin provided                               |

### Command-Line Arguments

| Argument          | Required | Description                                            | Example Usage                                         |
| ----------------- | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `<pluginName>`    | Yes      | The name of the plugin                                 | `taq uninstall @taqueria/plugin-ligo`                 |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Uninstall a plugin                        | `taq uninstall <pluginName>`       | Uninstalls a Taqueria plugin from the project                                 |

