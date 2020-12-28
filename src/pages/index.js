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
    title: <>Centralized alarm notifications</>,
    href: '/docs/cloud/monitoring/notifications',
    date: 'December 18, 2020',
    type: 'Doc',
    description: (
      <>
        Netdata Cloud can send centralized alarm notifications to your team whenever a node enters a warning, critical, or unreachable state.
      </>
    ),
  },
  {
    title: <>New collector: Couchbase</>,
    href: '/docs/agent/collectors/go.d.plugin/modules/couchbase',
    date: 'December 18, 2020',
    type: 'Collector',
    description: (
      <>
        Collect per-second metrics from any number of Couchbase instances, including operations, disk/data/memory used per bucket, and disk fetches.
      </>
    ),
  },
  {
    title: <>Interact with dashboards and charts</>,
    href: '/docs/visualize/interact-dashboards-charts#choose-timeframes-to-visualize',
    date: 'December 15, 2020',
    type: 'Doc',
    description: (
      <>
        Both our local Agent and Netdata Cloud dashboards are now even easier to use thanks to parallel time &amp; date pickers that help you drill down and discover root causes.
      </>
    ),
  },
  {
    title: <>Monitor any process in real-time with Netdata</>,
    href: '/guides/monitor/process',
    date: 'December 8, 2020',
    type: 'Guide',
    description: (
      <>
        Tap into Netdata's powerful collectors, with per-second utilization metrics for every process, to troubleshoot faster and make data-informed decisions.
      </>
    ),
  },
  {
    title: <>New collector: Anomalies</>,
    href: '/docs/agent/collectors/python.d.plugin/anomalies',
    date: 'December 2, 2020',
    type: 'Collector',
    description: (
      <>
        This collector uses the Python PyOD library to perform unsupervised anomaly detection on your Netdata charts and/or dimensions.
      </>
    ),
  },
  {
    title: <>How to optimize the Netdata Agent's performance</>,
    href: '/guides/configure/performance',
    date: 'November 30, 2020',
    type: 'Guide',
    description: (
      <>
        While the Netdata Agent is designed to monitor a system with only 1% CPU, you can optimize its performance for low-resource systems.
      </>
    ),
  },
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
          <section className={styles.Get}>
            <div className={clsx('container')}>
              <div className={clsx('row')}>
                <div className={clsx('col col--8')}>
                  <StartBox 
                    to="/docs/get"
                    title="Get Netdata"
                    description="Sign up for Netdata Cloud and install the open-source Agent on your
                    nodes. Claim and connect your nodes to Netdata Cloud for seamless, scalable, 
                    and granular infrastructure monitoring."
                    cta="Show me how"
                    image={true} />
                </div>
              </div>
            </div>
          </section>
          <section className={styles.CTAs}>
            <div className={clsx('container')}>
              <div className={clsx('row')}>
                <div className={clsx('col col--8')}>
                  <h2>New to Netdata?</h2>
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
                  <h2>Looking for guided content or reference documentation?</h2>
                </div>
              </div>
              <div className={clsx('row')}>
                <div className={clsx('col col--4')}>
                  <DiscoverBox 
                    href="/guides" 
                    title="Guides"
                    cta="Read guides">
                    Follow along to monitor specific applications, deploy Netdata across infrastructure, and more.
                  </DiscoverBox>
                </div>
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
