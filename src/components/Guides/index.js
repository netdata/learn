import React, { useState } from 'react';
import clsx from 'clsx';

import Link from '@docusaurus/Link';

import { BoxGrid, Box } from '../BoxGrid/';

import styles from './styles.module.scss'; 
import { StartBox } from '../StartBox';

const GuideItems = [
   {
    title: 'Monitor, troubleshoot, and debug applications with eBPF metrics',
    href: '/guides/troubleshoot/monitor-debug-applications-ebpf',
    category: 'collect-monitor',
    description: "Using this guide, you'll learn the fundamentals of setting up Netdata to give you kernel-level metrics from your application so that you can monitor, troubleshoot, and debug to your heart's content."
  },
  {
    title: "Monitor Pi-hole (and a Raspberry Pi) with Netdata",
    href: '/guides/monitor/pi-hole-raspberry-pi',
    category: 'collect-monitor',
    description: "Netdata helps you monitor and troubleshoot all kinds of devices and the applications they run, including IoT devices like the Raspberry Pi and applications like Pi-hole."
  },
  {
    title: "Use host labels to organize systems, metrics, and alarms",
    href: '/guides/using-host-labels',
    category: 'configure',
    description: "Let's take a peek into how to create host labels and apply them across a few of Netdata's features to give you more organization power over your infrastructure."
  },
  {
    title: "Export and visualize Netdata metrics in Graphite",
    href: '/guides/export/export-netdata-metrics-graphite',
    category: 'export',
    description: "In this guide, we'll show you how to export Netdata metrics to Graphite for long-term storage and further analysis.",
    tech: [
      'graphite',
      'docker'
    ]
  },
  {
    title: "Monitor Nginx or Apache web server log files with Netdata",
    href: "/guides/collect-apache-nginx-web-logs",
    category: "collect-monitor",
    description: "This guide will walk you through using the new Go-based web log collector to turn the logs these web servers constantly write to into real-time insights into your infrastructure."
  },
]

const GuideCategories = [
  {
    label: 'collect-monitor',
    title: 'Collect & monitor'
  },
  {
    label: 'configure',
    title: 'Configure'
  },
  {
    label: 'export',
    title: 'Export'
  },
]

export function Guides() {
  let itemsFiltered = GuideItems;
  let categoriesFiltered = GuideCategories

  const [searchTerm, setSearchTerm] = useState(null);

  if (searchTerm) {
    let searchTerms = searchTerm.split(" ");
    itemsFiltered = itemsFiltered.filter(item => {
      let content = `${item.title.toLowerCase()} ${item.description.toLowerCase()} ${item.category.toLowerCase()}`;
      return searchTerms.every(term => {
        return content.includes(term.toLowerCase())
      })
    });

    categoriesFiltered = categoriesFiltered.filter(category => {

      // console.log(itemsFiltered)

      if (itemsFiltered.length) {
        return itemsFiltered.every(item => {
          // console.log('CATEGORY: ' + category.label)
          // console.log('ITEM TITLE: ' + item.title)
          // console.log('ITEM CATEGORY: ' + item.category)
          console.log(category.label.toLowerCase().includes(item.category.toLowerCase()))
          return category.label.toLowerCase().includes(item.category.toLowerCase())
        })
      } else {
        return false
      }
    })
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
              <h2>{props.title}</h2>
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

        {/* {itemsFiltered.map((props, idx) => (
          <p>{props.title}</p>
        ))} */}

        {itemsFiltered.length == 0 &&
          <div className={clsx('row', styles.GuidesNoMatch)}>
            <div className="col col--8">
              <p>Whoops! There is no guide matching matching your search. If you feel we're missing an essential guide, hop over to our <Link href="https://community.netdata.cloud">community forum</Link> and create a new topic with the information you're looking for.</p>
            </div>
          </div>
        }
      </div>
    </div>
  )
}
