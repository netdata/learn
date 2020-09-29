import React, { useState } from 'react';
import clsx from 'clsx';

import styles from './styles.module.scss'; 

const GuideItems = [
   {
    title: 'Monitor, troubleshoot, and debug applications with eBPF metrics',
    href: 'guides/troubleshoot/monitor-debug-applications-ebpf',
    category: 'collect-monitor',
    description: "Using this guide, you'll learn the fundamentals of setting up Netdata to give you kernel-level metrics from your application so that you can monitor, troubleshoot, and debug to your heart's content."
  },
  {
    title: "Monitor Pi-hole (and a Raspberry Pi) with Netdata",
    href: 'guides/monitor/pi-hole-raspberry-pi',
    category: 'collect-monitor',
    description: "Netdata helps you monitor and troubleshoot all kinds of devices and the applications they run, including IoT devices like the Raspberry Pi and applications like Pi-hole."
  },
  {
    title: "Use host labels to organize systems, metrics, and alarms",
    href: 'guides/using-host-labels',
    category: 'configure',
    description: "Let's take a peek into how to create host labels and apply them across a few of Netdata's features to give you more organization power over your infrastructure."
  },
  {
    title: "Export and visualize Netdata metrics in Graphite",
    href: 'guides/export/export-netdata-metrics-graphite',
    category: 'export',
    description: "In this guide, we'll show you how to export Netdata metrics to Graphite for long-term storage and further analysis."
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

  const [searchTerm, setSearchTerm] = useState(null);

  if (searchTerm) {
    itemsFiltered = itemsFiltered.filter(item => {
      let searchTerms = searchTerm.split(" ");
      let content = `${item.title.toLowerCase()} ${item.description.toLowerCase()}`;
      return searchTerms.every(term => {
        return content.includes(term.toLowerCase())
      })
    });
  }

  return (
    <div className={styles.Guides}>
      <input
        className={clsx(styles.guideSearch)}
        type="text"
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        placeholder="🔍 Search..." />
      <div className={styles.searchResults}>
        <p>Showing results for: {searchTerm}</p>
      </div>
      <div className={clsx('container')}>
        {GuideCategories.map((props, idx) => (
          <>
            <div key={idx} className={clsx('row')}>
              <h3>{props.title}</h3>
            </div>
            <div className={clsx('row')}>
              {itemsFiltered.filter(item => item.category.includes(props.label)).map(categorizedItem => (
                <p>{categorizedItem.title}</p>
              ))}
            </div>
          </>
        ))}

        {/* {itemsFiltered.map((props, idx) => (
          <p>{props.title}</p>
        ))} */}

        {itemsFiltered.length == 0 &&
          <div className="col">
            <p>Whoops! There is no guide matching matching your search. If you feel we're missing an essential guide, please <a href="">file an issue on GitHub</a> the information you're looking for.</p>
          </div>
        }
      </div>
    </div>
  )
}
