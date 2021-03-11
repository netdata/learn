module.exports = {
  title: 'Learn Netdata',
  tagline: 'The home for learning about Netdata\'s health monitoring and performance troubleshooting toolkit. Comprehensive documentation and thoughtful guides.',
  url: 'https://learn.netdata.cloud',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'netdata',
  projectName: 'netdata',
  onBrokenLinks: 'error',
  onBrokenMarkdownLinks: 'warn',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          id: "netdata",
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
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "guides",
        sidebarPath: require.resolve('./sidebar-guides.js'),
        path: "./guides",
        routeBasePath: "guides",
        include: ["**/*.md", "**/*.mdx"],
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "contribute",
        sidebarPath: require.resolve('./sidebar-contribute.js'),
        path: "./contribute",
        routeBasePath: "contribute",
        include: ["**/*.md", "**/*.mdx"],
      },
    ],
    require.resolve('docusaurus-plugin-sass'),
  ],
  stylesheets: [
    {
      href: '/fonts/ibm-plex-sans-v7-latin-regular.woff2',
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      crossorigin: '',
    },
    {
      href: '/fonts/ibm-plex-sans-v7-latin-500.woff2',
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      crossorigin: ''
    }
  ],
  scripts: [
    {
      src:
        'https://js.hs-scripts.com/4567453.js',
      async: true,
      defer: true,
    },
  ],
  themeConfig: {
    gtag: {
      trackingID: 'GTM-N6CBMJD',
    },
    image: 'img/netdata_meta-default.png',
    hideableSidebar: true,
    algolia: {
      apiKey: 'b162746a0dfcdf64126c16c29547ded5',
      indexName: 'netdata_learn',
      algoliaOptions: {}, // Optional, if provided by Algolia
    },
    prism: {
      theme: require('prism-react-renderer/themes/duotoneDark'),
      darkTheme: require('prism-react-renderer/themes/duotoneDark'),
    },
    navbar: {
      // title: 'Learn',
      logo: {
        alt: 'Netdata Learn logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
        href: 'https://netdata.cloud/',
        target: '_self'
      },
      items: [
        {
          label: 'Product',
          position: 'right',
          items: [
            {
              label: 'Overview',
              to: 'https://www.netdata.cloud/overview/',
              target: '_self',
            },
            {
              label: 'Agent',
              href: 'https://www.netdata.cloud/agent/',
              target: '_self',
            },
            {
              label: 'Cloud',
              href: 'https://www.netdata.cloud/cloud/',
              target: '_self',
            },
            {
              label: 'Get Netdata',
              href: 'https://www.netdata.cloud/get-netdata/',
              target: '_self',
            }
          ]
        },
        {
          label: 'Integrations',
          position: 'right',
          items: [
            {
              label: 'View all',
              href: 'https://www.netdata.cloud/integrations/',
              target: '_self',
            },
            {
              label: 'Featured',
              href: 'https://www.netdata.cloud/integrations/#featured',
              target: '_self',
            },
            {
              label: 'Services & applications',
              href: 'https://www.netdata.cloud/integrations/#service_app_collectors',
              target: '_self',
            },
            {
              label: 'Systems',
              href: 'https://www.netdata.cloud/integrations/#system_collectors',
              target: '_self',
            },
            {
              label: 'Notifications',
              href: 'https://www.netdata.cloud/integrations/#notifications',
              target: '_self',
            },
            {
              label: 'Backends & exporters',
              href: 'https://www.netdata.cloud/integrations/#backends_exporters',
              target: '_self',
            }
          ]
        },
        {
          label: 'Solutions',
          position: 'right',
          items: [
            {
              label: 'Chaos engineering',
              href: 'https://www.netdata.cloud/chaos-engineering/',
              target: '_self',
            },
            {
              label: 'Containers',
              href: 'https://www.netdata.cloud/container-monitoring/',
              target: '_self',
            },
            {
              label: 'Databases',
              href: 'https://www.netdata.cloud/database-monitoring/',
              target: '_self',
            },
            {
              label: 'DevOps',
              href: 'https://www.netdata.cloud/devops-with-netdata/',
              target: '_self',
            },
            {
              label: 'Incident management',
              href: 'https://www.netdata.cloud/incident-management/',
              target: '_self',
            },
            {
              label: 'Web',
              href: 'https://www.netdata.cloud/web-server-monitoring/',
              target: '_self',
            }
          ]
        },
        {
          label: 'Learn',
          position: 'right',
          to: '/',
          items: [
            {
              label: 'Overview',
              to: '/'
            },
            {
              label: 'Docs',
              to: '/docs/'
            },
            {
              label: 'Guides',
              to: '/guides/'
            },
            {
              label: 'Contribute',
              to: '/contribute/'
            }
          ]
        },
        {
          label: 'Community',
          position: 'right',
          items: [
            {
              label: 'Overview',
              href: 'https://www.netdata.cloud/community/',
              target: '_self',
            },
            {
              label: 'Forums',
              href: 'https://community.netdata.cloud/',
            }
          ]
        },
        {
          label: 'Resources',
          position: 'right',
          items: [
            {
              label: 'Blog',
              href: 'https://www.netdata.cloud/blog/',
              target: '_self',
            },
            {
              label: 'Videos',
              href: 'https://www.youtube.com/channel/UC61IDHAysha3o3QI-LTno7A',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/netdata/netdata',
              target: '_self',
            }
          ]
        },
        {
          label: 'Company',
          position: 'right',
          items: [
            {
              label: 'About',
              href: 'https://www.netdata.cloud/about/',
              target: '_self',
            },
            {
              label: 'News',
              href: 'https://www.netdata.cloud/news/',
              target: '_self',
            },
            {
              label: 'Careers',
              href: 'https://careers.netdata.cloud/',
              target: '_self',
            }
          ]
        },
        // {
        //   to: 'docs', 
        //   label: 'Docs', 
        //   position: 'left',
        // },
        // {
        //   to: 'guides', 
        //   label: 'Guides', 
        //   position: 'left'
        // },
        // {
        //   to: 'contribute', 
        //   label: 'Contribute', 
        //   position: 'left'
        // },
        // {
        //   href: 'https://www.netdata.cloud/community/',
        //   label: 'Get help & community',
        //   position: 'right',
        // },
        // {
        //   href: 'https://netdata.cloud',
        //   label: 'Netdata, Inc.',
        //   position: 'right',
        // },
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
              href: 'https://netdata.cloud/agent',
            },
            {
              label: 'Cloud',
              href: 'https://netdata.cloud/cloud',
            },
            {
              label: 'Integrations',
              to: 'https://www.netdata.cloud/integrations/',
            },
            {
              label: 'Status',
              href: 'https://status.netdata.cloud',
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
            }
          ]
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
            }
          ]
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About',
              href: 'https://netdata.cloud',
            },
            {
              label: 'News',
              href: 'https://www.netdata.cloud/news/',
            },
            {
              label: 'Careers',
              href: 'https://careers.netdata.cloud/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Netdata, Inc. Built with Docusaurus.`,
    },
  },
};
