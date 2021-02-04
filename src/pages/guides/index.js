import React from 'react';
import clsx from 'clsx';

import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

import styles from './styles.module.scss';

import { Guides } from '../../components/Guides/'

function Home() {  
  return ( 
    <>
      <Head>
        <meta property="og:type" content="website" />
      </Head>
      <Layout
        title={`Netdata management and configuration cheatsheet`}
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
    </>
  );
}

export default Home;
