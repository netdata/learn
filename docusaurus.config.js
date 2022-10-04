/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
	title: 'Learn Netdata',
	tagline:
		"Here you'll find documentation, guides, and reference material for monitoring and troubleshooting your systems with Netdata. Discover new insights of your systems, containers, and applications using per-second metrics, insightful visualizations, and every metric imaginable.",
	url: 'https://learn.netdata.cloud',
	baseUrl: '/',
	onBrokenLinks: 'warn',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'netdata',
	projectName: 'netdata',
	themeConfig: {
		posthog: {
			apiKey: 'phc_hnhlqe6D2Q4IcQNrFItaqdXJAxQ8RcHkPAFAp74pubv',
			appUrl: 'https://posthog.netdata.cloud',
			enableInDevelopment: false,
		},
		image: 'img/netdata_meta-default.png',
		prism: {
			theme: require('prism-react-renderer/themes/dracula'),
		},
		hideableSidebar: true,
		navbar: {
			title: 'Learn',
			logo: {
				alt: 'Netdata Learn logo',
				src: 'img/logo.svg',
			},
			items: [
				{
					type: 'doc',
					docId: 'docs',
					position: 'left',
					label: 'Docs',
				},
				{
					to: '/guides/',
					position: 'left',
					label: 'Guides',
				},
				{
					to: '/contribute/',
					position: 'left',
					label: 'Contribute',
				},
				{
					to: 'https://community.netdata.cloud/',
					position: 'left',
					label: 'Community',
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
			links: [
				{
					title: 'Products',
					items: [
						{
							label: 'Agent',
							to: 'https://netdata.cloud/agent',
						},
						{
							label: 'Cloud',
							to: 'https://netdata.cloud/cloud',
						},
						{
							label: 'Integrations',
							to: 'https://www.netdata.cloud/integrations/',
						},
						{
							label: 'Status',
							to: 'https://status.netdata.cloud',
						},
					],
				},
				{
					title: 'Resources',
					items: [
						{
							label: 'Learn',
							to: '/',
						},
						{
							label: 'Blog',
							to: 'https://netdata.cloud/blog',
						},
						{
							label: 'GitHub',
							to: 'https://github.com/netdata/netdata',
						},
					],
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Overview',
							to: 'https://www.netdata.cloud/community-overview/',
						},
						{
							label: 'Forums',
							to: 'https://community.netdata.cloud/',
						},
					],
				},
				{
					title: 'Company',
					items: [
						{
							label: 'About',
							to: 'https://netdata.cloud',
						},
						{
							label: 'News',
							to: 'https://www.netdata.cloud/news/',
						},
						{
							label: 'Careers',
							to: 'https://careers.netdata.cloud/',
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc.`,
		},
	},
	plugins: [
		'posthog-docusaurus',
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
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'contribute',
				sidebarPath: require.resolve('./src/data/sidebar-contribute.js'),
				path: './contribute',
				routeBasePath: 'contribute',
				include: ['**/*.md', '**/*.mdx'],
			},
		],
	],
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/netdata/netdata/edit/master/',
					showLastUpdateTime: true,
				},
				theme: {
					customCss: [require.resolve('./src/css/custom.css')],
				},
				gtag: {
					trackingID: 'GTM-N6CBMJD',
				},
			},
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
