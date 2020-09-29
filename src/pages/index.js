import React from 'react';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import Layout from '@theme/Layout';
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
    title: <>Collect metrics from any Prometheus endpoint</>,
    href: 'https://www.youtube.com/watch?v=UAzVvhMab8g',
    date: 'September 22, 2020',
    type: 'Video',
    description: (
      <>
        See the process of claiming a node to Netdata Cloud in action. The video, and claiming itself, takes only 90 seconds of your time.
      </>
    ),
  },
  {
    title: <>Send notifications to StackPulse</>,
    href: '/docs/agent/health/notifications/stackpulse',
    date: 'September 22, 2020',
    type: 'Doc',
    description: (
      <>
        Send Netdata notifications to StackPulse to create smart automated response workflows (StackPulse playbooks) that will help you drive down your MTTD and MTTR.
      </>
    ),
  },
  {
    title: <>Monitor Pi-hole (and a Raspberry Pi) with Netdata</>,
    href: '/guides/monitor/pi-hole-raspberry-pi',
    date: 'September 15, 2020',
    type: 'Guide',
    description: (
      <>
        Collect 1,500 metrics every second from a working Pi-hole installation and a Raspberry Pi after just a few minutes of setup and zero configuration.
      </>
    ),
  },
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
      {/* Redirect to `/docs/get` if someone arrives at `learn.netdata.cloud/#get` from www or another source. */}
      <BrowserOnly>
        {() => {
          if (window.location.hash === "#get") {
            return <Redirect to='/docs/get' />
          }
        }}
      </BrowserOnly>
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
