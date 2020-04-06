module.exports = {
  title: 'Learn @ Netdata',
  tagline: 'The home for learning about Netdata\'s health monitoring and performance troubleshooting toolkit. Documentation, tutorials, blogs, and much more.',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'netdata', // Usually your GitHub org/user name.
  projectName: 'netdata', // Usually your repo name.
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
        {
          to: '/', 
          label: 'Learn', 
          position: 'left'},
        {
          to: 'docs/introduction', 
          label: 'Docs', 
          position: 'left'
        },
        {
          href: 'https://github.com/netdata/netdata',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://netdata.cloud',
          label: 'Netdata',
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
              label: 'What is Netdata?',
              to: 'docs/what-is-netdata',
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
              to: 'docs/packaging/installer',
            },
            {
              label: 'Getting started guide',
              to: 'docs/getting-started',
            },
            {
              label: 'Step-by-step tutorial',
              to: 'docs/step-by-step/step-00',
            },
            {
              label: 'Configuration',
              to: 'docs/configuration-guide',
            },
            {
              label: 'Collecting metrics',
              to: 'docs/collectors',
            },
            {
              label: 'Health monitoring',
              to: 'docs/health',
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
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/netdata/netdata/edit/master/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    '@docusaurus/plugin-sitemap'
  ]
};
