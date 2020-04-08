module.exports = {
  title: 'Learn @ Netdata',
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
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }
    ]
  ],
  // themes: [
  //   '@docusaurus/theme-classic',
  //    {
  //      customCss: require.resolve('./src/css/custom.css'),
  //    }
  // ],
  plugins: [
    '@docusaurus/plugin-sitemap',
  //   '@docusaurus/plugin-google-analytics',
  //   '@docusaurus/plugin-content-pages',
  //   '@docusaurus/plugin-content-docs',
  //     {
  //       path: 'docs',
  //       sidebarPath: require.resolve('./sidebars.js'),
  //     },
  ],
  // stylesheets: [
  //   require.resolve('./src/css/custom.css'),
  // ],
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-64295674-3',
      anonymizeIP: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Netdata Learn logo',
        src: 'img/logo.svg',
      },
      links: [
        {to: 'docs/agent', label: 'Agent', position: 'left'},
        {to: 'docs/cloud', label: 'Cloud', position: 'left'},
        {
          href: 'https://github.com/netdata/netdata',
          label: 'GitHub',
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
              label: 'Netdata Blog',
              to: 'https://blog.netdata.cloud',
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
