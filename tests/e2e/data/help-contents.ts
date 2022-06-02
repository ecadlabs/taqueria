export const helpContentsNoProject: string = `taq [command]

Commands:
  taq init [projectDir]                     Initialize a new project
  taq scaffold [scaffoldUrl] [scaffoldProj  Generate a new project using pre-mad
  ectDir]                                   e scaffold

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]  

🚧 Taqueria is currently in BETA. You've been warned! 🚧

Your config.json file is invalid
`

export const helpContentsForProject: string = `taq <command>

Commands:
  taq init [projectDir]                  Initialize a new project
  taq scaffold [scaffoldUrl] [scaffoldP  Generate a new project using a pre
  rojectDir]                             -configured scaffold
  taq install <pluginName>               Install a plugin
  taq uninstall <pluginName>             Uninstall a plugin

Options:
      --version     Show version number                           [boolean]
      --build       Display build information about the current version
                                                                  [boolean]
  -p, --projectDir  Path to your project directory          [default: "./"]
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]  
  -e, --env         Specify an environment configuration
      --help        Show help                                     [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsLigoPlugin: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq install <pluginName>    Install a plugin
  taq uninstall <pluginName>  Uninstall a plugin
  taq compile [sourceFile]    Compile a smart contract written in a Ligo syntax
                              to Michelson code       [aliases: c, compile-ligo]

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsLigoPluginSpecific = `taq compile [sourceFile]

Compile a smart contract written in a Ligo syntax to Michelson code

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
  -e, --entrypoint  The entry point that will be compiled
  -s, --syntax      The syntax used in the contract
  -i, --infer       Enable type inference
`

export const helpContentsSmartpyPlugin: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq install <pluginName>    Install a plugin
  taq uninstall <pluginName>  Uninstall a plugin
  taq compile [sourceFile]    Compile a smart contract written in a SmartPy synt
                              ax to Michelson code [aliases: c, compile-smartpy]

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsSmartpyPluginSpecific = `taq compile [sourceFile]

Compile a smart contract written in a SmartPy syntax to Michelson code

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`

export const helpContentsSmartpyTeapotSpecific = `taq teapot

Have a cup of tea

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]  
      --help        Show help                                          [boolean]
  -g, --green       Make green tea instead                             [boolean]
`

export const helpContentsLigoSmartpy: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq install <pluginName>    Install a plugin
  taq uninstall <pluginName>  Uninstall a plugin
  taq compile                 Provided by more than one plugin. The option --plu
                              gin is required.

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsLigoSmartpySpecific = `taq compile

Provided by more than one plugin. The option --plugin is required.

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
      --plugin      Specify which plugin should be used to execute this task
  [required] [choices: "@taqueria/plugin-ligo", "ligo", "@taqueria/plugin-smartp
                                                                  y", "smartpy"]
`

export const helpContentsLigoArchetype: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq install <pluginName>    Install a plugin
  taq uninstall <pluginName>  Uninstall a plugin
  taq compile                 Provided by more than one plugin. The option --plu
                              gin is required.

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsLigoArchetypeSpecific = `taq compile

Provided by more than one plugin. The option --plugin is required.

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
      --plugin      Specify which plugin should be used to execute this task
  [required] [choices: "@taqueria/plugin-ligo", "ligo", "@taqueria/plugin-archet
                                                              ype", "archetype"]
`

export const helpContentsArchetypePlugin: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq install <pluginName>    Install a plugin
  taq uninstall <pluginName>  Uninstall a plugin
  taq compile [sourceFile]    Compile a smart contract written in a Archetype sy
                              ntax to Michelson code
                                                 [aliases: c, compile-archetype]

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsArchetypePluginSpecific: string = `taq compile [sourceFile]

Compile a smart contract written in a Archetype syntax to Michelson code

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`

export const helpContentsTaquitoPlugin: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq install <pluginName>    Install a plugin
  taq uninstall <pluginName>  Uninstall a plugin
  taq deploy [contract]       Deploy a smart contract to a particular environmen
                              t                             [aliases: originate]

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsTaquitoPluginSpecific = `taq deploy [contract]

Deploy a smart contract to a particular environment

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`

export const helpContentsFlextesaPlugin: string = `taq <command>

Commands:
  taq init [projectDir]            Initialize a new project
  taq install <pluginName>         Install a plugin
  taq uninstall <pluginName>       Uninstall a plugin
  taq start sandbox [sandboxName]  Starts a flextesa sandbox    [aliases: start]
  taq stop sandbox [sandboxName]   Stops a flextesa sandbox      [aliases: stop]
  taq list accounts <sandboxName>  List the balances of all sandbox accounts

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsFlextesaPluginStartSandbox = `taq start sandbox [sandboxName]

Starts a flextesa sandbox

Positionals:
  sandboxName  The name of the sandbox to start

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`
export const helpContentsFlextesaPluginStopSandbox = `taq stop sandbox [sandboxName]

Stops a flextesa sandbox

Positionals:
  sandboxName  The name of the sandbox to stop

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`

export const helpContentsGenerateTypesPlugin = `taq <command>

Commands:
  taq init [projectDir]               Initialize a new project
  taq install <pluginName>            Install a plugin
  taq uninstall <pluginName>          Uninstall a plugin
  taq generate types [typescriptDir]  Generate types for a contract to be used w
                                      ith taquito       [aliases: gen, gentypes]

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]

🚧 Taqueria is currently in BETA. You've been warned! 🚧
`

export const helpContentsGenerateTypesPluginSpecific = `taq generate types [typescriptDir]

Generate types for a contract to be used with taquito

Positionals:
  typescriptDir  The output directory for the generated type files
                                                              [default: "types"]

Options:
      --version        Show version number                             [boolean]
      --build          Display build information about the current version
                                                                       [boolean]
  -p, --projectDir     Path to your project directory            [default: "./"]
  -e, --env            Specify an environment configuration
  -y, --yes            Select "yes" to any prompt     [boolean] [default: false]
      --help           Show help                                       [boolean]
  -t, --typeAliasMode  The type aliases used in the generated types
                                                     [choices: "file", "simple"]
`

export const helpContentsFlextesaPluginListAccounts = `taq list accounts <sandboxName>

List the balances of all sandbox accounts

Positionals:
  sandboxName  The name of the sandbox to use                         [required]

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`