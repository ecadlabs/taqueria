// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
	plugins: [
		'docusaurus-plugin-sass',
	],
	title: 'Taqueria - Developer Tooling for Tezos',
	tagline: 'Taqueria - Developer Tooling for Tezos',
	url: 'https://taqueria.io',
	baseUrl: '/',
    onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: '/img/favicon.ico',
	organizationName: 'ecadlabs', // Usually your GitHub org/user name.
	projectName: 'taqueria', // Usually your repo name.

	presets: [
		[
			'@docusaurus/preset-classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
				
			{
				docs: {
					path: 'docs',
					sidebarPath: require.resolve('./sidebars.js'),
					// Please change this to your repo.

					editUrl: 'https://github.com/ecadlabs/taqueria/edit/main/website/',
				},
				blog: {
					showReadingTime: true,
					// Please change this to your repo.
					editUrl:
						'https://github.com/ecadlabs/taqueria/edit/main/website/blog/',
				},
				theme: {
					customCss: [
						require.resolve('./src/css/custom.css'),
						require.resolve('./src/css/tables.scss'),
						require.resolve('./src/css/admonitions.scss'),
						require.resolve('./src/css/codeBlock.scss'),
						require.resolve('./src/css/tabs.scss'),
					],
				},
			},
		],
	],
	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			gtag: {
				trackingID: 'G-2VB2D1DHC0',
				anonymizeIP: true,
			  },
			  googleAnalytics: {
				trackingID: 'UA-93014135-3',
				anonymizeIP: true,
			  },
			colorMode: {
				defaultMode: 'light',
				disableSwitch: true,
				respectPrefersColorScheme: false,
				switchConfig: {
					darkIcon: '🌙',
					darkIconStyle: {
						marginLeft: '2px',
					},
					// Unicode icons such as '\u2600' will work
					// Unicode with 5 chars require brackets: '\u{1F602}'
					lightIcon: '\u{1F602}',
					lightIconStyle: {
						marginLeft: '1px',
					},
				},
			},
			navbar: {
				logo: {
					alt: 'Tezos Taqueria Logo',
					src: '/img/Taqueria_magenta_beta.svg',
				},
				items: [
					{
						type: 'doc',
						docId: 'getting-started/installation',
						label: ' Get Started',
						position: 'right',
						className: 'header-link',
					},
					{
						type: 'doc',
						docId: 'intro',
						position: 'right',
						label: 'Docs',
						className: 'header-link',
					},
					{
						type: "doc",
						docId: "getting-started/plugin-basics",
						label: "Plugins",
						position: "right",
						className: "header-link",
					},
					{
						href: 'https://discord.gg/bujt7syVVT',
						position: 'right',
						className: 'header-discord-link',
						'aria-label': 'Discord',
					},
					{
						href: 'https://twitter.com/tezostaqueria',
						position: 'right',
						className: 'header-twitter-link',
						'aria-label': 'Twitter',
					},
					{
						href: 'https://github.com/ecadlabs/taqueria',
						position: 'right',
						className: 'header-github-link',
						'aria-label': 'GitHub repository',
					},
				],
			},
			footer: {
				links: [
					{
						title: 'Contact',
						items: [
							{
								label: 'Report Issues',
								to: 'https://github.com/ecadlabs/taqueria/issues/new/choose',
							},
							{
								label: 'Contribute',
								to: 'https://github.com/ecadlabs/taquito/blob/master/CONTRIBUTING.md',
							},
						],
					},

					{
						title: 'Community',
						items: [
							{
								label: 'Tezos Stack Exchange',
								to: 'https://tezos.stackexchange.com/questions/tagged/taqueria',
							},
							{
								label: 'Discord',
								to: 'https://discord.gg/bujt7syVVT',
							},
							{
								label: 'Twitter',
								to: 'https://twitter.com/tezostaqueria',
							},
							{
								label: 'Code of Conduct',
								to: 'https://github.com/ecadlabs/taquito/blob/master/code-of-conduct.md',
							},
							{
								label: 'GitHub',
								to: 'https://github.com/ecadlabs/taqueria',
							},
						],
					},
					{
						title: 'Docs',
						items: [
							{
								label: 'Quick Start',
								to: '/docs/intro',
							},
							{
								label: "Roadmap",
								to: "/docs/roadmap",
							},
						],
					},
					{
						items: [
							{
								html: `
									<a href="/" target="_blank" rel="noreferrer noopener" aria-label="">
									  <img class='footerLogo' src="/img/Taqueria_purple_beta.svg" alt="" />
									</a>
								  `,
							},
							{
								html: `
									<p class='footerDescription'>
										A New Way to Build on Tezos
									</p>
								  `,
							},
							{
								html: `
									<a class='footerButton' href='https://github.com/ecadlabs/taqueria'>
										<img class='footerGihubLogoButton' src="/img/githubSVG.svg" alt="" />
										GITHUB
									</a>
								  `,
							},
							{
								html: `form`,
							},
							{
								label: `Copyright © 2021 ECAD Labs - This project is licensed under Apache License, Version 2.0`,
								to: '/',
								className: 'copyright',
							},
						],
					},
				],
			},
			prism: {
				theme: lightCodeTheme,
				darkTheme: darkCodeTheme,
			},
		}),
};

module.exports = config;
