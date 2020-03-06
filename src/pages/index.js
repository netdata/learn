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
  const [updatesChecked, setUpdatesChecked] = useState(true);
  const [releaseChecked, setReleaseChecked] = useState(true);
  const [statsChecked, setStatsChecked] = useState(true);

  let currentCommand = `bash <(curl -Ss https://my-netdata.io/kickstart.sh)${currentCommandUpdates}${currentCommandRelease}${currentCommandStatistics}`;
  const lang = `bash`

  function handleUpdatesChange() {
    if (currentCommandUpdates === '' && updatesChecked == true) {
      setCurrentCommandUpdates(' --no-updates');
      setUpdatesChecked(false);
    } else {
      setCurrentCommandUpdates('');
      setUpdatesChecked(true);
    }
  }

  function handleReleaseChange() {
    if (currentCommandRelease === '' && releaseChecked == true) {
      setCurrentCommandRelease(' --stable-channel');
      setReleaseChecked(false);
    } else {
      setCurrentCommandRelease('');
      setReleaseChecked(true);
    }
  }

  function handleStatisticsChange() {
    if (currentCommandStatistics === '' && statsChecked == true) {
      setCurrentCommandStatistics(' --disable-telemetry');
      setStatsChecked(false);
    } else {
      setCurrentCommandStatistics('');
      setStatsChecked(true);
    }
  }

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero', styles.heroBanner)}>
        <div className="container">
          <div className={classnames('row')}>
            <div className={classnames('col col--6')}>
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
                  Read the docs
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
              <div className={classnames('col col--8')}>
                <h2>Get Netdata on Linux with a one-liner</h2>
                <div className={styles.installSelection}>
                  <div>
                    <input 
                      onChange={handleUpdatesChange}
                      checked={updatesChecked}
                      type="checkbox" id="toggle__updates"/>
                    <label htmlFor="toggle__updates">Do you want automatic updates? <code>default: enabled</code></label>
                  </div>
                  <div>
                    <input 
                      onChange={handleReleaseChange}
                      checked={releaseChecked}
                      type="checkbox" id="toggle__type" />
                    <label htmlFor="toggle__type">Do you want nightly or stable releases? <code>default: nightly</code></label>
                  </div>
                  <div>
                    <input 
                      onChange={handleStatisticsChange}
                      checked={statsChecked}
                      type="checkbox" id="toggle__stats" />
                    <label htmlFor="toggle__stats">Do you you want to contribute anonymous statistics? <code>default: enabled</code></label>
                  </div>
                  <CodeBlock className={classnames('bash', styles.installCommand)} language={lang}>{currentCommand}</CodeBlock>
                  <p>Click <strong>Copy</strong>, paste into your system’s terminal, and hit <strong>Enter</strong>.</p>
                  <p>Open your favorite browser and navigate to <code>http://localhost:19999</code> to find Netdata’s real-time dashboard with hundreds of pre-configured charts and alarms.</p>
                </div>
              </div>
              <div className={classnames('col col--4', styles.installMethods)}>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/packages')}>
                  <img src="img/methods/packages.png" alt="Install Netdata with .deb/.rpm packages" />
                  .deb/.rpm packages
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/docker')}>
                  <img src="img/methods/docker.png" alt="Install Netdata with Docker" />
                  Docker
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/macos')}>
                    <img src="img/methods/macos.png" alt="Install Netdata on macOS" />
                  macOS
                </Link>
                <a 
                  className={classnames(styles.installMethod)}
                  href="https://github.com/netdata/helmchart#netdata-helm-chart-for-kubernetes-deployments"
                >
                  <img src="img/methods/kubernetes.png" alt="Install Netdata on Kubernetes" />
                  Kubernetes
                </a>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/cloud-providers')}>
                  <img src="img/methods/cloud.png" alt="Install Netdata on cloud providers" />
                  Cloud providers
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/packaging/installer/methods/freebsd')}>
                    <img src="img/methods/freebsd.png" alt="Install Netdata on FreeBSD" />
                  FreeBSD
                </Link>
                <p><Link to="docs/packaging/installer/">Additional operating systems &amp; methods &rarr;</Link></p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
