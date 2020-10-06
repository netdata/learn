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

import { Guides } from '../../components/Guides/'

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
    <Layout
      title={`Netdata Guides`}
      description="Thoughtful guides to help you learn more about collecting metrics, monitoring your infrastructure, and troubleshooting with Netdata's powerful visualizations.">
      <header className={clsx(styles.hero, styles.GuidesHero)}>
        <div className={clsx('container')}>
          <div className={clsx('row')}>
            <div 
              className={clsx(
                'col',
                styles.heroText
              )}>
              <h1 className={styles.heroTagline}>
                Netdata Guides
              </h1>
              <p className={styles.heroSubHead}>
                Thoughtful guides to help you learn more about collecting metrics, monitoring your infrastructure, and troubleshooting with Netdata's powerful visualizations.
              </p>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Guides />
      </main>
    </Layout>
  );
}

export default Home;
