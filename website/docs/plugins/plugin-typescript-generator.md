---
title: Contract Types Plugin
---

This plugin provides a `taq generate types` command which will generate and export TypeScript types from compiled Michelson smart contracts. These generated types then work with your IDE and Taquito, providing type safety and an improved code authoring experience

Benefits of using generated types:
- Static types used to call smart contract methods are checked at compile time, improving code reliability
- Generated types enable auto-completion and syntax highlighting in your IDE
- Developing apps with Taquito is faster and more reliable
- The VS Code Extension provides tooltip hints for parameter types used to call a smart contract method
- Calling smart contract methods with types is done directly, removing the need for utility methods 
- Simplifies your code and improves readability

## Requirements

- Node JS v16 or later
- Taquito v11.2 or later (optional)

## Installation

To install the Contract Types plugin on a Taqueria project, navigate to the project folder and run:
```shell
taq install @taqueria/plugin-contract-types
```

## Configuration

This plugin will look for Michelson files according to the `artifactsDir` configured in `./.taq/config.json`. By default, this value is `/artifacts` but can be changed as needed

## Usage

The plugin provides a single command to Taqueria: `taq generate types`

This will look for `.tz` files in the `/artifacts` directory and will generate a series of related `.ts` files in the `/types` directory. These files export type definitions for each method which can then be used by Taquito and your IDE

### The `generate types` Command

#### Syntax
```shell
taq generate types [typeOutputDir]
```

#### Parameters

| parameter     |  required  | description                                        |       
|:-------------:|:-----------|----------------------------------------------------|
| typeOutputDir | no         | The output directory for the `.ts` files generated |

#### CLI Aliases

The following aliases are interchangable with `generate types`
- `gen types`
- `genTypes`

#### Options

The `generate types` command will accept the following optional parameters:

| flag  |  name         | description                                  |       
|:-----:|:--------------|----------------------------------------------|
|  -t   | typeAliasMode | The type aliases used in the generated types |
 

## Taquito Workflow Improvements

The generated TS types can be used in a Taquito project which provides an improved developing experience, and simplifies the way types are provided to Taquito method calls. Some examples of how these changes are put into use are detailed below  

:::note
You can view the full example in the `example-usage.ts` file on Github: [taqueria/taqueria-plugin-contract-types/example](https://github.com/ecadlabs/taqueria/blob/main/taqueria-plugin-contract-types/example/example-usage.ts)
:::

### Calling the `.at` Method of a Contract

Traditionally, calling the `.at` method of a contract with Taquito required the developer to pass the parameter's type via a utility method:
```ts Utility Method
const contract = await Tezos.contract.at(`tz123`, contractAbstractionComposer<TestContractType>());
```
or a cast:
```ts Cast
const contract = await Tezos.contract.at(`tz123`) as ContractProviderFromContractType<TestContractType>;
```

When using generated types, the developer can now directly use the type in the call to `.at`:
```ts 
const contract = await Tezos.contract.at<TestContract>(`tz123`);
```

### Using a Wallet

Using a wallet is simplified in a similar way:
```ts 
const contract = await Tezos.wallet.at(`tz123`, walletAbstractionComposer<TestContractType>());
```

Becomes:
```ts 
const contract = await Tezos.wallet.at<TestWalletContract>(`tz123`);
```

### Contract Origination

The Taquito contract origination did not have any way to provide a type, so this used to require a cast:
```ts
const originationResult = await Tezos.contract.originate({...});
const contract = await originationResult.contract(5) as ContractProviderFromContractType<TestContractType2>;
```

Now, it can directly accept a type:
```ts
const originationResult = await Tezos.contract.originate({...});
const contract = await originationResult.contract<TestContract2>(5);
```


### Storage

When accessing storage, there was no way to pass the type through the contract class. This required providing the type a second time:
```ts
const contract = await Tezos.contract.at(`tz123`) as ContractProviderFromContractType<TestContractType>;
const storage = await contract.storage<StorageFromContractType<TestContractType>>();
```

Now, the contract type provides the default storage type:
```ts
const contract = await Tezos.contract.at<TestContract>(`tz123`);
const storage = await contract.storage();
```

