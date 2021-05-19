import React from 'react'

export const ReleaseVersion = '1.31.0'

export const ReleaseDate = 'May 19, 2021'

export const ReleaseNotes = [
  'Re-packaged and redesigned dashboard',
  'eBPF expands into the directory cache',
  'Machine learning-powered collectors',
  'An improved Netdata learning experience',
]

export const News = [
  {
    title: <>Kubernetes monitoring with Netdata: Overview and visualizations</>,
    href: '/guides/monitor/kubernetes-k8s-netdata',
    date: 'May 5, 2021',
    type: 'Guide',
    description: (
      <>
        Learn how to navigate Netdata's Kubernetes monitoring features for visualizing the health and performance of a Kubernetes cluster with per-second granulrity.
      </>
    ),
  },
  {
    title: <>Z-scores collector</>,
    href: '/docs/agent/collectors/python.d.plugin/zscores',
    date: 'April 26, 2021',
    type: 'Collector',
    description: (
      <>
        Create smoothed, rolling Z-Scores for selected metrics or charts to visualize when they deviate from normal.
      </>
    ),
  },
  {
    title: <>Develop a custom data collector in Python</>,
    href: '/guides/python-collector',
    date: 'March 24, 2021',
    type: 'Guide',
    description: (
      <>
        Learn how write a custom data collector in Python, which you'll use to collect metrics from and monitor any application that isn't supported out of the box.
      </>
    ),
  },
  {
    title: <>How to use any StatsD data source with Netdata</>,
    href: '/guides/monitor/statsd',
    date: 'March 18, 2021',
    type: 'Guide',
    description: (
      <>
        Learn how to monitor any custom application instrumented with StatsD with per-second metrics and fully customizable, interactive charts.
      </>
    ),
  },
  {
    title: <>Unsupervised anomaly detection for Raspberry Pi monitoring</>,
    href: '/guides/monitor/raspberry-pi-anomaly-detection',
    date: 'March 16, 2021',
    type: 'Guide',
    description: (
      <>
        Use a low-overhead machine learning algorithm and an open-source monitoring tool to detect anomalous metrics on a Raspberry Pi.
      </>
    ),
  },
  {
    title: <>LAMP stack monitoring (Linux, Apache, MySQL, PHP) with Netdata</>,
    href: '/guides/monitor/lamp-stack',
    date: 'March 6, 2021',
    type: 'Guide',
    description: (
      <>
        Set up robust LAMP stack monitoring (Linux, Apache, MySQL, PHP) in just a few minutes using a free, open-source monitoring tool that collects metrics every second.
      </>
    ),
  }
]