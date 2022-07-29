---
title: publish
---

## Overview

Taq `publish` is used to upload and publish files from a given directory to IPFS via Pinata. This can be used to upload contract or token metadata, image files, or any other file type supported by IPFS

In order to use `publish`, you must have a valid API key and secret. You can get these from [Pinata](https://pinata.cloud/dashboard/api). For additional details, please see the [IPFS Pinata plugin](/docs/plugins/plugin-ipfs-pinata) documentation

### Command

```shell
taq publish <path> 
```

### Task Details
 
| Task Name         | Command                       | Type           | Description                        | 
| ----------------- | ----------------------------- | -------------- | ---------------------------------- |
| `publish`         | `taq publish <path>`          | Plugin - IPFS  | Publishes files to IPFS via Pinata |

### Command-Line Arguments

| Argument       | Required | Description                                      | Example Usage                                        |
| -------------- | -------- | ------------------------------------------------ | ---------------------------------------------------- |
| `<path>`       | Yes      | Path to a file, or directory of files to publish | `taq publish ./nft-art`                              |

