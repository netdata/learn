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
      description="Learn alongside thousands of others who want to discover deeper insights about their systems and applications with Netdata's real-time health monitoring and performance troubleshooting toolkit.">
      <header className={clsx(styles.hero, styles.GuidesHero)}>
        <div className={clsx('container')}>
          <div className={clsx('row')}>
            <div 
              className={clsx(
                'col col--6',
                styles.heroText
              )}>
              <h1 className={styles.heroTagline}>
                Netdata Guides
              </h1>
              <p className={styles.heroSubHead}>
                Thoughtful guides from the Netdata team.
              </p>
            </div>
            <div className={clsx('col col--6', styles.heroImageContainer)}>
              {/* <SVG 
                className={clsx(
                  styles.heroImage
                )} 
                src="img/index/hero.svg"
                alt="Netdata Learn: All your monitoring education in one place" 
              /> */}
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
