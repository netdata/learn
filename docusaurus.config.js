const {themes: prismThemes} = require('prism-react-renderer');

// Extend Dracula with missing token type mappings for YAML, config files, etc.
const draculaExtended = {
	...prismThemes.dracula,
	styles: [
		...prismThemes.dracula.styles,
		{types: ['number', 'boolean', 'constant', 'property'], style: {color: 'rgb(189, 147, 249)'}},  // purple
		{types: ['atrule', 'keyword', 'key'], style: {color: 'rgb(139, 233, 253)'}},                   // cyan
		{types: ['selector', 'tag'], style: {color: 'rgb(255, 121, 198)'}},                              // pink
		{types: ['operator', 'entity', 'url'], style: {color: 'rgb(248, 248, 242)'}},                   // base white
	],
};

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'Learn Netdata',
	tagline:
		"Here you'll find documentation and reference material for monitoring and troubleshooting your systems with Netdata.",
	url: 'https://learn.netdata.cloud',
	baseUrl: '/',
	onBrokenLinks: 'warn',
	favicon: 'img/favicon-32x32.png',
	organizationName: 'netdata',
	projectName: 'netdata',
	markdown: {
		mermaid: true,
		hooks: {
			onBrokenMarkdownLinks: 'warn',
		},
	},
	themes: [
		'@docusaurus/theme-mermaid',
		['@easyops-cn/docusaurus-search-local', {
			hashed: true,
			searchBarPosition: 'right',
			explicitSearchResultPath: true,
			searchResultLimits: 12,
		}],
	],
	themeConfig: {
		colorMode: {
			defaultMode: 'light',
			disableSwitch: false,
			respectPrefersColorScheme: true,
		},
		mermaid: {
			theme: { light: 'default', dark: 'dark' },
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: draculaExtended,
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
				// Left side - navigation
				{
					to: 'https://www.netdata.cloud/integrations/',
					position: 'left',
					label: 'Integrations',
				},
				{
					position: 'left',
					label: 'Community',
					items: [
						{
							label: 'GitHub',
							href: 'https://github.com/netdata/netdata',
						},
						{
							label: 'GitHub Discussions',
							href: 'https://github.com/netdata/netdata/discussions',
						},
						{
							label: 'Discord',
							href: 'https://discord.com/invite/mPZ6WZKKG2',
						},
						{
							label: 'Forums',
							href: 'https://community.netdata.cloud/',
						},
						{
							label: 'Reddit',
							href: 'https://www.reddit.com/r/netdata/',
						},
					]
				},
				{
					position: 'left',
					label: 'Learn',
					items: [
						{
							label: 'Blog',
							href: 'https://blog.netdata.cloud/',
						},
						{
							label: 'Academy',
							href: 'https://www.netdata.cloud/academy/',
						},
						{
							label: 'YouTube',
							href: 'https://www.youtube.com/c/Netdata',
						},
						{
							label: 'Roadmap',
							href: 'https://www.netdata.cloud/roadmap/',
						},
					]
				},
				{
					position: 'left',
					label: 'Trust & Status',
					items: [
						{
							label: 'Trust Center (SOC2)',
							href: 'https://trust.netdata.cloud',
						},
						{
							label: 'OpenSSF Best Practices',
							href: 'https://www.bestpractices.dev/en/projects/2231/',
						},
						{
							label: 'Service Status',
							href: 'https://status.netdata.cloud/',
						},
					]
				},
				{
					to: 'https://app.netdata.cloud/spaces/netdata-demo?utm_source=learn&utm_content=top_navigation_demo',
					label: 'Live Demo',
					position: 'left',
					className: 'navbar-item-live-demo',
				},
				// Right side - GitHub icon + Sign In
				{
					href: 'https://github.com/netdata/netdata',
					position: 'right',
					className: 'header-github-link',
					'aria-label': 'GitHub repository',
				},
				{
					href: 'https://app.netdata.cloud/?utm_source=learn&utm_content=top_navigation_sign_in',
					label: 'Sign In',
					position: 'right',
					className: 'navbar-item-sign-in',
				},
			],
		},
		// footer: {

		// 	copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc.`,
		// },
	},
	plugins: [
		[
			'@docusaurus/plugin-client-redirects',
			{
				redirects: [
					{
						from: '/docs/ask-netdata',
						to: '/docs/ask-nedi',
					},
				],
			},
		],
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
		// Nedi embed styles
		'https://nedi.netdata.cloud/test.css?v=16',
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
	scripts: [
      {
        src: 'https://static.reo.dev/8a197d1119ef2d4/reo.js',
        defer: true,
        'data-reo-client-id': '8a197d1119ef2d4',
      },
      // Nedi dependencies (CDN) - async to avoid blocking other scripts
      { src: 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js', async: true },
      { src: 'https://cdn.jsdelivr.net/npm/mermaid@11.12.2/dist/mermaid.min.js', async: true },
      { src: 'https://cdn.jsdelivr.net/npm/@viz-js/viz@3.24.0/dist/viz-global.js', async: true },
      { src: 'https://cdn.jsdelivr.net/npm/turndown@7.2.2/dist/turndown.js', async: true },
      { src: 'https://cdn.jsdelivr.net/npm/@guyplusplus/turndown-plugin-gfm@1.0.7/dist/turndown-plugin-gfm.js', async: true },
      // Nedi embed
      { src: 'https://nedi.netdata.cloud/ai-agent-public.js?v=16', async: true },
      { src: 'https://nedi.netdata.cloud/test.js?v=16', async: true },
    ],
    headTags: [
      {
        // gtag stub - prevents "window.gtag is not a function" on SPA navigation
        tagName: 'script',
        attributes: {},
        innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}`,
      },
      {
        tagName: 'script',
	    attributes: {},
        innerHTML: `
          window.addEventListener('load', function() {
            if (typeof Reo !== 'undefined') {
              Reo.init({ clientID: '8a197d1119ef2d4' });
            }
          });
        `,
      },
    ],
};
