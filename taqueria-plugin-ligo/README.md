# Taqueria LIGO Plugin

The LIGO plugin provides a task to compile LIGO smart contracts to Michelson `.tz` files

## Requirements

- Taqueria v0.8.0 or later
- Node.js v16.3 or later
- Docker v0.8.4 or later

## Installation

To install the LIGO plugin on a Taqueria project, navigate to the project folder and run:
```shell
taq install @taqueria/plugin-ligo
```

## Configuration

No additional configuration is available

## Usage

The LIGO plugin exposes a `compile` task in Taqueria which can target one, or all the LIGO contracts in the `contracts` folder and compile them to Michelson `.tz` files  output to the `artifacts` folder

The LIGO plugin also exposes a contract template via the `taq create contract <contractName>` task. This task will create a new LIGO contract in the `contracts` directory, insert some boilerplate LIGO contract code and will register the contract with Taqueria

## Tasks

### The `taq compile` Task

The LIGO plugin's `taq compile` task can be run with or without arguments. The structure for the task is:

```shell
taq compile <file-name>
```

Running the `compile` task with no options will result in any registered LIGO smart contracts in the `contracts` folder being compiled to Michelson files in the `artifacts` folder. If you speficy an optional filename, only LIGO contracts matching the specified filename in the `contracts` folder will be registered and compiled

> ### :warning: CAUTION
> The `compile` task can be implemented by more than one compiler plugin installed on a project (LIGO, Archetype, SmartPY). If this is the case, you must use the `--plugin ligo` flag to specify a particular compiler

#### Options

The LIGO `compile` task will accept the following optional parameters:

| flag  |  name       | description                           |   
|:-----:|:------------|---------------------------------------|
|  -e   | entry-point | The entry point that will be compiled |
|  -s   | syntax      | The syntax used in the contract       |    
|  -i   | infer       | Enable type inference                 |   

#### Task Properties

|  attribute |  value                        | 
|------------|:-----------------------------:|
|  task      | 'compile'                     | 
|  command   | 'compile [sourceFile]         | 
|  aliases   | ['c', 'compile-ligo']    |  

### The `create contract` Template

The `create contract` task is used to create a new LIGO contract from a template. Running this task will create a new LIGO smart contract in the `contracts` directory, insert boilerplate contract code and will register that contract with Taqueria
    
```shell
taq create contract <contractName>
```

The `create contract` task takes a filename a required positional argument. The filename must end with a LIGO extension (`.jsligo`, `.mligo`, etc)

## Plugin Architecture

This is a plugin developed for Taqueria built on NodeJS using the Taqueria Node SDK

Docker is used under the hood to provide a self contained environment for Archetype to prevent the need for it to be installed on the user's local machine