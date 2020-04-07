/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'agent'
    },
    {
      type: 'category',
      label: 'About Netdata',
      items: [
        'agent/what-is-netdata',
        'agent/demo-sites',
        'agent/netdata-security',
        'agent/anonymous-statistics',
        'agent/donations-netdata-has-received',
        'agent/a-github-star-is-important',
        'agent/redistributed',
        'agent/changelog',
        'agent/security',
      ]
    },
    {
      type: 'category',
      label: 'Why Netdata?',
      items: [
        'agent/why-netdata',
        'agent/why-netdata/1s-granularity',
        'agent/why-netdata/unlimited-metrics',
        'agent/why-netdata/meaningful-presentation',
        'agent/why-netdata/immediate-results',
      ]
    },
    {
      type: 'category',
      label: 'Installation',
      items: [
        'agent/packaging/installer',
        {
          type: 'category',
          label: 'Other methods',
          items: [
            'agent/packaging/installer/methods/packages',
            'agent/packaging/installer/methods/kickstart',
            'agent/packaging/docker',
            'agent/packaging/installer/methods/cloud-providers',
            'agent/packaging/installer/methods/macos',
            'agent/packaging/installer/methods/freebsd',
            'agent/packaging/installer/methods/manual',
            'agent/packaging/installer/methods/offline',
            'agent/packaging/installer/methods/pfsense',
            'agent/packaging/installer/methods/synology',
            'agent/packaging/installer/methods/freenas',
            'agent/packaging/installer/methods/alpine',
          ]
        },
        'agent/packaging/distributions',
        'agent/packaging/installer/update',
        'agent/packaging/installer/uninstall',
      ]
    },
    {
      type: 'doc',
      id: 'agent/getting-started',
    },
    {
      type: 'category',
      label: 'Step-by-step guide',
      items: [
        'agent/step-by-step/step-00',
        'agent/step-by-step/step-01',
        'agent/step-by-step/step-02',
        'agent/step-by-step/step-03',
        'agent/step-by-step/step-04',
        'agent/step-by-step/step-05',
        'agent/step-by-step/step-06',
        'agent/step-by-step/step-07',
        'agent/step-by-step/step-08',
        'agent/step-by-step/step-09',
        'agent/step-by-step/step-10',
        'agent/step-by-step/step-99',
      ]
    },
    {
      type: 'category',
      label: 'Running Netdata',
      items: [
        'agent/daemon',
        'agent/configuration-guide',
        'agent/daemon/config',
        {
          type: 'category',
          label: 'Web server',
          items: [
            'agent/web/server',
            'agent/web/server/static',
            {
              type: 'category',
              label: 'Running behind another web server',
              items: [
                'agent/running-behind-nginx',
                'agent/running-behind-apache',
                'agent/running-behind-lighttpd',
                'agent/running-behind-caddy',
              ]
            },
            'agent/running-behind-haproxy'
          ]
        },
        'agent/database',
        'agent/database/engine',
        'agent/registry',
        'agent/performance',
        'agent/netdata-for-iot',
        'agent/high-performance-netdata',
      ],
    },
    {
      type: 'category',
      label: 'Collecting metrics',
      items: [
        'agent/collectors',
        'agent/collectors/quickstart',
        'agent/collectors/reference',
        'agent/collectors/collectors',
        {
          type: 'category',
          label: 'Internal plugins',
          items: [
            'agent/collectors/ebpf_process.plugin',
            'agent/collectors/proc.plugin',
            'agent/collectors/statsd.plugin',
            'agent/collectors/cgroups.plugin',
            'agent/collectors/idlejitter.plugin',
            'agent/collectors/tc.plugin',
            'agent/collectors/checks.plugin',
            'agent/collectors/diskspace.plugin',
            'agent/collectors/freebsd.plugin',
          ]
        },
        {
          type: 'category',
          label: 'External plugins',
          items: [
            'agent/collectors/plugins.d',
            {
              type: 'category',
              label: 'Go',
              items: [
                'agent/collectors/go.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'agent/collectors/go.d.plugin/modules/activemq',
                    'agent/collectors/go.d.plugin/modules/apache',
                    'agent/collectors/go.d.plugin/modules/bind',
                    'agent/collectors/go.d.plugin/modules/cockroachdb',
                    'agent/collectors/go.d.plugin/modules/consul',
                    'agent/collectors/go.d.plugin/modules/coredns',
                    'agent/collectors/go.d.plugin/modules/dnsmasq_dhcp',
                    'agent/collectors/go.d.plugin/modules/dnsquery',
                    'agent/collectors/go.d.plugin/modules/docker_engine',
                    'agent/collectors/go.d.plugin/modules/dockerhub',
                    'agent/collectors/go.d.plugin/modules/fluentd',
                    'agent/collectors/go.d.plugin/modules/freeradius',
                    'agent/collectors/go.d.plugin/modules/hdfs',
                    'agent/collectors/go.d.plugin/modules/httpcheck',
                    'agent/collectors/go.d.plugin/modules/k8s_kubelet',
                    'agent/collectors/go.d.plugin/modules/k8s_kubeproxy',
                    'agent/collectors/go.d.plugin/modules/lighttpd',
                    'agent/collectors/go.d.plugin/modules/lighttpd2',
                    'agent/collectors/go.d.plugin/modules/logstash',
                    'agent/collectors/go.d.plugin/modules/mysql',
                    'agent/collectors/go.d.plugin/modules/nginx',
                    'agent/collectors/go.d.plugin/modules/openvpn',
                    'agent/collectors/go.d.plugin/modules/phpdaemon',
                    'agent/collectors/go.d.plugin/modules/phpfpm',
                    'agent/collectors/go.d.plugin/modules/pihole',
                    'agent/collectors/go.d.plugin/modules/portcheck',
                    'agent/collectors/go.d.plugin/modules/rabbitmq',
                    'agent/collectors/go.d.plugin/modules/scaleio',
                    'agent/collectors/go.d.plugin/modules/solr',
                    'agent/collectors/go.d.plugin/modules/springboot2',
                    'agent/collectors/go.d.plugin/modules/squidlog',
                    'agent/collectors/go.d.plugin/modules/tengine',
                    'agent/collectors/go.d.plugin/modules/unbound',
                    'agent/collectors/go.d.plugin/modules/vcsa',
                    'agent/collectors/go.d.plugin/modules/vernemq',
                    'agent/collectors/go.d.plugin/modules/vsphere',
                    'agent/collectors/go.d.plugin/modules/weblog',
                    'agent/collectors/go.d.plugin/modules/wmi',
                    'agent/collectors/go.d.plugin/modules/x509check',
                    'agent/collectors/go.d.plugin/modules/zookeeper',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Python',
              items: [
                'agent/collectors/python.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'agent/collectors/python.d.plugin/adaptec_raid',
                    'agent/collectors/python.d.plugin/am2320',
                    'agent/collectors/python.d.plugin/apache',
                    'agent/collectors/python.d.plugin/beanstalk',
                    'agent/collectors/python.d.plugin/bind_rndc',
                    'agent/collectors/python.d.plugin/boinc',
                    'agent/collectors/python.d.plugin/ceph',
                    'agent/collectors/python.d.plugin/chrony',
                    'agent/collectors/python.d.plugin/couchdb',
                    'agent/collectors/python.d.plugin/dnsdist',
                    'agent/collectors/python.d.plugin/dns_query_time',
                    'agent/collectors/python.d.plugin/dockerd',
                    'agent/collectors/python.d.plugin/dovecot',
                    'agent/collectors/python.d.plugin/elasticsearch',
                    'agent/collectors/python.d.plugin/energid',
                    'agent/collectors/python.d.plugin/example',
                    'agent/collectors/python.d.plugin/exim',
                    'agent/collectors/python.d.plugin/fail2ban',
                    'agent/collectors/python.d.plugin/freeradius',
                    'agent/collectors/python.d.plugin/gearman',
                    'agent/collectors/python.d.plugin/go_expvar',
                    'agent/collectors/python.d.plugin/haproxy',
                    'agent/collectors/python.d.plugin/hddtemp',
                    'agent/collectors/python.d.plugin/hpssa',
                    'agent/collectors/python.d.plugin/httpcheck',
                    'agent/collectors/python.d.plugin/icecast',
                    'agent/collectors/python.d.plugin/ipfs',
                    'agent/collectors/python.d.plugin/isc_dhcpd',
                    'agent/collectors/python.d.plugin/litespeed',
                    'agent/collectors/python.d.plugin/logind',
                    'agent/collectors/python.d.plugin/megacli',
                    'agent/collectors/python.d.plugin/memcached',
                    'agent/collectors/python.d.plugin/mongodb',
                    'agent/collectors/python.d.plugin/monit',
                    'agent/collectors/python.d.plugin/mysql',
                    'agent/collectors/python.d.plugin/nginx',
                    'agent/collectors/python.d.plugin/nginx_plus',
                    'agent/collectors/python.d.plugin/nsd',
                    'agent/collectors/python.d.plugin/ntpd',
                    'agent/collectors/python.d.plugin/nvidia_smi',
                    'agent/collectors/python.d.plugin/openldap',
                    'agent/collectors/python.d.plugin/oracledb',
                    'agent/collectors/python.d.plugin/ovpn_status_log',
                    'agent/collectors/python.d.plugin/phpfpm',
                    'agent/collectors/python.d.plugin/portcheck',
                    'agent/collectors/python.d.plugin/postfix',
                    'agent/collectors/python.d.plugin/postgres',
                    'agent/collectors/python.d.plugin/powerdns',
                    'agent/collectors/python.d.plugin/proxysql',
                    'agent/collectors/python.d.plugin/puppet',
                    'agent/collectors/python.d.plugin/rabbitmq',
                    'agent/collectors/python.d.plugin/redis',
                    'agent/collectors/python.d.plugin/rethinkdbs',
                    'agent/collectors/python.d.plugin/retroshare',
                    'agent/collectors/python.d.plugin/riakkv',
                    'agent/collectors/python.d.plugin/samba',
                    'agent/collectors/python.d.plugin/sensors',
                    'agent/collectors/python.d.plugin/smartd_log',
                    'agent/collectors/python.d.plugin/spigotmc',
                    'agent/collectors/python.d.plugin/springboot',
                    'agent/collectors/python.d.plugin/squid',
                    'agent/collectors/python.d.plugin/tomcat',
                    'agent/collectors/python.d.plugin/tor',
                    'agent/collectors/python.d.plugin/traefik',
                    'agent/collectors/python.d.plugin/uwsgi',
                    'agent/collectors/python.d.plugin/varnish',
                    'agent/collectors/python.d.plugin/w1sensor',
                    'agent/collectors/python.d.plugin/web_log',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Node.js',
              items: [
                'agent/collectors/node.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'agent/collectors/node.d.plugin/fronius',
                    'agent/collectors/node.d.plugin/named',
                    'agent/collectors/node.d.plugin/sma_webbox',
                    'agent/collectors/node.d.plugin/snmp',
                    'agent/collectors/node.d.plugin/stiebeleltron',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Bash',
              items: [
                'agent/collectors/charts.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'agent/collectors/charts.d.plugin/ap',
                    'agent/collectors/charts.d.plugin/apcupsd',
                    'agent/collectors/charts.d.plugin/example',
                    'agent/collectors/charts.d.plugin/libreswan',
                    'agent/collectors/charts.d.plugin/nut',
                    'agent/collectors/charts.d.plugin/opensips',
                    'agent/collectors/charts.d.plugin/sensors',
                  ]
                },
              ]
            },
            'agent/collectors/apps.plugin',
            'agent/collectors/cups.plugin',
            'agent/collectors/fping.plugin',
            'agent/collectors/ioping.plugin',
            'agent/collectors/freeipmi.plugin',
            'agent/collectors/nfacct.plugin',
            'agent/collectors/xenstat.plugin',
            'agent/collectors/perf.plugin',
            'agent/collectors/slabinfo.plugin',
          ]
        },
      ]
    },
    {
      type: 'category',
      label: 'Netdata Cloud',
      items: [
        'agent/netdata-cloud',
        'agent/netdata-cloud/signing-in',
        'agent/netdata-cloud/nodes-view',
      ]
    },
    {
      type: 'category',
      label: 'Dashboards',
      items: [
        'agent/web',
        'agent/web/gui',
        'agent/web/gui/custom',
        'agent/web/gui/confluence',
      ]
    },
    {
      type: 'category',
      label: 'Health monitoring',
      items: [
        'agent/health',
        'agent/health/quickstart',
        'agent/health/reference',
        {
          type: 'category',
          label: 'Tutorials',
          items: [
            'agent/health/tutorials/dimension-templates',
            'agent/health/tutorials/stop-notifications-alarms',
          ]
        },
        'agent/health/notifications',
        {
          type: 'category',
          label: 'Supported notifications',
          items: [
            'agent/health/notifications/alerta',
            'agent/health/notifications/awssns',
            'agent/health/notifications/custom',
            'agent/health/notifications/discord',
            'agent/health/notifications/email',
            'agent/health/notifications/web',
            'agent/health/notifications/flock',
            'agent/health/notifications/hangouts',
            'agent/health/notifications/irc',
            'agent/health/notifications/kavenegar',
            'agent/health/notifications/messagebird',
            'agent/health/notifications/pagerduty',
            'agent/health/notifications/prowl',
            'agent/health/notifications/pushbullet',
            'agent/health/notifications/pushover',
            'agent/health/notifications/rocketchat',
            'agent/health/notifications/slack',
            'agent/health/notifications/smstools3',
            'agent/health/notifications/syslog',
            'agent/health/notifications/telegram',
            'agent/health/notifications/twilio',
          ]
        },
      ],
    },
    {
      type: 'doc',
      id: 'agent/streaming',
    },
    {
      type: 'category',
      label: 'Archiving to backends',
      items: [
        'agent/backends',
        'agent/backends/timescale',
        'agent/backends/walkthrough',
        'agent/backends/aws_kinesis',
        'agent/backends/mongodb',
        'agent/backends/opentsdb',
        'agent/backends/prometheus',
        'agent/backends/prometheus/remote_write',
      ],
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
    {
      type: 'category',
      label: 'Contributing to Netdata',
      items: [
        'agent/contributing',
        'agent/contributing/contributing-documentation',
        'agent/contributing/style-guide',
        'agent/code_of_conduct',
        'agent/contributors',
        'agent/packaging/maintainers',
      ],
    },
    {
      type: 'category',
      label: 'Additional information',
      items: [
        'agent/packaging/makeself',
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
        'agent/contrib',
        'agent/tests',
        'agent/tests/health_mgmtapi',
        'agent/diagrams/data_structures',
      ],
    },
  ],
  cloud: [
    {
      type: 'doc',
      id: 'cloud'
    }
  ]
};