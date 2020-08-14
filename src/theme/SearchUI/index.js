import React, {useEffect, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

import Link from '@docusaurus/Link';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import { SearchProvider, WithSearch, SearchBox, ResultsPerPage, Paging, PagingInfo } from "@elastic/react-search-ui";

import styles from './styles.SearchUI.module.scss';

const connector = new SiteSearchAPIConnector({
  documentType: "page",
  engineKey: "BZL_aEiLAebVKkcm3eFr"
});

function SearchUI() {
  return (
    <>
      <SearchProvider
        config={{
          apiConnector: connector,
          initialState: {
            resultsPerPage: 20
          }
        }}
        searchAsYouType={false}
      >

        <WithSearch mapContextToProps={({searchTerm, results}) => ({searchTerm, results})}>
          {({searchTerm, results}) => {
            return (
              <>
                <header className={styles.searchHeader}>
                  <SearchBox 
                    inputProps={{ placeholder: "Search all of Netdata", autoFocus: true }} 
                    autocompleteResults={{
                      titleField: "title",
                      urlField: "url"
                    }}
                  />
                  <div className={styles.resultVolume}>
                    <PagingInfo />
                    <ResultsPerPage className={styles.resultPaged} />
                  </div>
                </header>
                <div className={styles.searchResults}>
                  {results.map(r => (
                    <div key={r.id.raw} className={clsx(styles.searchResultItem)}>
                      {(() => {
                        if (r.url.raw.includes('learn.netdata.cloud') == true) {
                          return (
                            <Link onClick={onClose} to={r.url.raw.split('https://learn.netdata.cloud')[1]}>
                              <h3>{r.title.raw} <span className={clsx(styles.resultFlag)}>Learn / Docs</span></h3>
                              <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                            </Link>
                          )
                        } else if (r.url.raw.includes('netdata.cloud/blog') == true) {
                          return (
                            <Link href={r.url.raw}>
                              <h3>{r.title.raw} <span className={clsx(styles.resultFlag)}>Blog</span></h3>
                              <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                            </Link>
                          )
                        } else if (r.url.raw.includes('netdata.cloud') == true) {
                          return (
                            <Link href={r.url.raw}>
                              <h3>{r.title.raw} <span className={clsx(styles.resultFlag)}>Netdata.Cloud</span></h3>
                              <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                            </Link>
                          )
                        } else if (r.url.raw.includes('github.com') == true) {
                          return (
                            <Link href={r.url.raw}>
                              <h3>{r.title.raw} <span className={clsx(styles.resultFlag)}>GitHub</span></h3>
                              <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                            </Link>
                          )
                        }
                      })()}
                    </div>
                  ))}

                  <Paging />
                </div>
                <footer className={styles.searchFooter}>
                  <div className={styles.closeInst}>
                    <div className={styles.closeKey}>
                      Press <code>Esc</code> to close
                    </div>
                    <div className={styles.closeButton}>
                      <button 
                        className={clsx('button button--secondary button--lg')} 
                        onClick={onClose}>
                        Close
                      </button>
                    </div>
                  </div>
                </footer>
              </>
            );
          }}
        </WithSearch>
      </SearchProvider>
    </>
  )
}

export default SearchUI;