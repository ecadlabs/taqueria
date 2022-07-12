export const helpContentsSmartpyPlugin: string = `taq <command>

Commands:
  taq init [projectDir]       Initialize a new project
  taq opt-in                  Opt-in to sharing anonymous usage analytics
  taq opt-out                 Opt-out of sharing anonymous usage analytics
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

Taqueria is currently in BETA. You've been warned. :)
`;

export const helpContentsSmartpyPluginSpecific = `taq compile [sourceFile]

Compile a smart contract written in a SmartPy syntax to Michelson code

Options:
      --version     Show version number                                [boolean]
      --build       Display build information about the current version[boolean]
  -p, --projectDir  Path to your project directory               [default: "./"]
  -e, --env         Specify an environment configuration
  -y, --yes         Select "yes" to any prompt        [boolean] [default: false]
      --help        Show help                                          [boolean]
`;

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
`;

export const smartPyCompiledOutput = `
┌────────────────┬─────────────────┐
│ Contract       │ Artifacts       │
├────────────────┼─────────────────┤
│ hello-tacos.py │ HelloTacos_comp │
└────────────────┴─────────────────┘
`.trimStart();

export const smartPyNothingCompiled = `No contracts found to compile.\n`;
