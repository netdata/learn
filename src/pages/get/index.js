import React, { useState } from 'react';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock'

import styles from './styles.module.scss';

function Search() {
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
      title={`Get Netdata`}
      description="Install the Netdata Agent on physical, virtual, IoT, and edge devices, Kubernetes cluster, Docker containers, Linux systems, and much more.">
      <header className={styles.getHero}>
        <div className={clsx('container', styles.getHeroContainer)}>
          <div className={clsx('row')}>
            <div className={clsx('col col--6')}>
              <h1>Get Netdata</h1>
              <p>
                Get the open-source Netdata Agent and Netdata Cloud to boot up best single-node <em>and</em> infrastructure-wide monitoring and troubleshooting platform. Netdata works with physical, virtual, IoT, and edge devices running Linux, Docker, macOS, and more.
              </p>
              <p>
                Got a cluster? Deploy Netdata on your Kubernetes (k8s) cluster for visibility into every node, pod, and service.
              </p>
            </div>
            <div className={clsx('col col--6', styles.getHeroImage)}>
              <SVG
                src="img/get/agent-cloud.svg"
                alt="Get Netdata Agent and Netdata Cloud" 
              />
            </div>
          </div>
        </div>
      </header>
      <main className={clsx('container', styles.getContainer)}>
         
          <div className={clsx('container', styles.getCodeContainer)}>
            <div className={clsx('row', styles.getOneLine)}>
              <div className={clsx('col col--8')}>
                <h2>Get Netdata on Linux with a one-liner</h2>
                <p>Or choose the appropriate OS or alternative method for your system. 👉</p> 
                <div className={styles.installSelection}>
                  <div className={styles.installCheckbox}>
                    <input 
                      onChange={handleUpdatesChange}
                      checked={updatesChecked}
                      type="checkbox" id="toggle__updates"/>
                    <label htmlFor="toggle__updates">Do you want automatic updates? <code>default: enabled</code></label>
                  </div>
                  <div className={styles.installCheckbox}>
                    <input 
                      onChange={handleReleaseChange}
                      checked={releaseChecked}
                      type="checkbox" id="toggle__type" />
                    <label htmlFor="toggle__type">Do you want nightly or stable releases? <code>default: nightly</code></label>
                  </div>
                  <div className={styles.installCheckbox}>
                    <input 
                      onChange={handleStatisticsChange}
                      checked={statsChecked}
                      type="checkbox" id="toggle__stats" />
                    <label htmlFor="toggle__stats">Do you want to contribute anonymous statistics? <code>default: enabled</code></label>
                  </div>
                  <CodeBlock className={clsx('bash', styles.installCommand)} language={lang}>{currentCommand}</CodeBlock>
                  <p>Click <strong>Copy</strong>, paste into your system’s terminal, and hit <strong>Enter</strong>.</p>
                  <p>Open your favorite browser and navigate to <code>http://localhost:19999</code> to find Netdata’s real-time dashboard with hundreds of pre-configured charts and alarms.</p>
                </div>
              </div>
            </div>
            <div className={clsx('row')}>
              <div className={clsx('col col--12', styles.installMethods)}>
                <Link
                  className={clsx(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/kickstart-64')}>
                  <img src="img/index/methods/static.png" alt="Install Netdata with a static binary" />
                  Static 64-bit binary
                </Link>
                <Link
                  className={clsx(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/packages')}>
                  <img src="img/index/methods/package.png" alt="Install Netdata with .deb/.rpm packages" />
                  .deb/.rpm packages
                </Link>
                <Link
                  className={clsx(styles.installMethod)}
                  href="https://github.com/netdata/helmchart"
                >
                  <img 
                    src="img/index/methods/kubernetes.png" 
                    alt="Install Netdata with Docker"
                  />
                  Kubernetes
                </Link>
                <Link
                  className={clsx(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/docker')}
                >
                  <SVG 
                    src="img/index/methods/docker.svg" 
                    alt="Install Netdata with Docker"
                  />
                  Docker
                </Link>
                <Link
                  className={clsx(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/macos')}
                >
                  <SVG 
                    src="img/index/methods/macos.svg" 
                    alt="Install Netdata on macOS"
                  />
                  macOS
                </Link>
                <Link
                  className={clsx(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/cloud-providers')}
                >
                  <img src="img/index/methods/cloud.png" alt="Install Netdata on cloud providers" />
                  Cloud providers
                </Link>
                <p><Link to="docs/agent/packaging/installer/">Additional operating systems &amp; methods &rarr;</Link></p>
              </div>
            </div>
          </div>
      </main>
    </Layout>
  );
}

export default Search;