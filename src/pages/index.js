import React from 'react';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.scss';

const updates = [
  {
    title: <>YouTube video: Install Netdata on Linux in two minutes</>,
    href: 'https://www.youtube.com/watch?v=tVIp7ycK60A',
    date: 'July 8, 2020',
    type: 'Video',
    description: (
      <>
        Watch the entire process of using our one-line kickstart script, which
        installs Netdata on most Linux systems in about two minutes.
      </>
    ),
  },
  {
    title: <>Monitor a Kubernetes (k8s) cluster with Netdata</>,
    href: 'guides/monitor/kubernetes-k8s-netdata',
    date: 'July 6, 2020',
    type: 'Guide',
    description: (
      <>
        Use Netdata&#x27;s Helm chart, service discovery plugin, and Kubelet/kube-proxy 
        collectors for real-time visibility into your Kubernetes cluster.
      </>
    ),
  },
  {
    title: <>Install Netdata on a Kubernetes cluster</>,
    href: 'docs/agent/packaging/installer/methods/kubernetes',
    date: 'July 3, 2020',
    type: 'Doc',
    description: (
      <>
        Use Netdata&#x27;s Helm chart to bootstrap a Netdata monitoring and 
        troubleshooting toolkit on your Kubernetes (k8s) cluster.
      </>
    ),
  },
  {
    title: <>Monitor, troubleshoot, and debug applications with eBPF metrics</>,
    href: 'guides/troubleshoot/monitor-debug-applications-ebpf',
    date: 'July 1, 2020',
    type: 'Guide',
    description: (
      <>
        Use Netdata's built-in eBPF metrics collector to monitor, troubleshoot, 
        and debug your custom application using low-level kernel feedback.
      </>
    ),
  },
]

function UpdateBox({title, href, date, type, description}) {
  return (
    <Link to={useBaseUrl(href)} className={clsx('col col--3', styles.updateBox)}>
      <header>{date} <span>{type}</span></header>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;

  return (
    <Layout
      title={`All your monitoring education in one place. ${siteConfig.title}`}
      description="Learn alongside thousands of others who want to discover deeper insights about their systems and applications with Netdata's real-time health monitoring and performance troubleshooting toolkit.">
      <header className={clsx(styles.hero)}>
        <div className={clsx('container')}>
          <div className={clsx('row')}>
            <div className={clsx('col col--6', styles.heroText)}>
              <h1 className={styles.heroTagline}>
                Learn @ Netdata
              </h1>
              <p className={styles.heroSubHead}>
                Learn how to monitor and troubleshoot the health and performance of your infrastructure.
                Build, deploy, and resolve with real-time metrics, insightful dashboards, and every metric imaginable.
              </p>
            </div>
          </div>
          <div className={styles.cta}>
            <Link className={styles.ctaBox} to={useBaseUrl('get')}>
              <h3>Get the Netdata toolkit</h3>
              <p>One-line installation for most Linux systems, plus details for Docker, Kubernetes, macOS, and much more. Connect to Cloud for multi-node visibility.</p>
              <button 
                className={clsx('button button--lg')}>
                Get started
              </button>
            </Link>
            <div className={styles.ctaBox}>
              <h3>Read documentation</h3>
              <p>Extensive details on collecting, storing, visualizing, and exporting metrics, then viewing all your nodes on a single pane of glass with Cloud.</p>
              <Link to={useBaseUrl('docs/agent')} className={clsx('button button--lg button--secondary')}>
                Agent
              </Link>
              <Link to={useBaseUrl('docs/cloud')} className={clsx('button button--lg button--secondary')}>
                Cloud
              </Link>
            </div>
            <div 
              className={styles.ctaBox}>
              <h3>Read guides</h3>
              <p>Focused, user-friendly content designed to help you better understand Netdata's metrics, integrate with more services, and troubleshoot smarter.</p>
              <Link to={useBaseUrl('guides')} className={clsx('button button--lg button--secondary')}>
                Start learning
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className={clsx('container', styles.changelog)}>
          <div className={clsx('row')}>
            <div className={clsx('col col--6')}>
              <h2>Recent updates and new content</h2>
            </div>
          </div>
          <div className={clsx('row')}>
            {updates.map((props, idx) => (
              <UpdateBox key={idx} {...props} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Home;
