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
      links: [
        {
          to: 'docs/agent', 
          label: 'Agent', 
          position: 'left',
          group: 'docs'
        },
        {
          to: 'docs/cloud', 
          label: 'Cloud', 
          position: 'left',
          group: 'docs'
        },
        {
          to: 'guides', 
          label: 'Guides', 
          position: 'left'
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
      links: [
        {
          title: 'Products',
          items: [
            {
              label: 'Agent',
              href: 'https://www.netdata.cloud/agent/',
            },
            {
              label: 'Cloud',
              to: 'https://www.netdata.cloud/cloud/',
            },
            {
              label: 'Integrations',
              to: 'https://www.netdata.cloud/integrations/',
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
              to: 'https://www.netdata.cloud/blog',
            },
            {
              label: 'GitHub',
              to: 'https://github.com/netdata/netdata',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About',
              href: 'https://github.com/netdata/netdata',
            },
            {
              label: 'News',
              href: 'https://twitter.com/linuxnetdata',
            },
            {
              label: 'Careers',
              href: 'https://www.facebook.com/linuxnetdata/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc. Built with Docusaurus.`,
    },
  },
};
