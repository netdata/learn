import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import { Grid, Box } from '@site/src/components/Grid'

const GuideItems = [
  {
    title: <>Change how long Netdata stores metrics</>,
    href: '/guides/longer-metrics-storage',
    category: 'collect-monitor',
    description: (
      <>
        Learn how to store metrics to your hard drive.
      </>
    )
  },
  {
    title: <>Machine learning (ML) powered anomaly detection</>,
    href: '/guides/monitor/anomaly-detection',
    category: 'collect-monitor',
    description: (
      <>
        Enable Netdata's machine learning algorithm to spot anomalies effortlessly. 
      </>
    )
  },
  {
    title: <>Stop notifications for individual alarms</>,
    href: '/guides/monitor/stop-notifications-alarms',
    category: 'configure',
    description: (
      <>
        Learn how to disable select alarms to minimize distractions.
      </>
    )
  },
  {
    title: <>Develop a custom data collector in Python</>,
    href: '/guides/python-collector',
    category: 'develop',
    description: (
      <>
        Learn how write a custom data collector in Python, which you'll use to collect metrics from and monitor any application that isn't supported out of the box.
      </>
    )
  },
  {
    title: <>How to use any StatsD data source with Netdata</>,
    href: '/guides/monitor/statsd',
    category: 'collect-monitor',
    description: (
      <> 
        Learn how to monitor any custom application instrumented with StatsD with per-second metrics and fully customizable, interactive charts.
      </>
    )
  },
  {
    title: <>Unsupervised anomaly detection for Raspberry Pi monitoring</>,
    href: '/guides/monitor/raspberry-pi-anomaly-detection',
    category: 'collect-monitor',
    description: (
      <>
        Use a low-overhead machine learning algorithm and an open-source monitoring tool to detect anomalous metrics on a Raspberry Pi.
      </>
    )
  },
  {
    title: <>LAMP stack monitoring (Linux, Apache, MySQL, PHP) with Netdata</>,
    href: '/guides/monitor/lamp-stack',
    category: 'collect-monitor',
    description: (
      <>
        Set up robust LAMP stack monitoring (Linux, Apache, MySQL, PHP) in just a few minutes using a free, open-source monitoring tool that collects metrics every second.
      </>
    )
  },
  {
    title: <>Detect anomalies in systems and applications (part 1)</>,
    href: '/guides/monitor/anomaly-detection-python',
    category: 'collect-monitor',
    description: (
      <>
        Detect anomalies in any system, container, or application in your infrastructure with machine learning and the open-source Netdata Agent.
      </>
    )
  },
  {
    title: <>Monitor and visualize anomalies (part 2)</>,
    href: '/guides/monitor/visualize-monitor-anomalies',
    category: 'collect-monitor',
    description: (
      <>
        Using unsupervised anomaly detection, trigger alarms seconds after your mission-critical metrics behave strangely, then visualize everything in parallel to find the root cause.
      </>
    )
  },
  {
    title: <>Monitor any process in real-time with Netdata</>,
    href: '/guides/monitor/process',
    category: 'collect-monitor',
    description: (
      <>
        Tap into Netdata's powerful collectors, with per-second utilization metrics for every process, to troubleshoot faster and make data-informed decisions.
      </>
    )
  },
  {
    title: <>Monitor a Kubernetes (k8s) cluster with Netdata</>,
    href: '/guides/monitor/kubernetes-k8s-netdata',
    category: 'collect-monitor',
    description: (
      <>
        Use Netdata's helmchart, service discovery plugin, and Kubelet/kube-proxy collectors for real-time visibility into your Kubernetes cluster.
      </>
    )
  }, 
  {
    title: <>Monitor, troubleshoot, and debug applications with eBPF metrics</>,
    href: '/guides/troubleshoot/monitor-debug-applications-ebpf',
    category: 'collect-monitor',
    description: (
      <>
        Using this guide, you'll learn the fundamentals of setting up Netdata to give you kernel-level metrics from your application so that you can monitor, troubleshoot, and debug to your heart's content.
      </>
    )
  },
  {
    title: <>Monitor Pi-hole (and a Raspberry Pi) with Netdata</>,
    href: '/guides/monitor/pi-hole-raspberry-pi',
    category: 'collect-monitor',
    description: (
      <>
        Netdata helps you monitor and troubleshoot all kinds of devices and the applications they run, including IoT devices like the Raspberry Pi and applications like Pi-hole.
      </>
    )
  },
  {
    title: <>How to optimize the Netdata Agent's performance</>,
    href: '/guides/configure/performance',
    category: 'configure',
    description: (
      <>
        While the Netdata Agent is designed to monitor a system with only 1% CPU, you can optimize its performance for low-resource systems.
      </>
    )
  },
  {
    title: <>Use host labels to organize systems, metrics, and alarms</>,
    href: '/guides/using-host-labels',
    category: 'configure',
    description: (
      <>
        Let's take a peek into how to create host labels and apply them across a few of Netdata's features to give you more organization power over your infrastructure.
      </>
    )
  },
  {
    title: <>Export and visualize Netdata metrics in Graphite</>,
    href: '/guides/export/export-netdata-metrics-graphite',
    category: 'export',
    description: (
      <>
        In this guide, we'll show you how to export Netdata metrics to Graphite for long-term storage and further analysis.
      </>
    )
  },
  {
    title: <>Monitor Nginx or Apache web server log files with Netdata</>,
    href: '/guides/collect-apache-nginx-web-logs',
    category: 'collect-monitor',
    description: (
      <>
        This guide will walk you through using the new Go-based web log collector to turn the logs these web servers constantly write to into real-time insights into your infrastructure.
      </>
    )
  },
  {
    title: <>Use dimension templates to create dynamic alarms</>,
    href: '/guides/monitor/dimension-templates',
    category: 'configure',
    description: (
      <>
        Dimension templates can condense many individual entities into one—no more copy-pasting one entity and changing the alarm/template and lookup lines for each dimension you'd like to monitor.
      </>
    )
  },
  {
    title: <>Monitor Unbound DNS servers with Netdata</>,
    href: '/guides/collect-unbound-metrics',
    category: 'collect-monitor',
    description: (
      <>
        This guide will show you how to collect dozens of essential metrics from your Unbound servers with minimal configuration.
      </>
    )
  },
  {
    title: <>Monitor CockroachDB metrics with Netdata</>,
    href: '/guides/monitor-cockroachdb',
    category: 'collect-monitor',
    description: (
      <>
        Collect more than 50 unique metrics from CockroachDB databases and put them on interactive visualizations designed for better visual anomaly detection.
      </>
    )
  },
  {
    title: <>Monitor a Hadoop cluster with Netdata</>,
    href: '/guides/monitor-hadoop-cluster',
    category: 'collect-monitor',
    description: (
      <>
        Netdata comes with built-in and pre-configured support for monitoring both HDFS and Zookeeper.
      </>
    )
  },
  {
    title: <>The step-by-step Netdata guide</>,
    href: '/guides/step-by-step/step-00',
    category: 'step-by-step',
    description: (
      <>
        Learn about Netdata's many features and capabilities in a guided experienced designed for those new to monitoring and troubleshooting.
      </>
    )
  },
  {
    title: <>Step 1. Netdata's building blocks</>,
    href: '/guides/step-by-step/step-01',
    category: 'step-by-step',
    description: (
      <>
        In this introductory step, we'll talk about the fundamental ideas, philosophies, and UX decisions behind Netdata.
      </>
    )
  },
  {
    title: <>Step 2. Get to know Netdata's dashboard</>,
    href: '/guides/step-by-step/step-02',
    category: 'step-by-step',
    description: (
      <>
        Visit Netdata's dashboard to explore, manipulate charts, and check out alarms. Get your first taste of visual anomaly detection.
      </>
    )
  },
  {
    title: <>Step 3. Monitor more than one system with Netdata</>,
    href: '/guides/step-by-step/step-03',
    category: 'step-by-step',
    description: (
      <>
        While the dashboard lets you quickly move from one agent to another, Netdata Cloud is our SaaS solution for monitoring the health of many systems. We'll cover its features and the benefits of using Netdata Cloud on top of the dashboard.
      </>
    )
  },
  {
    title: <>Step 4. The basics of configuring Netdata</>,
    href: '/guides/step-by-step/step-04',
    category: 'step-by-step',
    description: (
      <>
        While Netdata can monitor thousands of metrics in real-time without any configuration, you may want to tweak some settings based on your system's resources.
      </>
    )
  },
  {
    title: <>Step 5. Health monitoring alarms and notifications</>,
    href: '/guides/step-by-step/step-05',
    category: 'step-by-step',
    description: (
      <>
        Learn how to tune, silence, and write custom alarms. Then enable notifications so you never miss a change in health status or performance anomaly.
      </>
    )
  },
  {
    title: <>Step 6. Collect metrics from more services and apps</>,
    href: '/guides/step-by-step/step-06',
    category: 'step-by-step',
    description: (
      <>
        Learn how to enable/disable collection plugins and configure a collection plugin job to add more charts to your Netdata dashboard and begin monitoring more apps and services, like MySQL, Nginx, MongoDB, and hundreds more.
      </>
    )
  },
  {
    title: <>Step 7. Netdata's dashboard in depth</>,
    href: '/guides/step-by-step/step-07',
    category: 'step-by-step',
    description: (
      <>
        Now that you configured your Netdata monitoring agent to your exact needs, you'll dive back into metrics snapshots, updates, and the dashboard's settings.
      </>
    )
  },
  {
    title: <>Step 8. Building your first custom dashboard</>,
    href: '/guides/step-by-step/step-08',
    category: 'step-by-step',
    description: (
      <>
        Using simple HTML, CSS, and JavaScript, we'll build a custom dashboard that displays essential information in any format you choose. You can even monitor many systems from a single HTML file.
      </>
    )
  },
  {
    title: <>Step 9. Long-term metrics storage</>,
    href: '/guides/step-by-step/step-09',
    category: 'step-by-step',
    description: (
      <>
        By default, Netdata can store lots of real-time metrics, but you can also tweak our custom database engine to your heart's content. Want to take your Netdata metrics elsewhere? We're happy to help you archive data to Prometheus, MongoDB, TimescaleDB, and others.
      </>
    )
  },
  {
    title: <>Step 10. Set up a proxy</>,
    href: '/guides/step-by-step/step-10',
    category: 'step-by-step',
    description: (
      <>
        Run Netdata behind an Nginx proxy to improve performance, and enable TLS/HTTPS for better security.
      </>
    )
  },
  {
    title: <>Deploy Netdata with Ansible</>,
    href: '/guides/deploy/ansible',
    category: 'deploy',
    description: (
      <>
        Deploy an infrastructure monitoring solution in minutes with the Netdata Agent and Ansible. Use and customize a simple playbook for monitoring as code.
      </>
    )
  },
]

const GuideCategories = [
  {
    label: 'step-by-step',
    title: 'Step-by-step',
    description: <>Learn about Netdata's many features and capabilities in a guided experienced designed for those new to monitoring and troubleshooting.</>
  },
  {
    label: 'collect-monitor',
    title: 'Collect & monitor',
    description: <>Extract and visualize metrics from essential services or applications on your infrastructure.</>
  },
  {
    label: 'configure',
    title: 'Configure',
    description: <>Advanced configuration options for those who want to elevate their Netdata Agent-monitored nodes.</>
  },
  {
    label: 'deploy',
    title: 'Deploy',
    description: <>Strategies and playbooks for bootstrapping an infrastructure monitoring solution with Netdata and infrastructure as code tools.</>
  },
  {
    label: 'develop',
    title: 'Develop',
    description: <>Improve Netdata's developer experience through code contributions, developing new data collectors, and more.</>
  },
  {
    label: 'export',
    title: 'Export',
    description: <>Explore Netdata's interoperability with other monitoring and visualization platforms.</>
  },
]

export default function Guides() {  
  let itemsFiltered = GuideItems;
  let categoriesFiltered = GuideCategories;

  const [searchTerm, setSearchTerm] = useState(null);

  if (searchTerm) {
    let searchTerms = searchTerm.split(" ");
    itemsFiltered = itemsFiltered.filter(item => {
      let content = `${item.title.props.children.toLowerCase()} ${item.category.toLowerCase()}`;
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
    <>
      <Head>
        <meta property="og:type" content="website" />
      </Head>
      <Layout
        title={`Guides`}
        description="Thoughtful guides to help you learn more about collecting metrics, monitoring your infrastructure, and troubleshooting with Netdata's powerful visualizations.">
        <header className="overflow-hidden bg-gradient-to-br from-gray-200 to-gray-50 dark:from-gray-800 dark:to-gray-900 py-16 mb-16">
          <div className="container relative">
            <div className="z-10 relative w-full md:w-3/4 lg:w-1/2">
              <h1 className="text-2xl lg:text-5xl text-text font-semibold mb-6 dark:text-gray-50">Guides</h1>
              <p className="prose text-lg lg:text-xl text-text mb-6 dark:text-gray-50">Thoughtful guides to help you learn more about collecting metrics, monitoring your infrastructure, and troubleshooting with Netdata's powerful visualizations.</p>
              <input
                className="text-xl lg:text-2xl p-4 w-full dark:text-gray-200 dark:bg-gray-700"
                type="text"
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                placeholder="🔍 Search Netdata's guides..." />
            </div>
          </div>
        </header>
        <main className="container">
          {categoriesFiltered.map((props, idx) => (
            <>
              <div key={idx}>
                <div>
                  <h2 className="text-xl lg:text-3xl font-bold mb-2">{props.title}</h2>
                  <p className="lg:text-lg mb-6">{props.description}</p>
                </div>
              </div>
              <Grid columns="3" className="mb-24">
                {itemsFiltered.filter(item => item.category.includes(props.label)).map((props, idx) => (
                  <Box
                    key={idx}
                    to={props.href}
                    title={props.title}>
                    <p>{props.description}</p>
                  </Box>
                ))}
              </Grid>
            </>
          ))}

          {itemsFiltered.length == 0 &&
            <div className="">
              <div className="w-1/2 markdown">
                <p>Whoops! There is no guide matching matching your search. If you feel we're missing an essential guide and would like to request it, or discuss contributing the content yourself, hop over to our <Link href="https://community.netdata.cloud">community forum</Link>. Create a new topic and we'll be happy to discuss the guide with you there.</p>
              </div>
            </div>
          }
        </main>
      </Layout>
    </>
  );
}


function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main className="container">
        <Grid className="mb-16" columns="3">
          <Box 
            to="/docs/get-started/"
            title="Get started"
            cta="Install now"
            image={true}>
            Install the open-source monitoring agent on physical/virtual systems running most Linux distributions (Ubuntu, Debian, CentOS, and more), container platforms (Kubernetes clusters, Docker), and many other operating systems, with no <code>sudo</code> required.
          </Box>
          <Box 
            to="/docs/"
            title="Docs"
            cta="Read the docs"
            image={false}>
            Solution- and action-based docs for Netdata's many features and capabilities. Your table of contents to becoming an expert in using Netdata to monitor and troubleshoot applications and their infrastructure.
          </Box>
          <Box 
            to="/guides/"
            title="Guides"
            cta="Start learning"
            image={false}>
            Thoughtful guides to walk you through collecting the right metrics, monitoring your infrastructure, troubleshooting with Netdata's powerful visualizations, and much more.
          </Box>
        </Grid>
        <div id="updates" className="relative pb-8">
          <h2 className="z-10 relative text-xl lg:text-3xl font-semibold mb-6">What's new at Netdata?</h2>
          <div className="relative w-3/4">
            <div className="z-0 absolute -top-12 -bottom-8 left-1.5">
              <div className="z-10 relative w-4 h-16 top-0 bg-gradient-to-t from-transparent to-white dark:to-gray-900"></div>
              <div className="z-0 absolute top-0 w-1 h-full bg-green-lighter bg-opacity-20"></div>
              <div className="z-10 absolute w-4 h-16 bottom-0 bg-gradient-to-b from-transparent to-white dark:to-gray-900"></div>
            </div>
            <ul>
              {News.map((props, idx) => (
                <li key={props.title} className="group">
                  <Link to={props.href} className="grid md:grid-cols-8 xl:grid-cols-9 items-start">
                    <div className="md:col-start-3 md:col-span-6 xl:col-start-3 xl:col-span-7 p-8 rounded group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                      <h3 className="text-lg lg:text-xl font-semibold mb-2">{props.title}</h3>
                      <p>{props.description}</p>
                    </div>
                    <div className="flex items-center md:col-start-1 md:col-span-2 row-start-1 md:row-end-3 pt-8">
                      <div className="z-10 w-4 h-4 mr-8 bg-green rounded-full group-hover:bg-blue" />
                      <time className="text-base text-gray-500 font-medium">{props.date}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}
