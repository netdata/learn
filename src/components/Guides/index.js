import React, { useState } from 'react';
import clsx from 'clsx';

import Link from '@docusaurus/Link';

import { BoxGrid, Box } from '../BoxGrid/';

import styles from './styles.module.scss';

const GuideItems = [
  {
    title: "Develop a custom data collector in Python",
    href: "/guides/python-collector",
    category: "develop",
    description: "Learn how write a custom data collector in Python, which you'll use to collect metrics from and monitor any application that isn't supported out of the box."
  },
  {
    title: "How to use any StatsD data source with Netdata",
    href: "/guides/monitor/statsd",
    category: "collect-monitor",
    description: "Learn how to monitor any custom application instrumented with StatsD with per-second metrics and fully customizable, interactive charts."
  },
  {
    title: "Unsupervised anomaly detection for Raspberry Pi monitoring",
    href: "/guides/monitor/raspberry-pi-anomaly-detection",
    category: "collect-monitor",
    description: "Use a low-overhead machine learning algorithm and an open-source monitoring tool to detect anomalous metrics on a Raspberry Pi."
  },
  {
    title: "LAMP stack monitoring (Linux, Apache, MySQL, PHP) with Netdata",
    href: "/guides/monitor/lamp-stack",
    category: "collect-monitor",
    description: "Set up robust LAMP stack monitoring (Linux, Apache, MySQL, PHP) in just a few minutes using a free, open-source monitoring tool that collects metrics every second."
  },
  {
    title: "Detect anomalies in systems and applications (part 1)",
    href: "/guides/monitor/anomaly-detection",
    category: "collect-monitor",
    description: "Detect anomalies in any system, container, or application in your infrastructure with machine learning and the open-source Netdata Agent."
  },
  {
    title: "Monitor and visualize anomalies (part 2)",
    href: "/guides/monitor/visualize-monitor-anomalies",
    category: "collect-monitor",
    description: "Using unsupervised anomaly detection, trigger alarms seconds after your mission-critical metrics behave strangely, then visualize everything in parallel to find the root cause."
  },
  {
    title: "Monitor any process in real-time with Netdata",
    href: "/guides/monitor/process",
    category: "collect-monitor",
    description: "Tap into Netdata's powerful collectors, with per-second utilization metrics for every process, to troubleshoot faster and make data-informed decisions."
  },
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
    title: "How to optimize the Netdata Agent's performance",
    href: "/guides/configure/performance",
    category: "configure",
    description: "While the Netdata Agent is designed to monitor a system with only 1% CPU, you can optimize its performance for low-resource systems."
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
    href: "/guides/monitor/dimension-templates",
    category: "configure",
    description: "Dimension templates can condense many individual entities into one—no more copy-pasting one entity and changing the alarm/template and lookup lines for each dimension you'd like to monitor."
  },
  {
    title: "Monitor Unbound DNS servers with Netdata",
    href: "/guides/collect-unbound-metrics",
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
    href: "/guides/monitor-hadoop-cluster",
    category: "collect-monitor",
    description: "Netdata comes with built-in and pre-configured support for monitoring both HDFS and Zookeeper."
  },
  {
    title: "The step-by-step Netdata guide",
    href: "/guides/step-by-step/step-00",
    category: "step-by-step",
    description: "Learn about Netdata's many features and capabilities in a guided experienced designed for those new to monitoring and troubleshooting."
  },
  {
    title: "Step 1. Netdata's building blocks",
    href: "/guides/step-by-step/step-01",
    category: "step-by-step",
    description: ""
  },
  {
    title: "Step 2. Get to know Netdata's dashboard",
    href: "/guides/step-by-step/step-02",
    category: "step-by-step",
    description: "Visit Netdata's dashboard to explore, manipulate charts, and check out alarms. Get your first taste of visual anomaly detection."
  },
  {
    title: "Step 3. Monitor more than one system with Netdata",
    href: "/guides/step-by-step/step-03",
    category: "step-by-step",
    description: "While the dashboard lets you quickly move from one agent to another, Netdata Cloud is our SaaS solution for monitoring the health of many systems. We'll cover its features and the benefits of using Netdata Cloud on top of the dashboard."
  },
  {
    title: "Step 4. The basics of configuring Netdata",
    href: "/guides/step-by-step/step-04",
    category: "step-by-step",
    description: "While Netdata can monitor thousands of metrics in real-time without any configuration, you may want to tweak some settings based on your system's resources."
  },
  {
    title: "Step 5. Health monitoring alarms and notifications",
    href: "/guides/step-by-step/step-05",
    category: "step-by-step",
    description: "Learn how to tune, silence, and write custom alarms. Then enable notifications so you never miss a change in health status or performance anomaly."
  },
  {
    title: "Step 6. Collect metrics from more services and apps",
    href: "/guides/step-by-step/step-06",
    category: "step-by-step",
    description: "Learn how to enable/disable collection plugins and configure a collection plugin job to add more charts to your Netdata dashboard and begin monitoring more apps and services, like MySQL, Nginx, MongoDB, and hundreds more."
  },
  {
    title: "Step 7. Netdata's dashboard in depth",
    href: "/guides/step-by-step/step-07",
    category: "step-by-step",
    description: "Now that you configured your Netdata monitoring agent to your exact needs, you'll dive back into metrics snapshots, updates, and the dashboard's settings."
  },
  {
    title: "Step 8. Building your first custom dashboard",
    href: "/guides/step-by-step/step-08",
    category: "step-by-step",
    description: "Using simple HTML, CSS, and JavaScript, we'll build a custom dashboard that displays essential information in any format you choose. You can even monitor many systems from a single HTML file."
  },
  {
    title: "Step 9. Long-term metrics storage",
    href: "/guides/step-by-step/step-09",
    category: "step-by-step",
    description: "By default, Netdata can store lots of real-time metrics, but you can also tweak our custom database engine to your heart's content. Want to take your Netdata metrics elsewhere? We're happy to help you archive data to Prometheus, MongoDB, TimescaleDB, and others."
  },
  {
    title: "Step 10. Set up a proxy",
    href: "/guides/step-by-step/step-10",
    category: "step-by-step",
    description: "Run Netdata behind an Nginx proxy to improve performance, and enable TLS/HTTPS for better security."
  },
  {
    title: "Deploy Netdata with Ansible",
    href: "/guides/deploy/ansible",
    category: "deploy",
    description: "Deploy an infrastructure monitoring solution in minutes with the Netdata Agent and Ansible. Use and customize a simple playbook for monitoring as code."
  },
]

const GuideCategories = [
  {
    label: "collect-monitor",
    title: "Collect & monitor",
    description: "Extract and visualize metrics from essential services or applications on your infrastructure."
  },
  {
    label: "configure",
    title: "Configure",
    description: "Advanced configuration options for those who want to elevate their Netdata Agent-monitored nodes."
  },
  {
    label: "deploy",
    title: "Deploy",
    description: "Strategies and playbooks for bootstrapping an infrastructure monitoring solution with Netdata and infrastructure as code tools."
  },
  {
    label: "develop",
    title: "Develop",
    description: "Improve Netdata's developer experience through code contributions, developing new data collectors, and more."
  },
  {
    label: "export",
    title: "Export",
    description: "Explore Netdata's interoperability with other monitoring and visualization platforms."
  },
  {
    label: "step-by-step",
    title: "Step-by-step",
    description: "Learn about Netdata's many features and capabilities in a guided experienced designed for those new to monitoring and troubleshooting."
  },
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
              {itemsFiltered.filter(item => item.category.includes(props.label)).map((props, idx) => (
                <Box
                  key={idx}
                  title={props.title}
                  cta='Start now'
                  href={props.href}
                  >
                  <p>{props.description}</p>
                </Box>
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
