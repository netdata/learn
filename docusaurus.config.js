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
				{
					to: 'https://www.netdata.cloud/features/',
					position: 'left',
					label: 'Features',
					className: 'navbar-item-hide-large-1',
					style: { fontWeight: '500' }
				},
				{
					to: 'https://www.netdata.cloud/open-source/',
					position: 'left',
					label: 'Open Source',
					className: 'navbar-item-hide-large-2',
					style: { fontWeight: '500' }
				},
				{
					to: 'https://www.netdata.cloud/pricing/',
					position: 'left',
					label: 'Pricing',
					className: 'navbar-item-hide-large-3',
					style: { fontWeight: '500' }
				},
				{
					to: 'https://www.netdata.cloud/integrations/',
					position: 'left',
					label: 'Integrations',
					className: 'navbar-item-hide-large-4',
					style: { fontWeight: '500' }
				},
				{
					position: 'left',
					label: 'Use cases',
					className: 'navbar-item-hide-large-5',
					style: { fontWeight: '500' },
					items: [
						{
							label: 'Response Time',
							to: 'https://www.netdata.cloud/response-time-monitoring/'
						},
						{
							label: 'Cloud',
							to: 'https://www.netdata.cloud/cloud-monitoring/',
						},
						{
							label: 'Web Servers',
							to: 'https://www.netdata.cloud/webserver-monitoring/',
						},
						{
							label: 'Containers',
							to: 'https://www.netdata.cloud/container-monitoring/',
						}
					]
				},
				{
					position: 'left',
					label: 'Resources',
					className: 'navbar-item-hide-large-6',
					style: { fontWeight: '500' },
					items: [
						{
							type: 'doc',
							docId: 'Welcome to Netdata/Welcome to Netdata',
							label: 'Documentation'
						},
						{
							label: 'Community',
							to: 'https://www.netdata.cloud/community/',
						},
						{
							label: 'About',
							to: 'https://www.netdata.cloud/about/',
						},
						{
							label: 'Forums',
							to: 'https://community.netdata.cloud/',
						},
						{
							label: 'Blog',
							to: 'https://blog.netdata.cloud/',
						},
						{
							label: 'Roadmap',
							to: 'https://www.netdata.cloud/roadmap/'
						},
						{
							label: 'Videos',
							to: 'https://www.youtube.com/c/Netdata/'
						},
					]
				},

				{
					to: 'https://app.netdata.cloud/spaces/netdata-demo?utm_source=learn&utm_content=top_navigation_demo',
					label: 'Live Demo',
					position: 'left',
					className: 'navbar-item-hide-large-7',
					style: { fontWeight: '500' }
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
		// Nedi embed styles
		'https://nedi.netdata.cloud/test.css?v=9',
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
      { src: 'https://cdn.jsdelivr.net/npm/turndown@7.2.2/dist/turndown.js', async: true },
      { src: 'https://cdn.jsdelivr.net/npm/@guyplusplus/turndown-plugin-gfm@1.0.7/dist/turndown-plugin-gfm.js', async: true },
      // Nedi embed
      { src: 'https://nedi.netdata.cloud/ai-agent-public.js?v=9', async: true },
      { src: 'https://nedi.netdata.cloud/test.js?v=9', async: true },
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
