# Archetype Plugin

This is a plugin developed for Taqueria built on NodeJS using the Taqueria Node SDK and distributed via NPM

The Archetype plugin provides a task to compile Archetype smart contracts (`.arl`) to Michelson `.tz` files

## Requirements

- Node.js v16.3 or later
- Docker v0.8.6 or later

## Installation

To install the Archetype plugin on a Taqueria project, navigate to the project folder and run:
```shell
taq install @taqueria/plugin-archetype
```

## Configuration

No additional configuration is available

## Usage

The Archetype plugin exposes a `taq compile` task in Taqueria which can target one, or all the Archetype contracts in the `contracts` folder and compile them to Michelson `.tz` files output to the `artifacts` folder

The Archetype plugin also exposes a contract template via the `taq create archetypeContract <contractName>` task. This task will create a new Archetype contract in the `contracts` directory, insert archetype contract boilerplate, and register the contract with Taqueria

### Running the Compile Task

The Archetype plugin's `taq compile` task can be run with or without arguments. The basic syntax for the task is `taq compile <file-name>`

Running the `compile` task with no options will result in all registered Archetype smart contracts in the `contracts` folder being compiled to Michelson files in the `artifacts` folder. If you specify an optional filename, only Archetype contracts matching the specified filename in the `contracts` folder will be compiled

> ### :warning: CAUTION
> The `compile` task can be implemented by more than one compiler plugin installed on a project (Archetype, LIGO, SmartPY). If this is the case, you must use the `--plugin Archetype` flag to specify a particular compiler. For example `taq compile --plugin archetype`

### Options

There are no additional options available for this plugin

## Tasks

### The `taq compile` Task

The `compile` task is used for compiling registered Archetype smart contracts to Michelson and the task has the following structure:

```shell
taq compile [contractName]
```

The task takes a filename as an optional argument. If no filename is provided, Taqueria will compile all Archetype files in the `contracts` directory

#### Task Properties

|  attribute |  value                        | 
|------------|:-----------------------------:|
|  task      | 'compile'                     | 
|  command   | 'compile [sourceFile]         | 
|  aliases   | ['c', 'compile-archetype']    |  

### The `create archetypeContract` Task

The `create archetypeContract` task is used to create a new Archetype contract from a template. Running this task will create a new Archetype smart contract in the `contracts` directory and will register that contract with Taqueria
    
```shell
taq create archetypeContract <contractName>
```

The task takes a filename and a required positional argument. The filename must end with `.arl`

#### Task Properties

|  attribute |  value                                         | 
|------------|:----------------------------------------------:|
|  task      | 'create archetypeContract'                     | 
|  command   | 'create archetypeContract [sourceFile]         | 

## Plugin Architecture

This is a plugin developed for Taqueria built on NodeJS using the Taqueria Node SDK

Docker is used under the hood to provide a self contained environment for Archetype to prevent the need for it to be installed on the user's local machine