import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

import CodeBlock from '@theme/CodeBlock'

const install = `bash <(curl -Ss https://my-netdata.io/kickstart.sh)`
const lang = `bash`

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
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">All your monitoring education in one place.</h1>
          <p className="hero__subtitle">Learn alongside thousands of others who want to know more about their systems and applications with powerful health monitoring and performance troubleshooting.</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/packaging/installer')}>
              Install Netdata
            </Link>
            <Link
              className={classnames(
                'button button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Read documentation
            </Link>
            <Link
              className={classnames(
                'button button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/')}>
              Learn Netdata step-by-step
            </Link>
          </div>
        </div>
      </header>
      <main>
        {/* {contents && contents.length && (
          <section className={styles.contents}>
            <div className="container">
              <div className="row">
                {contents.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )} */}
        <section className={styles.install}>
          <div className="container">
            <div className="row">
              <div class="col col--9">
                <h2>Install Netdata on with a one-liner</h2>
                <p>Click <strong>Copy</strong>, paste into your system’s terminal, and hit <strong>Enter</strong>. Open your favorite browser and navigate to <code>http://localhost:19999</code> to find Netdata’s dashboard.</p>
                <CodeBlock className="home-prism" language={lang}>{install}</CodeBlock>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
