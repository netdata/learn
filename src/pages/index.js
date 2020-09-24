import React, { useState } from 'react';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.scss';

import { StartBox } from '../components/StartBox/'
import { DiscoverBox } from '../components/agent/DiscoverBox/'

export const Index = ({children}) => (
  <div className={styles.Index}>
    {children}
  </div>
)
export const IndexBox = ({children, href, title}) => (
  <Link href={href} className={styles.IndexBox}>
    <h3>{title}</h3>
    <p>{children}</p>
  </Link>
);

const updates = [
  {
    title: <>Collect metrics from any Prometheus endpoint</>,
    href: 'docs/agent/collectors/go.d.plugin/modules/prometheus',
    date: 'August 10, 2020',
    type: 'Doc',
    description: (
      <>
        Collect from more than 600 services that support the Prometheus/OpenMetrics 
        format for exposing metrics, often with zero configuration.
      </>
    ),
  },
  {
    title: <>Video: Install Netdata on Linux in two minutes</>,
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
  }
]

function UpdateBox({title, href, date, type, description}) {
  return (
    <Link to={useBaseUrl(href)} className={clsx('col col--6', styles.updateBox)}>
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
            <div 
              className={clsx(
                'col col--6',
                styles.heroText
              )}>
              <h1 className={styles.heroTagline}>
                Learn Netdata
              </h1>
              <p className={styles.heroSubHead}>
                View documentation, guides, and videos for single-node and infrastructure monitoring 
                with Netdata. Discover new insights of your systems, containers, and applications 
                using per-second metrics, insightful visualizations, and every metric imaginable.
              </p>
            </div>
            <div className={clsx('col col--6', styles.heroImageContainer)}>
              <SVG 
                className={clsx(
                  styles.heroImage
                )} 
                src="img/index/hero.svg"
                alt="Netdata Learn: All your monitoring education in one place" 
              />
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.CTAs}>
          <div className={clsx('container')}>
            <div className={clsx('row')}>
              <div className={clsx('col col--8')}>
                <StartBox 
                  to="/docs/get"
                  title="Get Netdata"
                  description="Sign up for Netdata Cloud and install the open-source Agent on your
                  nodes. Claim and connect your nodes to Netdata Cloud for seamless, scalable, 
                  and granular infrastructure monitoring."
                  button="Download now &rarr;"
                  image={true} />
              </div>
              <div className={clsx('col col--4')}>
                <DiscoverBox 
                  href="/docs" 
                  title="Read documentation">
                  Follow quickstart guides for monitoring single nodes or infrastructure with Netdata. 
                  Learn how to collect metrics, interact with dashboards, store long-term metrics, 
                  set up health alarms &amp; notifications, and more.
                </DiscoverBox>
              </div>
            </div>
            <div className={clsx('row')}>
              <div className={clsx('col col--8')}>
                <h3>Join our community and contribute</h3>
                <p>Find us on our <Link href="https://community.netdata.cloud/">forums</Link> or <Link href="https://github.com/netdata/netdata">GitHub</Link>. If you're ready to contribute code, read our <Link to="/docs/agent/contributing/">contributing guidelines</Link> and the <Link to="/docs/agent/code_of_conduct">Contributor Covenant Code of Conduct</Link>. If documentation is more your style, read the <Link to="/docs/agent/contributing/contributing-documentation">docs guidelines</Link> and the <Link to="/docs/agent/contributing/style-guide">Netdata style guide</Link>.</p>
              </div>
            </div>
          </div>
        </section>
        <section className={clsx(styles.changelog)}>
          <div className={clsx('container')}>
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
        </section>
      </main>
    </Layout>
  );
}

export default Home;
