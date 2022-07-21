/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure

  docs: [
    {
      type: "category",
      label: "Getting Started",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "getting-started/installation",
        "intro",
        "getting-started/quickstart",
        
      ],
    },
    {
      type: "category",
      label: "Configuration",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "config/networks",
        "config/implicit-accounts",
        "config/sandbox-config",
        "config/environments"
      ],
    },
    {
      type: "category",
      label: "Plugin Reference",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "plugins/plugin-basics",
        "plugins/plugin-archetype",
        "plugins/plugin-contract-types",
        "plugins/plugin-flextesa",
        "plugins/plugin-ipfs-pinata",
        "plugins/plugin-jest",
        "plugins/plugin-ligo",
        "plugins/plugin-smartpy",
        "plugins/plugin-taquito",
        "plugins/plugin-tezos-client",
      ],
    },
    // {
    //   type: "category",
    //   label: "Taqueria Libraries",
    //   className: "sidebarHeader",
    //   collapsed: false,
    //   collapsible: false,
    //   items: [
    //     "libraries/taqueria-state"
    //   ],
    // },
    {
      type: "category",
      label: "Scaffolds",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "scaffolds/scaffold-basics",
        "scaffolds/taco-shop",
        "scaffolds/quickstart",
        "scaffolds/nft-scaffold",
      ],
    },    
    {
      type: "category",
      label: "Tutorials",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "tutorials/hello-tacos-tutorial"
      ],
    },
    {
      type: "category",
      label: "Taqueria Internals",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "taqueria-internals/architecture",
        "data-collection-policy"
      ],
    },
    {
      type: "category",
      label: "Taqueria Development",
      className: "sidebarHeader",
      collapsed: false,
      collapsible: false,
      items: [
        "roadmap",
        "release-notes",
        "taqueria-dev/contributions",
        "taqueria-dev/making-plugins",
        "taqueria-dev/pr-npm-packages"
      ],
    },
  ]
};

module.exports = sidebars;
