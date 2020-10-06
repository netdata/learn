import React, { useState } from 'react';
import clsx from 'clsx';

import Link from '@docusaurus/Link';

import { BoxGrid, Box } from '../BoxGrid/';

import styles from './styles.module.scss';

const GuideItems = [
  {
    title: "Monitor a Kubernetes (k8s) cluster with Netdata",
    href: "/guides/monitor/kubernetes-k8s-netdata",
    category: "collect-monitor",
    description: "Use Netdata's helmchart, service discovery plugin, and Kubelet/kube-proxy collectors for real-time visibility into your Kubernetes cluster."
  }, 
  {
    title: "Monitor, troubleshoot, and debug applications with eBPF metrics",
    href: "/guides/troubleshoot/monitor-debug-applications-ebpf",
    category: "collect-monitor",
    description: "Using this guide, you'll learn the fundamentals of setting up Netdata to give you kernel-level metrics from your application so that you can monitor, troubleshoot, and debug to your heart's content."
  },
  {
    title: "Monitor Pi-hole (and a Raspberry Pi) with Netdata",
    href: "/guides/monitor/pi-hole-raspberry-pi",
    category: "collect-monitor",
    description: "Netdata helps you monitor and troubleshoot all kinds of devices and the applications they run, including IoT devices like the Raspberry Pi and applications like Pi-hole."
  },
  {
    title: "Use host labels to organize systems, metrics, and alarms",
    href: "/guides/using-host-labels",
    category: "configure",
    description: "Let's take a peek into how to create host labels and apply them across a few of Netdata's features to give you more organization power over your infrastructure."
  },
  {
    title: "Export and visualize Netdata metrics in Graphite",
    href: "/guides/export/export-netdata-metrics-graphite",
    category: "export",
    description: "In this guide, we'll show you how to export Netdata metrics to Graphite for long-term storage and further analysis.",
  },
  {
    title: "Monitor Nginx or Apache web server log files with Netdata",
    href: "/guides/collect-apache-nginx-web-logs",
    category: "collect-monitor",
    description: "This guide will walk you through using the new Go-based web log collector to turn the logs these web servers constantly write to into real-time insights into your infrastructure."
  },
  {
    title: "Use dimension templates to create dynamic alarms",
    href: "/guides/monitor/health/dimension-templates",
    category: "configure",
    description: "Dimension templates can condense many individual entities into one—no more copy-pasting one entity and changing the alarm/template and lookup lines for each dimension you'd like to monitor."
  },
  {
    title: "Monitor Unbound DNS servers with Netdata",
    href: "/guides/collect-uunbound-metrics",
    category: "collect-monitor",
    description: "This guide will show you how to collect dozens of essential metrics from your Unbound servers with minimal configuration."
  },
  {
    title: "Monitor CockroachDB metrics with Netdata",
    href: "/guides/monitor-cockroachdb",
    category: "collect-monitor",
    description: "Collect more than 50 unique metrics from CockroachDB databases and put them on interactive visualizations designed for better visual anomaly detection."
  },
  {
    title: "Monitor a Hadoop cluster with Netdata",
    href: "/guides/monitor-hadoop-clusuter",
    category: "collect-monitor",
    description: "Netdata comes with built-in and pre-configured support for monitoring both HDFS and Zookeeper."
  }
]

const GuideCategories = [
  {
    label: "collect-monitor",
    title: "Collect & monitor",
    description: "Extract and visualize metrics from essential services or applications on your infrastructure."
  },
  {
    label: "configure",
    title: "Configure"
  },
  {
    label: "export",
    title: "Export"
  }
]

export function Guides() {
  let itemsFiltered = GuideItems;
  let categoriesFiltered = GuideCategories;

  const [searchTerm, setSearchTerm] = useState(null);

  if (searchTerm) {
    let searchTerms = searchTerm.split(" ");
    itemsFiltered = itemsFiltered.filter(item => {
      let content = `${item.title.toLowerCase()} ${item.category.toLowerCase()}`;
      return searchTerms.every(term => {
        return content.includes(term.toLowerCase())
      })
    })

    if (itemsFiltered.length) {
      categoriesFiltered = GuideCategories.filter(category => {
        let match = itemsFiltered.filter(item => {
          return category.label.includes(item.category)
        })

        if (match.length) {
          return true
        }
      })
    } else {
      categoriesFiltered = []
    }
  }

  return (
    <div className={clsx('container', styles.Guides)}>
      <input
        className={clsx(styles.GuidesSearch)}
        type="text"
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        placeholder="🔍 Search Netdata's guides..." />

      <div className={clsx(styles.GuidesContainer)}>
        {categoriesFiltered.map((props, idx) => (
          <>
            <div key={idx} className={clsx('row', styles.GuidesRow)}>
              <div className={clsx('col', styles.GuidesCategory)}>
                <h2>{props.title}</h2>
                <p>{props.description}</p>
              </div>
            </div>
            <BoxGrid className="GuideBox">
              {itemsFiltered.filter(item => item.category.includes(props.label)).map(categorizedItem => (
                <Box
                  title={categorizedItem.title}
                  cta='Read now'
                  href={categorizedItem.href}
                  />
              ))}
            </BoxGrid>
          </>
        ))}

        {itemsFiltered.length == 0 &&
          <div className={clsx('row', styles.GuidesNoMatch)}>
            <div className="col col--8">
              <p>Whoops! There is no guide matching matching your search. If you feel we're missing an essential guide and would like to request it, or discuss contributing the content yourself, hop over to our <Link href="https://community.netdata.cloud">community forum</Link>. Create a new topic and we'll be happy to discuss the guide with you there.</p>
            </div>
          </div>
        }
      </div>
    </div>
  )
}
