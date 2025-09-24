/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'Learn Netdata',
	tagline:
		"Here you'll find documentation and reference material for monitoring and troubleshooting your systems with Netdata.",
	url: 'https://learn.netdata.cloud',
	baseUrl: '/',
	onBrokenLinks: 'warn',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon-32x32.png',
	organizationName: 'netdata',
	projectName: 'netdata',
	markdown: {
		mermaid: true,
	},
	themes: ['@docusaurus/theme-mermaid'],
	themeConfig: {
		colorMode: {
			defaultMode: 'light',
			disableSwitch: false,
			respectPrefersColorScheme: true,
		},
		mermaid: {
			theme: { light: 'default', dark: 'dark' },
		},
		image: 'img/netdata_meta-default.png',
		docs: {
			sidebar: {
				hideable: true,
				autoCollapseCategories: true,
			},
		},
		navbar: {
			title: '',
			logo: {
				alt: 'Netdata Logo',
				src: 'img/logo-letter-green-black.svg',
				srcDark: 'img/logo-letter-green-white.svg',
			},
			items: [
				// Ask Netdata widget in the top navbar (initial placement; adjust items later if needed)
				{
					type: 'custom-asknetdata-widget-item',
					position: 'right',
				},
			],
		},
		// footer: {

		// 	copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc.`,
		// },
	},
	plugins: [
		[
			"posthog-docusaurus",
			{
				apiKey: 'phc_hnhlqe6D2Q4IcQNrFItaqdXJAxQ8RcHkPAFAp74pubv',
				appUrl: 'https://app.posthog.com',
				enableInDevelopment: false,
			}
		],
		[
			'@docusaurus/plugin-google-tag-manager',
			{
				containerId: 'GTM-N6CBMJD',
			},
		],
		[
			'@docusaurus/plugin-google-gtag',
			{
				trackingID: 'G-J69Z2JCTFB',
			},
		],
	],
	presets: [
		[
			"classic",
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/netdata/netdata/edit/master/',
					// docLayoutComponent: "@theme/DocPage",
					showLastUpdateTime: true,
				},
				theme: {
					customCss: [require.resolve('./src/css/custom.css')],
				},
			})
		],
	],
	stylesheets: [
		{
			href: '/font/ibm-plex-sans-v8-latin-regular.woff2',
			rel: 'preload',
			as: 'font',
			type: 'font/woff2',
			crossorigin: '',
		},
		{
			href: '/font/ibm-plex-sans-v8-latin-500.woff2',
			rel: 'preload',
			as: 'font',
			type: 'font/woff2',
			crossorigin: '',
		},
		{
			href: '/font/ibm-plex-sans-v8-latin-700.woff2',
			rel: 'preload',
			as: 'font',
			type: 'font/woff2',
			crossorigin: '',
		},
		{
			href: '/font/ibm-plex-mono-v6-latin-regular.woff2',
			rel: 'preload',
			as: 'font',
			type: 'font/woff2',
			crossorigin: '',
		},
	],
};
