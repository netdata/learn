module.exports = {
  title: 'Learn',
  tagline: 'The home for learning about Netdata\'s health monitoring and performance troubleshooting toolkit. Documentation, tutorials, blogs, and much more.',
  url: 'https://learn.netdata.cloud',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'netdata',
  projectName: 'netdata',
  plugins: [
    [
      '@docusaurus/plugin-content-docs', {
        sidebarPath: require.resolve('./sidebars.js'),
      }
    ],
    '@docusaurus/plugin-content-pages',
    '@docusaurus/plugin-google-analytics',
    '@docusaurus/plugin-sitemap',
    'docusaurus-plugin-sass',
    '@docusaurus/theme-search-algolia'
  ],
  stylesheets: [
    'https://fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:400,500&display=swap',
  ],
  themes: [
    ['@docusaurus/theme-classic', {
      customCss: require.resolve('./src/css/custom.css'),
    }],
    '@docusaurus/theme-search-algolia'
  ],
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-64295674-3',
      anonymizeIP: true,
    },
    algolia: {
      apiKey: 'b162746a0dfcdf64126c16c29547ded5',
      indexName: 'netdata_learn',
      algoliaOptions: {}, // Optional, if provided by Algolia
    },
    image: 'img/everyone.png',
    prism: {
      theme: require('prism-react-renderer/themes/dracula'),
      darkTheme: require('prism-react-renderer/themes/duotoneDark'),
    },
    navbar: {
      title: 'Learn',
      logo: {
        alt: 'Netdata Learn logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/agent', 
          label: 'Agent', 
          position: 'left'
        },
        {
          to: 'docs/cloud', 
          label: 'Cloud', 
          position: 'left'
        },
        {
          href: 'https://blog.netdata.cloud',
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
