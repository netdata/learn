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
              id: 'agent/packaging/installer/methods/kickstart',
              label: 'Linux with one-line installer'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/kickstart-64',
              label: 'Linux with pre-built static binary'
            },
            {
              type: 'doc',
              id: 'agent/packaging/installer/methods/packages',
              label: 'Linux with .deb/.rpm package'
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
            'agent/packaging/installer/update',
            'agent/packaging/installer/reinstall',
            'agent/packaging/installer/uninstall'
          ]
        },
        {
          type: 'category',
          label: 'Configuration',
          items: [
            'configure/nodes',
            'configure/common-changes',
            'configure/start-stop-restart',
            'configure/secure-nodes',
            {
              type: 'doc',
              id: 'agent/running-behind-nginx',
              label: 'Proxy with Nginx'
            },
            {
              type: 'doc',
              id: 'agent/running-behind-apache',
              label: 'Proxy with Apache'
            },
            {
              type: 'doc',
              id: 'agent/daemon',
              label: 'Daemon reference'
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
            'dashboard/select-timeframes',
            'agent/web/gui/custom',
            {
              type: 'doc',
              id: 'agent/web/server',
              label: 'Web server reference'
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
            'collect/system-metrics',
            'collect/container-metrics',
            'collect/application-metrics',
            'agent/collectors/collectors',
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
                'agent/collectors/checks.plugin',
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
                  label: 'Node.js collectors',
                  items: [
                    {
                      type: 'autogenerated',
                      dirName: 'agent/collectors/node.d.plugin'
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
              label: 'Collectors reference'
            }
          ]
        },
        {
          type: 'category',
          label: 'Alerts and notifications',
          items: [
            'monitor/view-active-alarms',
            'monitor/configure-alarms',
            'monitor/enable-notifications',
            {
              type: 'doc',
              id: 'agent/health/reference',
              label: 'Alert configuration reference'
            },
            {
              type: 'doc',
              id: 'agent/health/notifications',
              label: 'Alert notifications'
            },
            {
              type: 'category',
              label: 'Supported notifications',
              items: [
                {
                  type: 'autogenerated',
                  dirName: 'agent/health/notifications'
                },
              ]
            },
          ]
        },
        {
          type: 'category',
          label: 'Metrics storage and management',
          items: [
            'store/distributed-data-architecture',
            'store/change-metrics-storage',
            {
              type: 'doc',
              id: 'agent/database',
              label: 'Databases reference'
            },
            {
              type: 'doc',
              id: 'agent/database/engine',
              label: 'Database engine reference'
            },
            'metrics-storage-management/how-streaming-works',
            'metrics-storage-management/enable-streaming',
            'metrics-storage-management/reference-streaming',
            'export/external-databases',
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
              id: 'agent/exporting',
              label: 'Exporting reference'
            },
          ]
        },
        'agent/cheatsheet',
      ]
    },
    {
      type: 'category',
      label: 'Netdata Cloud',
      items: [
        'cloud',
        'cloud/get-started',
        {
          type: 'category',
          label: 'Claiming',
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
            'cloud/visualize/kubernetes',
            'cloud/insights/metric-correlations',
          ]
        },
        {
          type: 'category',
          label: 'Monitoring',
          items: [
            'cloud/monitoring/notifications',
            'cloud/monitoring/alarms',
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
            'agent/collectors/node.d.plugin',
            'agent/collectors/charts.d.plugin',
          ]
        },
        {
          type: 'category',
          label: 'libnetdata',
          items: [
            'agent/libnetdata',
            'agent/libnetdata/adaptive_resortable_list',
            'agent/libnetdata/avl',
            'agent/libnetdata/buffer',
            'agent/libnetdata/clocks',
            'agent/libnetdata/config',
            'agent/libnetdata/dictionary',
            'agent/libnetdata/ebpf',
            'agent/libnetdata/eval',
            'agent/libnetdata/json',
            'agent/libnetdata/locks',
            'agent/libnetdata/log',
            'agent/libnetdata/popen',
            'agent/libnetdata/procfile',
            'agent/libnetdata/simple_pattern',
            'agent/libnetdata/socket',
            'agent/libnetdata/statistical',
            'agent/libnetdata/storage_number',
            'agent/libnetdata/threads',
            'agent/libnetdata/url',
          ]
        },
        {
          type: 'category',
          label: 'HTTP API',
          items: [
            'agent/web/api',
            {
              type: 'category',
              label: 'Exporters',
              items: [
                'agent/web/api/exporters',
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
                'agent/web/api/queries/ses',
                'agent/web/api/queries/stddev',
                'agent/web/api/queries/sum',
              ]
            },
          ],
        },
      ]
    }
  ]
};
