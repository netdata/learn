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

  function OneLine() {
    return (
      <div className={styles.getOneLine}>
        <div className={styles.getOneLineContainer}>
          <CodeBlock className={clsx('bash', styles.getOneLineCommand)} language={lang}>{currentCommand}</CodeBlock>
          
          <div className={styles.installCheckboxes}>
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
          </div>
        </div>
        <p>Click <strong>Copy</strong>, paste into your system’s terminal, and hit <strong>Enter</strong>.</p>
        <p>Open your favorite browser and navigate to <code>http://localhost:19999</code> to find Netdata’s real-time dashboard with hundreds of pre-configured charts and alarms.</p>
      </div>
    )
  }

  return (
    <Layout
      title={`Get Netdata`}
      description="Install the Netdata Agent on physical, virtual, IoT, and edge devices, Kubernetes cluster, Docker containers, Linux systems, and much more.">
      <header className={styles.getHero}>
        <div className={clsx('container')}>
          <div className={clsx('row', styles.getHeroRow)}>
            <div className={clsx('col col--4')}>
              <h1>Get Netdata</h1>
              <p>Use our one-line kickstart script to automatically install Netdata, plus all required dependencies, on most Linux systems. It take a single command, a few minutes of your time, and zero configuration to get a Netdata dashboard with thousands of metrics on an interactive dashboard.</p>
              <p><em>Not a Linux user?</em> Look <a href="#methods">below</a> for instructions for Docker, Kubernetes, macOS, and much more.</p>
            </div>
            <div className={clsx('col col--8')}>
              <OneLine />
            </div>
          </div>
        </div>
      </header>
      <main>

        <div className={clsx('container')}>
          <div className={clsx('row')}>
            <div className={clsx('col col--8 col--offset-2', styles.getNext)}>
              <h2>After downloading, follow these steps:</h2>
              <p>These optional steps connect your nodes to Netdata Cloud for full visibility across your entire infrastructure.</p>
            </div>
          </div>
          <div className={clsx('row')}>
            <div className={clsx('col col--4', styles.getNextStep)}>
              <h3>1. Create a free account</h3>
              <p>Just sign up with your email address or existing GitHub or Google account.</p>
              <Link className={clsx('button button--lg')} href="https://app.netdata.cloud">Sign in now</Link>
            </div>
            <div className={clsx('col col--4', styles.getNextStep)}>
              <h3>2. Add your nodes</h3>
              <p>It’s easy to claim existing Netdata Agent-monitored nodes for your Cloud account.</p>
              <Link className={clsx('button button--lg button--secondary')} to="docs/cloud/get-started#claim-a-node">Read the guide</Link>
            </div>
            <div className={clsx('col col--4', styles.getNextStep)}>
              <h3>3. Monitor and troubleshoot</h3>
              <p>Invite your team and start working in your Spaces and War Rooms.</p>
              <Link className={clsx('button button--lg button--secondary')} to="docs/cloud">Read about features</Link>
            </div>
          </div>
          <div className={clsx('row')}>
            <div className={clsx('col col--8 col--offset-2', styles.getNextFaq)}>
              <p>Questions about Netdata Cloud? <Link to="docs/cloud/faq-glossary">Read our FAQ</Link> for all the details.</p>
            </div>
          </div>
        </div>

        <div id="methods" className={clsx('container')}>
          <div className={clsx('row')}>
            <div className={clsx('col col--8 col--offset-2', styles.getMethods)}>
              <h2>Other OS and installation methods</h2>
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