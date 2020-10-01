module.exports = {
  guides: [
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Collect & monitor',
          collapsed: true,
          items: [
            'monitor/kubernetes-k8s-netdata',
            'collect-apache-nginx-web-logs',
            'monitor/pi-hole-raspberry-pi',
            'monitor-cockroachdb',
            'collect-unbound-metrics',
            'monitor-hadoop-cluster'
          ]
        },
        'using-host-labels',
        'troubleshoot/monitor-debug-applications-ebpf',
        'export/export-netdata-metrics-graphite'
      ]
    }
  ]
}