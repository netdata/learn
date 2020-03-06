import React, { useState } from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

import CodeBlock from '@theme/CodeBlock'

const contents = [
  {
    title: <>Docs</>,
    href: 'docs/',
    description: (
      <>
        Configure metrics retention, build streaming connections, collect metrics 
        from custom apps, create custom dashboards, and much more.
      </>
    ),
  },
  {
    title: <>Tutorials</>,
    href: 'tutorials/',
    description: (
      <>
        From beginner to expert sysadmin, our step-by-step tutorials give you the 
        right foundational skills to monitor the health and performance of your 
        systems and applications.
      </>
    ),
  },
  {
    title: <>Blog</>,
    href: 'blog/',
    description: (
      <>
        Read about releases, new features, and our vision for bringing real-time 
        monitoring to every headless system in the world.
      </>
    ),
  },
];

function Feature({imageUrl, title, href, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <a href={href} className={classnames('col col--4', styles.feature)}>
      <h3>{title}</h3>
      <p>{description}</p>
    </a>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;

  const [currentCommandUpdates, setCurrentCommandUpdates] = useState('');
  const [currentCommandRelease, setCurrentCommandRelease] = useState('');
  const [currentCommandStatistics, setCurrentCommandStatistics] = useState('');
  const [currentCommandChecked, setCurrentCommandChecked] = useState(true);

  let currentCommand = `bash <(curl -Ss https://my-netdata.io/kickstart.sh)${currentCommandUpdates}${currentCommandRelease}${currentCommandStatistics}`;
  const lang = `bash`

  function handleUpdatesChange() {
    if (currentCommandUpdates === '') {
      setCurrentCommandUpdates(' --no-updates');
    } else {
      setCurrentCommandUpdates('');
    }
  }

  function handleReleaseChange() {
    if (currentCommandRelease === '') {
      setCurrentCommandRelease(' --stable-channel');
    } else {
      setCurrentCommandRelease('');
    }
  }

  function handleStatisticsChange() {
    if (currentCommandStatistics === '' && currentCommandChecked == true) {
      setCurrentCommandStatistics(' --disable-telemetry');
      setCurrentCommandChecked(false);
    } else {
      setCurrentCommandStatistics('');
      setCurrentCommandChecked(true);
    }
  }

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero', styles.heroBanner)}>
        <div className="container">
          <div class="row">
            <div class="col col--6">
              <h1 className="hero__title">All your monitoring education in one place.</h1>
              <p className="hero__subtitle">Learn alongside thousands of others who want to discover deeper insights about their systems and applications with Netdata's real-time health monitoring and performance troubleshooting toolkit.</p>
              <div className={styles.buttons}>
                <Link
                  className={classnames(
                    'button button--lg',
                    styles.getStarted,
                  )}
                  to={useBaseUrl('#installation')}>
                  Get Netdata
                </Link>
                <Link
                  className={classnames(
                    'button button--secondary button--lg',
                    styles.getStarted,
                  )}
                  to={useBaseUrl('docs/introduction')}>
                  Read documentation
                </Link>
              </div>
            </div>
            <div className={classnames('col col--6', styles.heroImageContainer)}>
              <img className={classnames(styles.heroImage)} src="img/everyone.png" alt="" />
            </div>
          </div>
        </div>
      </header>
      <main>
        <section id="installation" className={styles.install}>
          <div className="container">
            <div className="row">
              <div class="col col--8">
                <h2>Get Netdata on Linux with a one-liner</h2>
                <p>Click <strong>Copy</strong>, paste into your system’s terminal, and hit <strong>Enter</strong>. Open your favorite browser and navigate to <code>http://localhost:19999</code> to find Netdata’s dashboard.</p>
                <div className={styles.installSelection}>
                  <div class="installation__method">
                    <label for="toggle" class="switch">Automatic updates</label>
                    <input 
                      onChange={handleUpdatesChange}
                      type="checkbox" id="toggle" class="checkbox" />
                  </div>
                  <div class="installation__method">
                    <label for="toggle" class="switch">Release type</label>
                    <input 
                      onChange={handleReleaseChange}
                      type="checkbox" id="toggle" class="checkbox" />
                  </div>
                  <div class="installation__method">
                    <label for="toggle" class="switch">Anonymous statistics</label>
                    <input 
                      onChange={handleStatisticsChange}
                      checked={currentCommandChecked}
                      type="checkbox" id="toggle" class="checkbox" />
                  </div>
                  <CodeBlock className={classnames('bash', styles.installCommand)} language={lang}>{currentCommand}</CodeBlock>
                </div>
              </div>
              <div className={classnames('col col--4', styles.installMethods)}>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/packages')}>
                  <img src="img/methods/packages.png" alt="" />
                  .deb/.rpm packages
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/docker')}>
                  Docker
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/macos')}>
                  macOS
                </Link>
                <a 
                  className={classnames(styles.installMethod)}
                  href="https://github.com/netdata/helmchart#netdata-helm-chart-for-kubernetes-deployments"
                >
                  Kubernetes
                </a>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/cloud-providers')}>
                  Cloud providers
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/freebsd')}>
                  FreeBSD
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
