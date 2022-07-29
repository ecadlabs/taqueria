---
title: install
---

## Overview

Taq `install` is a core CLI task used to install [Taqueria plugins](/docs/plugins/plugin-basics)

The install task does two things:

1. It installs the plugin specified from NPM by addidng the package and dependencies to `node_modules` and `package.json`
2. It adds the plugin to the Taqueria `config.json` file

## Plugin Implementations

This task can be used to install the following plugins:

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
taq install <pluginName>
```

### Task Details

| Task Name        | Command                             | Type                      | Description                                                  | 
| ---------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `install`        | `taq install <pluginName>`          | Core CLI                  | Installs the given plugin                                    |

### Command-Line Arguments

| Argument          | Required | Description                                            | Example Usage                                         |
| ----------------- | -------- | ------------------------------------------------------ | ----------------------------------------------------- |
| `<pluginName>`    | Yes      | The NPM name of the plugin                             | `taq install @taqueria/plugin-ligo`                   |

### Usage

| Description                               | Command                            | Behaviour                                                                     |
| ----------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Install a plugin                          | `taq install <pluginName>`         | Installs the provided Taqueria plugin from NPM                                |

