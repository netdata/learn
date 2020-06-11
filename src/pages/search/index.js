import React from "react";
import classnames from 'classnames';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import { SearchProvider, WithSearch, Results, SearchBox, ResultsPerPage } from "@elastic/react-search-ui";

import styles from './styles.module.scss';

const connector = new SiteSearchAPIConnector({
  documentType: "page",
  engineKey: "BZL_aEiLAebVKkcm3eFr"
});

function Search() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;

  return (
    <Layout
      title={`Search Netdata`}
      description="Search all of Netdata's assets from one place: Learn, our blog, GitHub, and more.">
      <main className={classnames('container', styles.searchContainer)}>
        <div className={classnames('row')}>
              
          <SearchProvider
            config={{
              apiConnector: connector
            }}
          >
            <WithSearch
              mapContextToProps={({ searchTerm, setSearchTerm, results }) => ({
                searchTerm,
                setSearchTerm,
                results
              })}
            >
              {({ searchTerm, setSearchTerm, results }) => {
                return (
                  <>
                    <div className={classnames('col col--4')}>
                      <input
                        className={classnames(styles.searchInput)}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Netdata Learn..."
                      />
                      <p>
                        Your search returned {results.length} queries.                              
                      </p>
                      <ResultsPerPage />
                    </div>
                    <div className={classnames('col col--8')}>
                      {results.map(r => (
                        <div key={r.id.raw} className={classnames(styles.result)}>
                          {(() => {
                            if (r.url.raw.includes('learn.netdata.cloud') == true) {
                              return (
                                <Link to={r.url.raw.split('https://learn.netdata.cloud')[1]}>
                                  
                                  <h3>{r.title.raw} <span className={classnames(styles.resultFlag)}>Learn / Docs</span></h3>
                                  <p className={classnames(styles.resultUrl)}>{r.url.raw}</p>
                                </Link>
                              )
                            } else if (r.url.raw.includes('netdata.cloud/blog') == true) {
                              return (
                                <Link href={r.url.raw}>
                                  <span className={classnames(styles.resultFlag)}>Blog</span>
                                  <h3>{r.title.raw}</h3>
                                </Link>
                              )
                            } else if (r.url.raw.includes('netdata.cloud') == true) {
                              return (
                                <Link href={r.url.raw}>
                                  <span className={classnames(styles.resultFlag)}>Netdata</span>
                                  <h3>{r.title.raw}</h3>
                                </Link>
                              )
                            } else if (r.url.raw.includes('github.com') == true) {
                              return (
                                <Link href={r.url.raw}>
                                  <span className={classnames(styles.resultFlag)}>GitHub</span>
                                  <h3>{r.title.raw}</h3>
                                </Link>
                              )
                            }
                          })()}
                        </div>
                      ))}
                    </div>
                  </>
                );
              }}
            </WithSearch>
          </SearchProvider>

        </div>
      </main>
    </Layout>
  );
}

export default Search;