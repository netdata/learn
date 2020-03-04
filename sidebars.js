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
      id: 'introduction'
    },
    {
      type: 'category',
      label: 'About Netdata',
      items: [
        'what-is-netdata',
        'demo-sites',
        'netdata-security',
        'anonymous-statistics',
        'donations-netdata-has-received',
        'a-github-star-is-important',
        'redistributed',
        'changelog',
        'security',
      ]
    },
    {
      type: 'category',
      label: 'Why Netdata?',
      items: [
        'why-netdata',
        'why-netdata/1s-granularity',
        'why-netdata/unlimited-metrics',
        'why-netdata/meaningful-presentation',
        'why-netdata/immediate-results',
      ]
    },
    {
      type: 'category',
      label: 'Installation',
      items: [
        'packaging/installer',
        {
          type: 'category',
          label: 'Other methods',
          items: [
            'packaging/installer/methods/packages',
            'packaging/installer/methods/kickstart',
            'packaging/docker',
            'packaging/installer/methods/cloud-providers',
            'packaging/installer/methods/macos',
            'packaging/installer/methods/freebsd',
            'packaging/installer/methods/manual',
            'packaging/installer/methods/offline',
            'packaging/installer/methods/pfsense',
            'packaging/installer/methods/synology',
            'packaging/installer/methods/freenas',
            'packaging/installer/methods/alpine',
          ]
        },
        'packaging/distributions',
        'packaging/installer/update',
        'packaging/installer/uninstall',
      ]
    },
    {
      type: 'doc',
      id: 'getting-started',
    },
    {
      type: 'category',
      label: 'Step-by-step guide',
      items: [
        'step-by-step/step-00',
        'step-by-step/step-01',
        'step-by-step/step-02',
        'step-by-step/step-03',
        'step-by-step/step-04',
        'step-by-step/step-05',
        'step-by-step/step-06',
        'step-by-step/step-07',
        'step-by-step/step-08',
        'step-by-step/step-09',
        'step-by-step/step-10',
        'step-by-step/step-99',
      ]
    },
    {
      type: 'category',
      label: 'Running Netdata',
      items: [
        'daemon',
        'configuration-guide',
        'daemon/config',
        {
          type: 'category',
          label: 'Web server',
          items: [
            'web/server',
            'web/server/static',
            {
              type: 'category',
              label: 'Running behind another web server',
              items: [
                'running-behind-nginx',
                'running-behind-apache',
                'running-behind-lighttpd',
                'running-behind-caddy',
              ]
            },
            'running-behind-haproxy'
          ]
        },
        'database',
        'database/engine',
        'registry',
        'performance',
        'netdata-for-iot',
        'high-performance-netdata',
      ],
    },
    {
      type: 'category',
      label: 'Collecting metrics',
      items: [
        'collectors',
        'collectors/quickstart',
        'collectors/reference',
        'collectors/collectors',
        {
          type: 'category',
          label: 'Internal plugins',
          items: [
            'collectors/ebpf_process.plugin',
            'collectors/proc.plugin',
            'collectors/statsd.plugin',
            'collectors/cgroups.plugin',
            'collectors/idlejitter.plugin',
            'collectors/tc.plugin',
            'collectors/checks.plugin',
            'collectors/diskspace.plugin',
            'collectors/freebsd.plugin',
          ]
        },
        {
          type: 'category',
          label: 'External plugins',
          items: [
            'collectors/plugins.d',
            {
              type: 'category',
              label: 'Go',
              items: [
                'collectors/go.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'collectors/go.d.plugin/modules/activemq',
                    'collectors/go.d.plugin/modules/apache',
                    'collectors/go.d.plugin/modules/bind',
                    'collectors/go.d.plugin/modules/cockroachdb',
                    'collectors/go.d.plugin/modules/consul',
                    'collectors/go.d.plugin/modules/coredns',
                    'collectors/go.d.plugin/modules/dnsmasq_dhcp',
                    'collectors/go.d.plugin/modules/dnsquery',
                    'collectors/go.d.plugin/modules/docker_engine',
                    'collectors/go.d.plugin/modules/dockerhub',
                    'collectors/go.d.plugin/modules/fluentd',
                    'collectors/go.d.plugin/modules/freeradius',
                    'collectors/go.d.plugin/modules/hdfs',
                    'collectors/go.d.plugin/modules/httpcheck',
                    'collectors/go.d.plugin/modules/k8s_kubelet',
                    'collectors/go.d.plugin/modules/k8s_kubeproxy',
                    'collectors/go.d.plugin/modules/lighttpd',
                    'collectors/go.d.plugin/modules/lighttpd2',
                    'collectors/go.d.plugin/modules/logstash',
                    'collectors/go.d.plugin/modules/mysql',
                    'collectors/go.d.plugin/modules/nginx',
                    'collectors/go.d.plugin/modules/openvpn',
                    'collectors/go.d.plugin/modules/phpdaemon',
                    'collectors/go.d.plugin/modules/phpfpm',
                    'collectors/go.d.plugin/modules/pihole',
                    'collectors/go.d.plugin/modules/portcheck',
                    'collectors/go.d.plugin/modules/rabbitmq',
                    'collectors/go.d.plugin/modules/scaleio',
                    'collectors/go.d.plugin/modules/solr',
                    'collectors/go.d.plugin/modules/springboot2',
                    'collectors/go.d.plugin/modules/squidlog',
                    'collectors/go.d.plugin/modules/tengine',
                    'collectors/go.d.plugin/modules/unbound',
                    'collectors/go.d.plugin/modules/vcsa',
                    'collectors/go.d.plugin/modules/vernemq',
                    'collectors/go.d.plugin/modules/vsphere',
                    'collectors/go.d.plugin/modules/weblog',
                    'collectors/go.d.plugin/modules/wmi',
                    'collectors/go.d.plugin/modules/x509check',
                    'collectors/go.d.plugin/modules/zookeeper',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Python',
              items: [
                'collectors/python.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'collectors/python.d.plugin/adaptec_raid',
                    'collectors/python.d.plugin/am2320',
                    'collectors/python.d.plugin/apache',
                    'collectors/python.d.plugin/beanstalk',
                    'collectors/python.d.plugin/bind_rndc',
                    'collectors/python.d.plugin/boinc',
                    'collectors/python.d.plugin/ceph',
                    'collectors/python.d.plugin/chrony',
                    'collectors/python.d.plugin/couchdb',
                    'collectors/python.d.plugin/dnsdist',
                    'collectors/python.d.plugin/dns_query_time',
                    'collectors/python.d.plugin/dockerd',
                    'collectors/python.d.plugin/dovecot',
                    'collectors/python.d.plugin/elasticsearch',
                    'collectors/python.d.plugin/energid',
                    'collectors/python.d.plugin/example',
                    'collectors/python.d.plugin/exim',
                    'collectors/python.d.plugin/fail2ban',
                    'collectors/python.d.plugin/freeradius',
                    'collectors/python.d.plugin/gearman',
                    'collectors/python.d.plugin/go_expvar',
                    'collectors/python.d.plugin/haproxy',
                    'collectors/python.d.plugin/hddtemp',
                    'collectors/python.d.plugin/hpssa',
                    'collectors/python.d.plugin/httpcheck',
                    'collectors/python.d.plugin/icecast',
                    'collectors/python.d.plugin/ipfs',
                    'collectors/python.d.plugin/isc_dhcpd',
                    'collectors/python.d.plugin/litespeed',
                    'collectors/python.d.plugin/logind',
                    'collectors/python.d.plugin/megacli',
                    'collectors/python.d.plugin/memcached',
                    'collectors/python.d.plugin/mongodb',
                    'collectors/python.d.plugin/monit',
                    'collectors/python.d.plugin/mysql',
                    'collectors/python.d.plugin/nginx',
                    'collectors/python.d.plugin/nginx_plus',
                    'collectors/python.d.plugin/nsd',
                    'collectors/python.d.plugin/ntpd',
                    'collectors/python.d.plugin/nvidia_smi',
                    'collectors/python.d.plugin/openldap',
                    'collectors/python.d.plugin/oracledb',
                    'collectors/python.d.plugin/ovpn_status_log',
                    'collectors/python.d.plugin/phpfpm',
                    'collectors/python.d.plugin/portcheck',
                    'collectors/python.d.plugin/postfix',
                    'collectors/python.d.plugin/postgres',
                    'collectors/python.d.plugin/powerdns',
                    'collectors/python.d.plugin/proxysql',
                    'collectors/python.d.plugin/puppet',
                    'collectors/python.d.plugin/rabbitmq',
                    'collectors/python.d.plugin/redis',
                    'collectors/python.d.plugin/rethinkdbs',
                    'collectors/python.d.plugin/retroshare',
                    'collectors/python.d.plugin/riakkv',
                    'collectors/python.d.plugin/samba',
                    'collectors/python.d.plugin/sensors',
                    'collectors/python.d.plugin/smartd_log',
                    'collectors/python.d.plugin/spigotmc',
                    'collectors/python.d.plugin/springboot',
                    'collectors/python.d.plugin/squid',
                    'collectors/python.d.plugin/tomcat',
                    'collectors/python.d.plugin/tor',
                    'collectors/python.d.plugin/traefik',
                    'collectors/python.d.plugin/uwsgi',
                    'collectors/python.d.plugin/varnish',
                    'collectors/python.d.plugin/w1sensor',
                    'collectors/python.d.plugin/web_log',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Node.js',
              items: [
                'collectors/node.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'collectors/node.d.plugin/fronius',
                    'collectors/node.d.plugin/named',
                    'collectors/node.d.plugin/sma_webbox',
                    'collectors/node.d.plugin/snmp',
                    'collectors/node.d.plugin/stiebeleltron',
                  ]
                },
              ]
            },
            {
              type: 'category',
              label: 'Bash',
              items: [
                'collectors/charts.d.plugin',
                {
                  type: 'category',
                  label: 'Modules',
                  items: [
                    'collectors/charts.d.plugin/ap',
                    'collectors/charts.d.plugin/apcupsd',
                    'collectors/charts.d.plugin/example',
                    'collectors/charts.d.plugin/libreswan',
                    'collectors/charts.d.plugin/nut',
                    'collectors/charts.d.plugin/opensips',
                    'collectors/charts.d.plugin/sensors',
                  ]
                },
              ]
            },
            'collectors/apps.plugin',
            'collectors/cups.plugin',
            'collectors/fping.plugin',
            'collectors/ioping.plugin',
            'collectors/freeipmi.plugin',
            'collectors/nfacct.plugin',
            'collectors/xenstat.plugin',
            'collectors/perf.plugin',
            'collectors/slabinfo.plugin',
          ]
        },
      ]
    },
    {
      type: 'category',
      label: 'Netdata Cloud',
      items: [
        'netdata-cloud',
        'netdata-cloud/signing-in',
        'netdata-cloud/nodes-view',
      ]
    },
    {
      type: 'category',
      label: 'Dashboards',
      items: [
        'web',
        'web/gui',
        'web/gui/custom',
        'web/gui/confluence',
      ]
    },
    {
      type: 'category',
      label: 'Health monitoring',
      items: [
        'health',
        'health/quickstart',
        'health/reference',
        {
          type: 'category',
          label: 'Tutorials',
          items: [
            'health/tutorials/dimension-templates',
            'health/tutorials/stop-notifications-alarms',
          ]
        },
        'health/notifications',
        {
          type: 'category',
          label: 'Supported notifications',
          items: [
            'health/notifications/alerta',
            'health/notifications/awssns',
            'health/notifications/custom',
            'health/notifications/discord',
            'health/notifications/email',
            'health/notifications/web',
            'health/notifications/flock',
            'health/notifications/hangouts',
            'health/notifications/irc',
            'health/notifications/kavenegar',
            'health/notifications/messagebird',
            'health/notifications/pagerduty',
            'health/notifications/prowl',
            'health/notifications/pushbullet',
            'health/notifications/pushover',
            'health/notifications/rocketchat',
            'health/notifications/slack',
            'health/notifications/smstools3',
            'health/notifications/syslog',
            'health/notifications/telegram',
            'health/notifications/twilio',
          ]
        },
      ],
    },
    {
      type: 'doc',
      id: 'streaming',
    },
    {
      type: 'category',
      label: 'Archiving to backends',
      items: [
        'backends',
        'backends/timescale',
        'backends/walkthrough',
        'backends/aws_kinesis',
        'backends/mongodb',
        'backends/opentsdb',
        'backends/prometheus',
        'backends/prometheus/remote_write',
      ],
    },
    {
      type: 'category',
      label: 'HTTP API',
      items: [
        'web/api',
        {
          type: 'category',
          label: 'Exporters',
          items: [
            'web/api/exporters',
            'web/api/exporters/prometheus',
            'web/api/exporters/shell',
          ]
        },
        {
          type: 'category',
          label: 'Formatters',
          items: [
            'web/api/formatters',
            'web/api/formatters/csv',
            'web/api/formatters/json',
            'web/api/formatters/ssv',
            'web/api/formatters/value',
          ]
        },
        'web/api/badges',
        'web/api/health',
        {
          type: 'category',
          label: 'Queries',
          items: [
            'web/api/queries',
            'web/api/queries/average',
            'web/api/queries/des',
            'web/api/queries/incremental_sum',
            'web/api/queries/max',
            'web/api/queries/median',
            'web/api/queries/min',
            'web/api/queries/ses',
            'web/api/queries/stddev',
            'web/api/queries/sum',
          ]
        },
      ],
    },
    {
      type: 'category',
      label: 'Contributing to Netdata',
      items: [
        'contributing',
        'contributing/contributing-documentation',
        'contributing/style-guide',
        'code_of_conduct',
        'contributors',
        'packaging/maintainers',
      ],
    },
    {
      type: 'category',
      label: 'Additional information',
      items: [
        'packaging/makeself',
        {
          type: 'category',
          label: 'libnetdata',
          items: [
            'libnetdata',
            'libnetdata/adaptive_resortable_list',
            'libnetdata/avl',
            'libnetdata/buffer',
            'libnetdata/clocks',
            'libnetdata/config',
            'libnetdata/dictionary',
            'libnetdata/ebpf',
            'libnetdata/eval',
            'libnetdata/json',
            'libnetdata/locks',
            'libnetdata/log',
            'libnetdata/popen',
            'libnetdata/procfile',
            'libnetdata/simple_pattern',
            'libnetdata/socket',
            'libnetdata/statistical',
            'libnetdata/storage_number',
            'libnetdata/threads',
            'libnetdata/url',
          ]
        },
        'contrib',
        'tests',
        'tests/health_mgmtapi',
        'diagrams/data_structures',
      ],
    },
  ]
};