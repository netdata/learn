/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import qs from 'qs';
import clsx from 'clsx';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import CookbookItem from '@theme/CookbookItem';

import styles from './styles.module.scss';

function CookbookListPage(props) {
  const {items} = props;

  // const queryObj = props.location ? qs.parse(props.location.search, {ignoreQueryPrefix: true}) : {};

  // let itemsFiltered = items.slice(0);
  // itemsFiltered.sort((a, b) => (b.content.metadata.featured === true && 1) || -1);

  //
  // State
  //

  // const [onlyFeatured, setOnlyFeatured] = useState(queryObj['featured'] == 'true');
  // const [searchTerm, setSearchTerm] = useState(null);
  // const [searchLimit, setSearchLimit] = useState(20);

  // let filteredCap = itemsFiltered.length;
  // let increaseSearchLimit = function() {
  //   if ( searchLimit > filteredCap ) {
  //     return
  //   }
  //   let newLimit = searchLimit + 10;
  //   setSearchLimit(newLimit);
  // };

  //
  // Filtering
  //

  // if (searchTerm) {
  //   itemsFiltered = itemsFiltered.filter(item => {
  //     let searchTerms = searchTerm.split(" ");
  //     let content = `${item.content.metadata.title.toLowerCase()} ${item.content.metadata.description.toLowerCase()}`;
  //     return searchTerms.every(term => {
  //       return content.includes(term.toLowerCase())
  //     })
  //   });
  // }

  // if (onlyFeatured) {
  //   itemsFiltered = itemsFiltered.filter(item => item.content.metadata.featured == true);
  // }

  // filteredCap = itemsFiltered.length;
  // itemsFiltered = itemsFiltered.slice(0, searchLimit);

  return (
    <Layout 
    title="Netdata Guides" 
    description="A collection of guides to walk you through the Netdata ecosystem of health monitoring and performance troubleshooting tools."
    >
      <header className={clsx(styles.guideHeader)}>
        <div className="container">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h1>Netdata Guides</h1>
              <p>A collection of guides to walk you through the Netdata ecosystem of health monitoring and performance troubleshooting tools.</p>
              {/* <div className="search">
                <input
                  className={clsx(styles.guideSearch)}
                  type="text"
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  placeholder="🔍 Search..." />
              </div> */}
            </div>
          </div>
        </div>
      </header>
      <main className="container">

        <section className={styles.guideSection}>
          <div className={styles.guideBoxes}>
            <Link to="/docs/agent/getting-started" className={styles.guideBox}>
              <h3>Get started with the Netdata Agent</h3>
            </Link>
            <Link to="/docs/cloud/get-started" className={clsx('col col--4', styles.guideBox)}>
              <h3>Get started with Netdata Cloud</h3>
            </Link>
            
          </div>
        </section>

        <section className={clsx(styles.guideSection)}>
          <div className={clsx('row')}>
            <div className={clsx('col col--8 markdown')}>
              <h2>Step-by-step guide</h2>
              <p>Take a guided tour of configuring Netdata's Agent to your exact needs through metrics collection, health alarms, and seeing all your metrics in Netdata Cloud.</p>
            </div>
          </div>
          <div className={styles.guideBoxes}>
            <Link to="/guides/step-by-step/step-00" className={clsx('col col--4', styles.guideBox)}>
              <h3>The step-by-step Netdata tutorial</h3>
            </Link>
            <Link to="/guides/step-by-step/step-01" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 1. Netdata's building blocks</h3>
            </Link>
            <Link to="/guides/step-by-step/step-02" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 2. Get to know Netdata's dashboard</h3>
            </Link>
            <Link to="/guides/step-by-step/step-03" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 3. Monitor more than one system with Netdata</h3>
            </Link>
            <Link to="/guides/step-by-step/step-04" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 4. The basics of configuring Netdata</h3>
            </Link>
            <Link to="/guides/step-by-step/step-05" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 5. Health monitoring alarms and notifications</h3>
            </Link>
            <Link to="/guides/step-by-step/step-06" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 6. Collect metrics from more services and apps</h3>
            </Link>
            <Link to="/guides/step-by-step/step-07" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 7. Netdata's dashboard in depth</h3>
            </Link>
            <Link to="/guides/step-by-step/step-08" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 8. Build your first custom dashboard</h3>
            </Link>
            <Link to="/guides/step-by-step/step-09" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 9. Long-term metrics storage</h3>
            </Link>
            <Link to="/guides/step-by-step/step-10" className={clsx('col col--4', styles.guideBox)}>
              <h3>Step 10. Set up a proxy</h3>
            </Link>
          </div>
        </section>

        <section className={clsx(styles.guideSection)}>
          <div className={clsx('row')}>
            <div className={clsx('col col-12 markdown')}>
              <h2>Configure</h2>
              <p>Tweak the Netdata Agent and Netdata Cloud to release their full value entirely for free.</p>
            </div>
          </div>
          <div className={styles.guideBoxes}>
            <Link to="/guides/longer-metrics-storage" className={clsx('col col--4', styles.guideBox)}>
              <h3>Change how long Netdata stores metrics</h3>
            </Link>
            <Link to="/guides/using-host-labels" className={clsx('col col--4', styles.guideBox)}>
              <h3>Use host labels to organize systems, metrics, and alarms</h3>
            </Link>
          </div>
        </section>

        <section className={clsx(styles.guideSection)}>
          <div className={clsx('row')}>
            <div className={clsx('col col-12 markdown')}>
              <h2>Collect metrics</h2>
              <p>Simple guides for setting up and extracting value from a few of our 200+ integrations.</p>
            </div>
          </div>
          <div className={clsx(styles.guideBoxes, styles.guideBoxesTight)}>
            <Link to="/guides/collect-apache-nginx-web-logs" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor Nginx or Apache web server log files with Netdata</h3>
            </Link>
            <Link to="/guides/monitor-cockroachdb" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor CockroachDB metrics with Netdata</h3>
            </Link>
            <Link to="/guides/collect-unbound-metrics" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor Unbound DNS servers with Netdata</h3>
            </Link>
            <Link to="/guides/monitor-hadoop-cluster" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor a Hadoop cluster with Netdata</h3>
            </Link>
          </div>
        </section>

        <section className={clsx(styles.guideSection)}>
          <div className={clsx('row')}>
            <div className={clsx('col col-12 markdown')}>
              <h2>Monitor</h2>
              <p>Configure Netdata's sophisticated health monitoring watchdog to catch anomalies sooner.</p>
            </div>
          </div>
          <div className={clsx(styles.guideBoxes, styles.guideBoxesTight)}>
            <Link to="/guides/monitor/kubernetes-k8s-netdata" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor a Kubernetes cluster with Netdata</h3>
            </Link>
            <Link to="/guides/monitor/pi-hole-raspberry-pi" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor Pi-hole (and a Raspberry Pi) with Netdata</h3>
            </Link>
            <Link to="/guides/monitor/dimension-templates" className={clsx('col col--4', styles.guideBox)}>
              <h3>Use dimension templates to create dynamic alarms</h3>
            </Link>
            <Link to="/guides/monitor/stop-notifications-alarms" className={clsx('col col--4', styles.guideBox)}>
              <h3>Stop notifications for individual alarms</h3>
            </Link>
          </div>
        </section>

        <section className={clsx(styles.guideSection)}>
          <div className={clsx('row')}>
            <div className={clsx('col col-12 markdown')}>
              <h2>Troubleshoot</h2>
              <p>Leverage Netdata's visualization tools and extensive metrics collection to root-cause any issue with your systems or applications.</p>
            </div>
          </div>
          <div className={clsx(styles.guideBoxes, styles.guideBoxesTight)}>
            <Link to="/guides/troubleshoot/monitor-debug-applications-ebpf/" className={clsx('col col--4', styles.guideBox)}>
              <h3>Monitor, troubleshoot, and debug applications with eBPF metrics</h3>
            </Link>
          </div>
        </section>

        <section className={clsx(styles.guideSection)}>
          <div className={clsx('row')}>
            <div className={clsx('col col-12 markdown')}>
              <h2>Export</h2>
              <p>Send Netdata's metrics to more than 20 different external databases for full interoperability with your monitoring stack.</p>
            </div>
          </div>
          <div className={clsx(styles.guideBoxes, styles.guideBoxesTight)}>
            <Link to="/guides/export/export-netdata-metrics-graphite" className={clsx('col col--4', styles.guideBox)}>
              <h3>Export and visualize Netdata metrics in Graphite</h3>
            </Link>
          </div>
        </section>

          {/* If there is no search term, show the default view. */}
          {/* {!searchTerm ? (
            <>
              <div className="row">
                <div className={clsx('col col--12', styles.guideStep)}>
                  <h2>Netdata basics</h2>
                </div>
              </div>
              <div className="row">
                <div className={clsx('col col--3', styles.guideStep)}>
                  <h3>Change how long Netdata stores metrics</h3>
                </div>
              </div>
              <div className="row">
                <div className={clsx('col col--12', styles.guideStep)}>
                  <h2>Netdata step-by-step</h2>
                </div>
              </div>
              <div className="row">
                <Link to="/guides/step-00" className={clsx('col col--3', styles.guideStep)}>
                  <h3>The step-by-step Netdata tutorial</h3>
                </Link>
                <div className={clsx('col col--3', styles.guideStep)}>
                  <h3>Step 1. Netdata's building blocks</h3>
                </div>
                <div className={clsx('col col--3', styles.guideStep)}>
                  <h3>Step 2. Get to know Netdata's dashboard</h3>
                </div>
              </div>
              <div className="row">
                <div className={clsx('col col--12', styles.guideStep)}>
                  <h2>Collect metrics</h2>
                </div>
              </div>
            </>
          ) : (
            <div className="row">
              {itemsFiltered.map(({content: CookbookContent}) => (
                <CookbookItem
                  key={CookbookContent.metadata.permalink}
                  frontMatter={CookbookContent.frontMatter}
                  metadata={CookbookContent.metadata}
                  truncated>
                  <CookbookContent />
                </CookbookItem>
              ))}
            </div>
          )} */}

          {/* {itemsFiltered.length > 0 && itemsFiltered.length < items.length && itemsFiltered.length > searchLimit &&
            <div className="col">
              <button className="button button--secondary cookbook-show-more" onClick={() => increaseSearchLimit()}>Show more</button>
            </div>}
          {itemsFiltered.length == 0 &&
            <div className="col">
              <p>Whoops! There is no guide matching matching your search. If you feel we're missing an essential guide, please <a href="">file an issue on GitHub</a> the information you're looking for.</p>
            </div>} */}
      </main>
    </Layout>
  );
}

export default CookbookListPage;
