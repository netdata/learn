module.exports = {
  title: 'Learn @ Netdata',
  tagline: 'The home for learning about Netdata\'s health monitoring and performance troubleshooting toolkit. Documentation, tutorials, blogs, and much more.',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'netdata', // Usually your GitHub org/user name.
  projectName: 'netdata', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Learn @ Netdata',
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
              to: 'agent/home',
            },
            {
              label: 'Cloud Docs',
              to: 'cloud/home',
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
              to: 'agent/docs/packaging/installer',
            },
            {
              label: 'Getting started guide',
              to: 'agent/docs/agent/getting-started',
            },
            {
              label: 'Step-by-step tutorial',
              to: 'agent/docs/docs/step-by-step/step-00',
            },
            {
              label: 'Configuration',
              to: 'agent/docs/docs/configuration-guide',
            },
            {
              label: 'Collecting metrics',
              to: 'agent/docs/collectors',
            },
            {
              label: 'Health monitoring',
              to: 'agent/docs/health',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
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
      '@docusaurus/plugin-content-docs',
      {
        path: 'cloud',
        routeBasePath: 'cloud',
        include: ['**/*.md', '**/*.mdx'], // Extensions to include.
      }
    ],
  ],
  plugins: [
    '@docusaurus/plugin-sitemap'
  ]
};
