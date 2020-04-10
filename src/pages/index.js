import React, { useState } from 'react';
import classnames from 'classnames';
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
      title={`All your monitoring education in one place. ${siteConfig.title}`}
      description="Learn alongside thousands of others who want to discover deeper insights about their systems and applications with Netdata's real-time health monitoring and performance troubleshooting toolkit.">
      <header className={classnames(styles.hero)}>
        <div className={classnames('container')}>
          <div className={classnames('row')}>
            <div 
              className={classnames(
                'col col--6',
                styles.heroText
              )}>
              <span>Learn @ Netdata</span>
              <h1 className={styles.heroTagline}>
                All your monitoring education in one place.
              </h1>
              <p className={styles.heroSubHead}>
                Learn alongside thousands of others who want to discover deeper insights about 
                their systems and applications with Netdata's real-time health monitoring and 
                performance troubleshooting toolkit.
              </p>
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
                  to={useBaseUrl('docs/agent')}>
                  Read the docs
                </Link>
              </div>
            </div>
            <div className={classnames('col col--6', styles.heroImageContainer)}>
              <img 
                className={classnames(
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
        <section id="installation" className={styles.install}>
          <div className={classnames('container shadow--lw', styles.installContainer)}>
            <div className={classnames('row')}>
              <div className={classnames('col col--8')}>
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
                  <CodeBlock className={classnames('bash', styles.installCommand)} language={lang}>{currentCommand}</CodeBlock>
                  <p>Click <strong>Copy</strong>, paste into your system’s terminal, and hit <strong>Enter</strong>.</p>
                  <p>Open your favorite browser and navigate to <code>http://localhost:19999</code> to find Netdata’s real-time dashboard with hundreds of pre-configured charts and alarms.</p>
                </div>
              </div>
              <div className={classnames('col col--4', styles.installMethods)}>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/packages')}>
                  <img src="img/methods/package.png" alt="Install Netdata with .deb/.rpm packages" />
                  .deb/.rpm packages
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/docker')}>
                  <img src="img/methods/docker.png" alt="Install Netdata with Docker" />
                  Docker
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/macos')}>
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
                  to={useBaseUrl('docs/agent/packaging/installer/methods/cloud-providers')}>
                  <img src="img/methods/cloud.png" alt="Install Netdata on cloud providers" />
                  Cloud providers
                </Link>
                <Link
                  className={classnames(styles.installMethod)}
                  to={useBaseUrl('docs/agent/packaging/installer/methods/freebsd')}>
                  <img src="img/methods/freebsd.png" alt="Install Netdata on FreeBSD" />
                  FreeBSD
                </Link>
                <p><Link to="docs/agent/packaging/installer/">Additional operating systems &amp; methods &rarr;</Link></p>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.stepByStep}>
          <div className={classnames('container')}>
            <div className={classnames('row')}>
              <div className={classnames('col col--12')}>
                <h2>Learn Netdata step-by-step</h2>
              </div>
              <div className={classnames('col col--4')}>
                <p>Take a guided tour through Netdata's core features, including its famous dashboard, creating new alarms, and collecting metrics from your favorite services and applications.</p>
                <p>Ten easy-to-parse parts designed for beginners&mdash;perfect first experience for those who want to get started with monitoring and troubleshooting.</p>
                <p>
                  <Link
                    to={useBaseUrl('docs/agent/step-by-step/step-00')}
                    className={classnames('button button--lg')}
                  >
                    Try the guide
                  </Link>
                </p>
              </div>
              <div className={classnames('col col--4', styles.stepByStepLinks)}>
                <StepByStepLink
                  href="docs/agent/step-by-step/step-01"
                  icon={<FiBox />}
                  title="Netdata's building blocks"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-02"
                  icon={<FiHome />}
                  title="Get to know Netdata's dashboard"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-03"
                  icon={<FiServer />}
                  title="Monitor more than one system with Netdata"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-04"
                  icon={<FiSliders />}
                  title="The basics of configuring Netdata"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-05"
                  icon={<FiActivity />}
                  title="Health monitoring alarms and notifications"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-06"
                  icon={<FiCpu />}
                  title="Collect metrics from more services and apps"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-07"
                  icon={<FiMonitor />}
                  title="Netdata’s dashboard in depth"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-08"
                  icon={<FiGrid />}
                  title="Building your first custom dashboard"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-09"
                  icon={<FiHardDrive />}
                  title="Long-term metrics storage"
                />
                <StepByStepLink
                  href="docs/agent/step-by-step/step-10"
                  icon={<FiLock />}
                  title="Set up a proxy"
                />
              </div>
              <div 
                className={classnames(
                  'col col--4',
                  styles.stepByStepImg
                )}>
                <img src="img/index/step-by-step.svg" alt="Learn Netdata step-by-step" />
              </div>
            </div>
          </div>
        </section>
        <section className={styles.docs}>
          <div className={classnames('container')}>
            <div className={classnames('row')}>
              {docs.map((props, idx) => (
                <DocBox key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
