# Taqueria Taquito Plugin

The Taquito plugin provides a stateful task to originate a smart contract to a Tezos sandbox or testnet

## Installation

To install the Taquito plugin on a Taqueria project, navigate to the project folder and run:
```shell
taq install @taqueria/plugin-taquito
```

## Configuration

The target networks, sandboxes, and environments are configured in the Taqueria project's `config.json` file. For additional information on configuring network, documentation can be found [here](/docs/config/networks/)

## Usage

###  The `taq originate` task

The Taquito plugin exposes an `taq originate` task in Taqueria which will originate the specified Michelson contract to a Taqueria environment

Basic usage is:

```shell
taq originate
```

This will originate all '.tz' files in the `/artifacts` directory to the default environment (the sandbox named `local`)

To target a different environment, use the `--environment` flag with the named Taqueria environment you want to target :

```shell
taq originate -e jakartanetEnv
```

## Plugin Architecture

This is a plugin developed for Taqueria built on NodeJS using the Taqueria Node SDK

The plugin provides a single task `originate`, used for originating Michelson contracts to a Tezos network:

|  attribute |  value                   | 
|------------|:-------------------------|
|  task      | 'deploy'                 | 
|  command   | 'deploy [contract]`      | 
|  aliases   | ['originate']            |  

