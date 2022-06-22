/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  sidebar: [
    {
      type: 'category',
      label: 'Netdata',
      collapsed: false,
      items: [
        'docs',
        'get-started',
        {
          type: 'category',
          label: 'Overview',
          items: [
            'overview/what-is-netdata',
            'overview/why-netdata',
            'overview/netdata-monitoring-stack',
            'agent/anonymous-statistics',
            'agent/netdata-security',
          ]
        },
        {
          type: 'category',
          label: 'Installation',
          items: [
            {
              type: 'doc',
              id: 'agent/packaging/platform_support',
              label: 'Netdata platform support policy'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/kickstart',
              label: 'Linux with one-line installer'
            },
            {
              type: 'doc',
              id: 'agent/packaging/docker',
              label: 'Run with Docker'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/kubernetes',
              label: 'Deploy on Kubernetes'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/macos',
              label: 'macOS'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/manual',
              label: 'Linux from Git'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/source',
              label: 'Linux from source'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/offline',
              label: 'Linux on offline nodes'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/update',
              customProps: { separator: true }
            },
            'agent/packaging/installer/reinstall',
            'agent/packaging/installer/uninstall'
          ]
        },
        {
          type: 'category',
          label: 'Configuration',
          items: [
            'configure/nodes',
            {
              type: 'doc',
              id: 'agent/ml',
              customProps: {
                separator: true,
                subCategory: 'Machine Learning'
              }
            },
            'configure/common-changes',
            'configure/start-stop-restart',
            {
              type: 'doc',
              id: 'configure/secure-nodes',
              customProps: {
                separator: true,
                subCategory: 'Security'
              }
            },
            {
              type: 'doc',
              id: 'agent/running-behind-nginx',
              label: 'Reverse proxy with Nginx'
            },
            {
              type: 'doc',
              id: 'agent/running-behind-apache',
              label: 'Reverse proxy with Apache'
            },
            {
              type: 'doc',
              id: 'agent/daemon',
              label: 'Daemon reference',
              customProps: {
                separator: true,
                subCategory: 'Reference'
              }
            },
            {
              type: 'doc',
              id: 'agent/daemon/config',
              label: 'Configuration reference'
            }
          ]
        },
        {
          type: 'category',
          label: 'Dashboard',
          items: [
            'dashboard/how-dashboard-works',
            'dashboard/interact-charts',
            'dashboard/dimensions-contexts-families',
            'dashboard/visualization-date-and-time-controls',
            'dashboard/import-export-print-snapshot',
            {
              type: 'doc',
              id: 'dashboard/customize',
              customProps: {
                separator: true,
                subCategory: 'Customization',
              }
            },
            'agent/web/gui/custom',
            {
              type: 'doc',
              id: 'agent/web/server',
              label: 'Web server reference',
              customProps: {
                separator: true,
                subCategory: 'Reference',
              }
            },
            {
              type: 'doc',
              id: 'agent/registry',
              label: 'Registry reference'
            }
          ]
        },
        {
          type: 'category',
          label: 'Data collection',
          items: [
            'collect/how-collectors-work',
            'collect/enable-configure',
            {
              type: 'doc',
              id: 'collect/system-metrics',
              customProps: { separator: true }
            },
            'collect/container-metrics',
            'collect/application-metrics',
            {
              type: 'doc',
              id: 'agent/collectors/collectors',
              customProps: { separator: true }
            },
            {
              type: 'category',
              label: 'Internal',
              items: [
                'agent/collectors/proc.plugin',
                'agent/collectors/statsd.plugin',
                'agent/collectors/cgroups.plugin',
                'agent/collectors/timex.plugin',
                'agent/collectors/idlejitter.plugin',
                'agent/collectors/tc.plugin',
                'agent/collectors/diskspace.plugin',
                'agent/collectors/freebsd.plugin',
                'agent/collectors/macos.plugin',
              ]
            },
            {
              type: 'category',
              label: 'External',
              items: [
                'agent/collectors/ebpf.plugin',
                'agent/collectors/apps.plugin',
                'agent/collectors/cups.plugin',
                'agent/collectors/fping.plugin',
                'agent/collectors/ioping.plugin',
                'agent/collectors/freeipmi.plugin',
                'agent/collectors/nfacct.plugin',
                'agent/collectors/xenstat.plugin',
                'agent/collectors/perf.plugin',
                'agent/collectors/slabinfo.plugin',
                {
                  type: 'category',
                  label: 'Go collectors',
                  items: [
                    {
                      type: 'autogenerated',
                      dirName: 'agent/collectors/go.d.plugin/modules'
                    },
                  ]
                },
                {
                  type: 'category',
                  label: 'Python collectors',
                  items: [
                    {
                      type: 'autogenerated',
                      dirName: 'agent/collectors/python.d.plugin'
                    },
                  ]
                },
                {
                  type: 'category',
                  label: 'Bash collectors',
                  items: [
                    {
                      type: 'autogenerated',
                      dirName: 'agent/collectors/charts.d.plugin'
                    },
                  ]
                },
              ]
            },
            {
              type: 'doc',
              id: 'agent/collectors/reference',
              label: 'Collectors reference',
              customProps: {
                separator: true,
                subCategory: 'Reference',
              }
            }
          ]
        },
        {
          type: 'category',
          label: 'Alerts and notifications',
          items: [
            {
              type: 'doc',
              id: 'monitor/view-active-alarms',
              label: 'View active alerts',
              customProps: {
                subCategory: 'Alerts'
              }
            },
            'monitor/configure-alarms',
            {
              type: 'doc',
              id: 'monitor/enable-notifications',
              customProps: {
                separator: true,
                subCategory: 'Notifications'
              }
            },
            {
              type: 'category',
              label: 'Supported notification methods',
              items: [
                {
                  type: 'autogenerated',
                  dirName: 'agent/health/notifications'
                },
              ]
            },
            {
              type: 'doc',
              id: 'agent/health/reference',
              label: 'Alert configuration reference',
              customProps: {
                separator: true,
                subCategory: 'Reference'
              }
            },
            {
              type: 'doc',
              id: 'agent/health/notifications',
              label: 'Notifications reference'
            },
          ]
        },
        {
          type: 'category',
          label: 'Metrics storage and management',
          items: [
            {
              type: 'doc',
              id: 'store/distributed-data-architecture',
              customProps: {
                subCategory: 'Storage'
              }
            },
            'store/change-metrics-storage',
            {
              type: 'doc',
              id: 'metrics-storage-management/how-streaming-works',
              customProps: {
                separator: true,
                subCategory: 'Streaming',
              }
            },
            'metrics-storage-management/enable-streaming',
            {
              type: 'doc',
              id: 'export/external-databases',
              customProps: {
                separator: true,
                subCategory: 'Exporting',
              }
            },
            'export/enable-connector',
            {
              type: 'category',
              label: 'Exporting connectors',
              items: [
                {
                  type: 'autogenerated',
                  dirName: 'agent/exporting'
                },
              ]
            },
            {
              type: 'doc',
              id: 'agent/database',
              label: 'Databases reference',
              customProps: {
                separator: true,
                subCategory: 'Reference',
              }
            },
            {
              type: 'doc',
              id: 'agent/database/engine',
              label: 'Database engine reference'
            },
            'metrics-storage-management/reference-streaming',
            {
              type: 'doc',
              id: 'agent/exporting',
              label: 'Exporting reference'
            },
          ]
        },
        'cheatsheet',
      ]
    },
    {
      type: 'category',
      label: 'Netdata Cloud',
      items: [
        'cloud',
        'cloud/get-started',
        'cloud/data-privacy',
        {
          type: 'category',
          label: 'Connecting to Cloud',
          items: [
            'agent/aclk',
            'agent/claim',
          ]
        },
        'cloud/spaces',
        'cloud/war-rooms',
        {
          type: 'category',
          label: 'Visualizations',
          items: [
            'cloud/visualize/overview',
            'cloud/visualize/nodes',
            'cloud/visualize/dashboards',
            'cloud/visualize/interact-new-charts',
            'cloud/visualize/kubernetes',
          ]
        },
        {
          type: 'category',
          label: 'Alerts and notifications',
          items: [
            'cloud/alerts-notifications/smartboard',
            'cloud/alerts-notifications/notifications',
          ]
        },
        {
          type: 'category',
          label: 'Troubleshooting with Netdata Cloud',
          items: [
            'cloud/insights/metric-correlations',
            'cloud/insights/anomaly-advisor',
          ]
        },
        {
          type: 'category',
          label: 'Administration',
          items: [
            'cloud/manage/sign-in',
            'cloud/manage/invite-your-team',
            'cloud/manage/themes',
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Developers',
      items: [
        {
          type: 'category',
          label: 'Collectors',
          items: [
            'agent/collectors/plugins.d',
            'agent/collectors/go.d.plugin',
            'agent/collectors/go.d.plugin/docs/how-to-write-a-module',
            'agent/collectors/python.d.plugin',
            'agent/collectors/charts.d.plugin',
          ]
        },
      /*{ //removed libnetdata because it doesn't concern the user//
        type: 'category',
          label: 'libnetdata',
          items: [
            'agent/libnetdata',
            'agent/libnetdata/adaptive_resortable_list',
            'agent/libnetdata/avl',
            'agent/libnetdata/buffer',
            //'agent/libnetdata/clocks',
            'agent/libnetdata/config',
            //'agent/libnetdata/dictionary',
            //'agent/libnetdata/ebpf',
            //'agent/libnetdata/eval',
            'agent/libnetdata/json',
            //'agent/libnetdata/locks',
            //'agent/libnetdata/log',
            //'agent/libnetdata/popen',
            'agent/libnetdata/procfile',
            'agent/libnetdata/simple_pattern',
            //'agent/libnetdata/socket',
            //'agent/libnetdata/statistical',
            'agent/libnetdata/storage_number',
            //'agent/libnetdata/threads',
            //'agent/libnetdata/url',
          ]
        }, */
        {
          type: 'category',
          label: 'HTTP API',
          items: [
            'agent/web/api',
            {
              type: 'category',
              label: 'Exporters',
              items: [
                'agent/web/api/exporters/prometheus',
                'agent/web/api/exporters/shell',
              ]
            },
            {
              type: 'category',
              label: 'Formatters',
              items: [
                'agent/web/api/formatters',
                'agent/web/api/formatters/csv',
                'agent/web/api/formatters/json',
                'agent/web/api/formatters/ssv',
                'agent/web/api/formatters/value',
              ]
            },
            'agent/web/api/badges',
            'agent/web/api/health',
            {
              type: 'category',
              label: 'Queries',
              items: [
                'agent/web/api/queries',
                'agent/web/api/queries/average',
                'agent/web/api/queries/des',
                'agent/web/api/queries/incremental_sum',
                'agent/web/api/queries/max',
                'agent/web/api/queries/median',
                'agent/web/api/queries/min',
                'agent/web/api/queries/countif',
                'agent/web/api/queries/ses',
                'agent/web/api/queries/stddev',
                'agent/web/api/queries/sum',
              ]
            },
          ],
        },
        'agent/libnetdata/simple_pattern',
      ]
    }
  ]
};
