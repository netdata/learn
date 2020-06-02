import React, { useState } from 'react';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import styles from './styles.module.scss';

import CodeBlock from '@theme/CodeBlock'
import { FiBox, FiServer, FiSliders, FiActivity, FiCpu, FiHome, FiMonitor, FiGrid, FiHardDrive, FiLock } from "react-icons/fi";

const docs = [
  {
    title: <>Getting started guide</>,
    href: 'docs/agent/getting-started',
    description: (
      <>
        Configure metrics retention, build streaming connections, collect metrics 
        from custom apps, create custom dashboards, and much more.
      </>
    ),
  },
  {
    title: <>Configuration</>,
    href: 'docs/agent/configuration-guide',
    description: (
      <>
        Use Netdata’s expansive customization possibilities to suit any service, any system, and any infrastructure.
      </>
    ),
  },
  {
    title: <>Collect metrics</>,
    href: 'docs/agent/collectors',
    description: (
      <>
        Add more charts to Netdata via its intelligent auto-detection of popular web servers, databases, mail servers, security apps, and dozens more.
      </>
    ),
  },
  {
    title: <>Health monitoring</>,
    href: 'docs/agent/health',
    description: (
      <>
        Tune existing alarms or create new ones, and enable any number of notification systems based on roles and severity.
      </>
    ),
  },
  {
    title: <>Netdata Cloud</>,
    href: 'docs/cloud',
    description: (
      <>
        Learn how to view real-time, distributed health monitoring and performance troubleshooting data for all your systems in one place.
      </>
    ),
  },
  {
    title: <>Custom dashboards</>,
    href: 'docs/agent/web/gui/custom',
    description: (
      <>
        Build bespoke dashboards with simple HTML and JavaScript to put all of your most important metrics in one easy-to-understand place.
      </>
    ),
  },
];

function DocBox({title, href, description}) {
  return (
    <Link to={useBaseUrl(href)} className={classnames('col col--4', styles.docBox)}>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}

function StepByStepLink({icon, title, href}) {
  return (
    <Link 
      className={styles.stepByStepLink}
      to={useBaseUrl(href)}>
      <div className={styles.stepByStepIcon}>{icon}</div>
      {title}
    </Link>
  )
}

function Guides() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;

  return (
    <Layout
      title={`Guides`}
      description="Guides">
      <main>
        <section className={styles.docs}>
          <div className={classnames('container')}>
            <div className={classnames('row')}>
              <div className={classnames('col col--12')}>
                <h1>Guides</h1>
                <p>These are guides, okay?</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Guides;
