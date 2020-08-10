module.exports = {
  title: 'Learn',
  tagline: 'The home for learning about Netdata\'s health monitoring and performance troubleshooting toolkit. Documentation, tutorials, blogs, and much more.',
  url: 'https://learn.netdata.cloud',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'netdata',
  projectName: 'netdata',
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
          customCss: require.resolve('./src/css/custom.scss'),
        },
      },
    ]
  ],
  plugins: [
    require.resolve('@docusaurus/plugin-sitemap'),
    require.resolve('docusaurus-plugin-sass'),
    require.resolve('./src/plugins/cookbooks'),
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:400,500&display=swap',
  ],
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-64295674-3',
      anonymizeIP: true,
    },
    image: 'img/netdata_meta-default.png',
    prism: {
      theme: require('prism-react-renderer/themes/duotoneDark'),
      darkTheme: require('prism-react-renderer/themes/duotoneDark'),
    },
    navbar: {
      title: 'Learn',
      logo: {
        alt: 'Netdata Learn logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/agent', 
          label: 'Agent', 
          position: 'left',
        },
        {
          to: 'docs/cloud', 
          label: 'Cloud', 
          position: 'left',
        },
        {
          to: 'guides', 
          label: 'Guides', 
          position: 'left'
        },
        {
          href: 'https://community.netdata.cloud/',
          label: 'Community',
          position: 'right',
        },
        {
          href: 'https://netdata.cloud/blog',
          label: 'Blog',
          position: 'right',
        },
        {
          href: 'https://github.com/netdata/netdata',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://netdata.cloud',
          label: 'Netdata, Inc.',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'About',
          items: [
            {
              label: 'Netdata, Inc.',
              href: 'https://netdata.cloud',
            },
            {
              label: 'Agent Docs',
              to: 'docs/agent',
            },
            {
              label: 'Cloud Docs',
              to: 'docs/cloud',
            },
            {
              label: 'Guides',
              to: 'guides',
            },
            {
              label: 'Community',
              to: 'https://community.netdata.cloud/',
            },
            {
              label: 'Blog',
              href: 'https://netdata.cloud/blog',
            },
            {
              label: 'Status',
              href: 'https://status.netdata.cloud',
            },
          ],
        },
        {
          title: 'Get started',
          items: [
            {
              label: 'Installation',
              to: 'docs/agent/packaging/installer',
            },
            {
              label: 'Getting started guide',
              to: 'docs/agent/getting-started',
            },
            {
              label: 'Step-by-step tutorial',
              to: 'docs/agent/step-by-step/step-00',
            },
            {
              label: 'Configuration',
              to: 'docs/agent/configuration-guide',
            },
            {
              label: 'Collecting metrics',
              to: 'docs/agent/collectors',
            },
            {
              label: 'Health monitoring',
              to: 'docs/agent/health',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/netdata/netdata',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/linuxnetdata',
            },
            {
              label: 'Facebook',
              href: 'https://www.facebook.com/linuxnetdata/',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/my-netdata.io/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc. Built with Docusaurus.`,
    },
  },
};
