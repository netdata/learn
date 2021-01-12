/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState, useCallback} from 'react';
import SVG from 'react-inlinesvg'; // EDIT
import {MDXProvider} from '@mdx-js/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link'; // EDIT
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import MDXComponents from '@theme/MDXComponents';
import NotFound from '@theme/NotFound';
import {matchPath} from '@docusaurus/router';
import clsx from 'clsx';
import styles from './styles.module.scss';
import {docVersionSearchTag} from '@docusaurus/theme-common';

function DocPageContent({currentDocRoute, versionMetadata, children}) {
  const {siteConfig, isClient} = useDocusaurusContext();
  const {pluginId, permalinkToSidebar, docsSidebars, version} = versionMetadata;
  const sidebarName = permalinkToSidebar[currentDocRoute.path];
  const sidebar = docsSidebars[sidebarName];
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }

    setHiddenSidebarContainer(!hiddenSidebarContainer);
  }, [hiddenSidebar]);

  // BEGIN CUSTOMIZATION
  const isGuide = children.props.children[0].props.path.includes('/guides/');
  // END CUSTOMIZATION

  return (
    <Layout
      key={isClient}
      searchMetadatas={{
        version,
        tag: docVersionSearchTag(pluginId, version),
      }}>
      <div className={styles.docPage}>
        {sidebar && (
          <div
            className={clsx(styles.docSidebarContainer, {
              [styles.docSidebarContainerHidden]: hiddenSidebarContainer,
            })}
            onTransitionEnd={(e) => {
              if (
                !e.currentTarget.classList.contains(styles.docSidebarContainer)
              ) {
                return;
              }

              if (hiddenSidebarContainer) {
                setHiddenSidebar(true);
              }
            }}
            role="complementary">
            <DocSidebar
              key={
                // Reset sidebar state on sidebar changes
                // See https://github.com/facebook/docusaurus/issues/3414
                sidebarName
              }
              sidebar={sidebar}
              path={currentDocRoute.path}
              sidebarCollapsible={
                siteConfig.themeConfig?.sidebarCollapsible ?? true
              }
              onCollapse={toggleSidebar}
              isHidden={hiddenSidebar}
            />

            {hiddenSidebar && (
              <div
                className={styles.collapsedDocSidebar}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                tabIndex={0}
                role="button"
                onKeyDown={toggleSidebar}
                onClick={toggleSidebar}
              />
            )}
          </div>
        )}
        <main className={styles.docMainContainer}>
          <div
            className={clsx(
              'container padding-vert--lg',
              styles.docItemWrapper,
              // BEGIN CUSTOMIZATION
              isGuide && styles.guideItemWrapper,
              // END CUSTOMIZATION
              {
                [styles.docItemWrapperEnhanced]: hiddenSidebarContainer,
              },
            )}>
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
          </div>
          {isGuide &&
            <section className={clsx(styles.CTAguide)}>
              <div className={clsx("container")}>
                <div className={clsx("row")}>
                  <div className={clsx("col", styles.CTAGuideText)}>
                    <h2>Monitor everything in real time – for free</h2>
                    <p>Troubleshoot slowdowns and anomalies in your infrastructure with thousands of metrics, interactive visualizations, and insightful health alarms.</p>
                    <Link to="https://netdata.cloud/get-netdata" className="button button--primary">Get started</Link>
                  </div>
                </div>
                <SVG 
                    className={clsx(
                      styles.CTAGuideImg
                    )} 
                    src="/img/cta.svg"
                    alt="Get started" 
                  />
              </div>
            </section>
          }
        </main>
      </div>
    </Layout>
  );
}

function DocPage(props) {
  const {
    route: {routes: docRoutes},
    versionMetadata,
    location,
  } = props;
  const currentDocRoute = docRoutes.find((docRoute) =>
    matchPath(location.pathname, docRoute),
  );

  if (!currentDocRoute) {
    return <NotFound {...props} />;
  }

  return (
    <DocPageContent
      currentDocRoute={currentDocRoute}
      versionMetadata={versionMetadata}>
      {renderRoutes(docRoutes)}
    </DocPageContent>
  );
}

export default DocPage;
