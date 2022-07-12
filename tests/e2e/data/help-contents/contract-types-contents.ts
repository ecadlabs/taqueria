export const helpContentsContractTypesPlugin = `taq <command>

Commands:
  taq init [projectDir]               Initialize a new project
  taq opt-in                          Opt-in to sharing anonymous usage analytic
                                      s
  taq opt-out                         Opt-out of sharing anonymous usage analyti
                                      cs
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

Taqueria is currently in BETA. You've been warned. :)
`;

export const helpContentsContractTypesPluginSpecific = `taq generate types [typescriptDir]

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
`;
