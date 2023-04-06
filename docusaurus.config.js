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
					docId: 'getting-started/getting-started',
					position: 'left',
					label: 'Docs',
				},
				{
					to: 'https://blog.netdata.cloud/?utm_source=learn&utm_content=top_navigation_blog',
					position: 'left',
					label: 'Blog',
				},
				{
					to: 'https://blog.netdata.cloud/tags/how-to/?utm_source=learn&utm_content=top_navigation_usecases',
					position: 'left',
					label: 'Use Cases',
				},
				{
					to: 'https://www.netdata.cloud/community/?utm_source=learn&utm_content=top_navigation_community',
					position: 'left',
					label: 'Community',
				},
				{
					to: 'https://www.netdata.cloud/?utm_source=learn&utm_content=top_navigation_website',
					label: 'Website',
					position: 'left',
				},
				{
					to: 'https://app.netdata.cloud/spaces/netdata-demo?utm_source=learn&utm_content=top_navigation_demo',
					label: 'Live Demo',
					position: 'left',
				},
				{
					to: 'https://app.netdata.cloud/?utm_source=learn&utm_content=top_navigation_sign_up',
					label: 'Sign In',
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
					docLayoutComponent: "@theme/DocPage",
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
			src: 'https://js.hs-scripts.com/4567453.js',
			async: true,
			defer: true,
		},
	],
};
