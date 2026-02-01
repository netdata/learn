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
    ],
    headTags: [
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
