import React from 'react';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { Redirect } from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';
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
  },
  {
    title: <>Kubernetes monitoring with Netdata: Overview and visualizations</>,
    href: '/guides/monitor/kubernetes-k8s-netdata',
    date: 'March 4, 2021',
    type: 'Guide',
    description: (
      <>
        Learn how to navigate Netdata's Kubernetes monitoring features for visualizing the health and performance of a Kubernetes cluster with per-second granulrity.
      </>
    ),
  }
]

function UpdateBox({title, href, date, type, description}) {
  return (
    <div className={clsx('row')}>
      <div className={clsx('col col--3', styles.updateMeta)}>
        <time>{date}</time>
        <span>{type}</span>
      </div>
      <Link to={useBaseUrl(href)} className={clsx('col col--6', styles.updateBox)}>
        <h3>{title}</h3>
        <p>{description}</p>
      </Link>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  
  return ( 
    <>
      <Head>
        <meta property="og:type" content="website" />
      </Head>
      {/* Redirect to `/docs/get` if someone arrives at `learn.netdata.cloud/#get`/`learn.netdata.cloud/#installation` from www or another source. */}
      <BrowserOnly>
        {() => {
          if (window.location.hash === "#get" || window.location.hash === "#installation") {
            return <Redirect to='/docs/get' />
          }
        }}
      </BrowserOnly>
      <Layout
        description="The home for learning about Netdata's health monitoring and performance troubleshooting toolkit. Comprehensive documentation and thoughtful guides."
        >
        <header className={clsx(styles.hero)}>
          <div className={clsx('container')}>
            <div className={clsx('row')}>
              <div 
                className={clsx(
                  'col col--6',
                  styles.heroText
                )}>
                <h1 className={styles.heroTagline}>
                  Learning @ Netdata
                </h1>
                <p className={styles.heroSubHead}>
                  Here you'll find documentation, guides, and reference material for monitoring and 
                  troubleshooting your systems with Netdata. Discover new insights of your systems, 
                  containers, and applications using per-second metrics, insightful visualizations, 
                  and every metric imaginable.
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
          <section className={styles.Get}>
            <div className={clsx('container')}>
              <div className={clsx('row')}>
                <div className={clsx('col col--4')}>
                  <StartBox 
                    to="/docs/get-started/"
                    title="Get started"
                    description="Install the open-source monitoring agent on physical/virtual systems running most Linux distributions (Ubuntu, Debian, CentOS, and more), container platforms (Kubernetes clusters, Docker), and many other operating systems, with no <code>sudo</code> required."
                    cta="Install now"
                    image={true} />
                </div>
                <div className={clsx('col col--4')}>
                  <StartBox 
                    to="/docs/"
                    title="Docs"
                    description="Solution- and action-based docs for Netdata's many features and capabilities. Your table of contents to becoming an expert in using Netdata to monitor and troubleshoot applications and their infrastructure."
                    cta="Read the docs"
                    image={false} />
                </div>
                <div className={clsx('col col--4')}>
                  <StartBox 
                    to="/guides/"
                    title="Guides"
                    description="Thoughtful guides to walk you through collecting the right metrics, monitoring your infrastructure, troubleshooting with Netdata's powerful visualizations, and much more."
                    cta="Start learning"
                    image={false} />
                </div>
              </div>
            </div>
          </section>
          <section className={styles.CTAs}>
            <div className={clsx('container')}>
              <div className={clsx('row')}>
                <div className={clsx('col col--12')}>
                  <h2>Looking to jump in to monitoring, or follow step-by-step instructions?</h2>
                </div>
              </div>
              <div className={clsx('row')}>
                <div className={clsx('col col--4')}>
                  <DiscoverBox 
                    href="/docs/overview/what-is-netdata" 
                    title="What is Netdata?"
                    cta="Learn the basics">
                    Run through Netdata's components, capabilities, and features. Understand how and why it's different from other monitoring solutions.
                  </DiscoverBox>
                </div>
                <div className={clsx('col col--4')}>
                  <DiscoverBox 
                    href="/docs/quickstart/single-node" 
                    title="Quickstart: Single-node monitoring"
                    cta="Get started">
                    Quick installation and immediate results to quickly monitor physical systems or virtual servers.
                  </DiscoverBox>
                </div>
                <div className={clsx('col col--4')}>
                  <DiscoverBox 
                    href="/docs/quickstart/infrastructure" 
                    title="Quickstart: Infrastructure monitoring"
                    cta="Get started">
                    Granular and zero-configuration monitoring for systems, containers, and applications at scale.
                  </DiscoverBox>
                </div>
              </div>
              <div className={clsx('row', styles.ctaRow)}>
                <div className={clsx('col col--8')}>
                  <h2>Reference documentation</h2>
                </div>
              </div>
              <div className={clsx('row')}>
                <div className={clsx('col col--4')}>
                  <DiscoverBox 
                    href="/docs/agent" 
                    title="Agent reference"
                    cta="View docs">
                    Documentation for each component, feature, and API available in the open-source Netdata Agent.
                  </DiscoverBox>
                </div>
                <div className={clsx('col col--4')}>
                  <DiscoverBox 
                    href="/docs/cloud" 
                    title="Cloud reference"
                    cta="View docs">
                    Documentation for the features, organization, and and management capabilities in Netdata Cloud.
                  </DiscoverBox>
                </div>
              </div>
              <div className={clsx('row', styles.ctaRow)}>
                <div className={clsx('col col--8')}>
                  <h2>Join our community and contribute</h2>
                  <p>Find us on our <Link href="https://community.netdata.cloud/">forums</Link> or <Link href="https://github.com/netdata/netdata">GitHub</Link>. If you're ready to contribute code, read our <Link to="/contribute/">contributing guidelines</Link> and the <Link to="/contribute/code-of-conduct">Contributor Covenant Code of Conduct</Link>. If documentation is more your style, read the <Link to="/contribute/documentation">docs guidelines</Link> and the <Link to="/contribute/style-guide">Netdata style guide</Link>.</p>
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
              {updates.map((props, idx) => (
                <UpdateBox key={idx} {...props} />
              ))}
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
}

export default Home;
