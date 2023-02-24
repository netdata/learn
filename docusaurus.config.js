/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'Learn Netdata',
	tagline:
		"Here you'll find documentation and reference material for monitoring and troubleshooting your systems with Netdata. Discover new insights of your systems, containers, and applications using per-second metrics, insightful visualizations, and every metric imaginable.",
	url: 'https://learn.netdata.cloud',
	baseUrl: '/',
	onBrokenLinks: 'warn',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon-32x32.png',
	organizationName: 'netdata',
	projectName: 'netdata',
	themes: [
		// this is from https://github.com/easyops-cn/docusaurus-search-local
		[
			require.resolve("@easyops-cn/docusaurus-search-local"),
			{
				indexDocs: true,
				indexBlog: false,
				hashed: true,
				highlightSearchTermsOnTargetPage: false,
				explicitSearchResultPath: true,
			},
		],
	],
	themeConfig: {
		image: 'img/netdata_meta-default.png',
		prism: {
			theme: require('prism-react-renderer/themes/dracula'),
		},
		docs: {
			sidebar: {
				hideable: true,
			},
		},
		navbar: {
			title: '',
			logo: {
				alt: 'Netdata Learn logo',
				src: 'img/logo600x600.png',
				height: 40
			},
			items: [
				{
					type: 'doc',
					docId: 'docs',
					position: 'left',
					label: 'Docs',
				},
				{
					to: 'https://blog.netdata.cloud',
					position: 'left',
					label: 'Blog',
				},
				{
					to: 'https://blog.netdata.cloud/tags/how-to',
					position: 'left',
					label: 'Use cases',
				},
				{
					to: 'https://community.netdata.cloud/',
					position: 'left',
					label: 'Community',
				},
                {
                    to: 'https://app.netdata.cloud/',
                    label: 'App',
                    position: 'left',
                },
                {
                    to: 'https://www.netdata.cloud/',
                    label: 'Website',
                    position: 'left',
                },
				{
					type: 'docsVersionDropdown',
					position: 'right',
				},
				{
					to: 'https://app.netdata.cloud/?utm_source=learn&utm_content=top_navigation_sign_up',
					label: 'Sign in',
					position: 'right',
				},
				{
					href: 'https://github.com/netdata/netdata',
					position: 'right',
					className: 'header-github-link',
					'aria-label': 'GitHub repository',
				},
			],
		},
		footer: {
			style: 'dark',
			copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc.`,
		},
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
		'docusaurus-tailwindcss-loader',
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'guides',
				sidebarPath: require.resolve('./src/data/sidebar-guides.js'),
				path: './guides',
				routeBasePath: 'guides',
				include: ['**/*.md', '**/*.mdx'],
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
					docLayoutComponent: "@theme/DocPage",
					showLastUpdateTime: true,
					includeCurrentVersion: false,
					lastVersion: '1.37.x',
					versions: {
						'1.37.x': {
							label: '1.37.x',
							path: '',
						},
						nightly: {
							label: 'nightly',
							path: 'nightly',
						}
					},
				},
				theme: {
					customCss: [require.resolve('./src/css/custom.css')],
				},
				gtag: {
					trackingID: 'GTM-N6CBMJD',
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
			src: 'https://js.hs-scripts.com/4567453.js',
			async: true,
			defer: true,
		},
	],
};
