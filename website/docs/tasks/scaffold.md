---
title: scaffold
---

## Overview

Taq `scaffold` is a task used to retrieve and initialize a Taqueria scaffold. Scaffolds are pre-existing Taqueria projects which are useful as a starting point for a new project, or as a learning aid. For more information about scaffolds, see the [scaffold documentation](/docs/scaffolds/scaffold-basics)

When the scaffold task is run, Taqueria does several things:

- Clones the scaffold repository 
- Removes the `.git` directory from the project
- Taq`ifies the project and generates the cache by running `taq` and `taq init` 
- Runs the setup script defined in `scaffold.json`. This will install dependencies and build the Taqueria project and dApp if there is one

Once this is done, you can run `npm run start` from the appropriate directory to start the project and start interacting with the dApp and contracts

:::note
The scaffold task will accept any valid git repository for the `<url> parameter` and will clone it as `git clone` would do. The task will also run `taq init` and `taq` on the project. However, the setup script will not be run as `scaffold.json` is unlikley to exist and there may be further steps required to get the project fully taq`ified
:::

## Plugin Implementations
                     |
This task is implemented by the following plugins:

| Plugin Name                            | Description                             |
| -------------------------------------- | --------------------------------------- |
| N/A                                    | Core task - no plugin implementations   |

### Command

```shell
taq scaffold [url] [path]
```

### Command-Line Arguments

| Argument     | Required | Description                                            | Example Usage                                                                   |
| ------------ | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `[url]`      | No       | URL of the scaffold repository                         | `taq scaffold https://github.com/ecadlabs/taqueria-scaffold-taco-shop`          |
| `[path]`     | No       | Path to the folder you would like to scaffold into     | `taq scaffold https://github.com/ecadlabs/taqueria-scaffold-taco-shop myNewDir` |

### Task Details

| Task Name              | Command                             | Type                      | Description                                                  | 
| ---------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `scaffold`             | `taq scaffold [url] [path]`         | Core CLI                  | Retrieves and initializes a Taqueria Scaffold                |

### Usage

| Description                   | Command                               | Behaviour                                                                     |
| ----------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| Scaffold the default project  | `taq scaffold`                                                                          | Scaffolds the default (`taqueria-scaffold-taco-shop`) project |
| Scaffold a specific project   | `taq scaffold https://github.com/ecadlabs/taqueria-scaffold-nft-project`                | Scaffolds the NFT project into a directory with the repo name |
| Scaffold a specific project   | `taq scaffold https://github.com/ecadlabs/taqueria-scaffold-nft-project ./myNftProject` | Scaffolds the NFT project into the provided directory |

