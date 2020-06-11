import React, {useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import Link from '@docusaurus/Link';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import { SearchProvider, WithSearch, Results, SearchBox, ResultsPerPage } from "@elastic/react-search-ui";

import styles from './styles.SearchBar.module.scss';

const connector = new SiteSearchAPIConnector({
  documentType: "page",
  engineKey: "BZL_aEiLAebVKkcm3eFr"
});

const SearchBar = (props) => {
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = (evt) => {
    console.log('Open the modal now, please.')
    setIsOpen(true);
  }

  const onClose = useCallback((evt) => {
    evt.preventDefault();
    if(evt.target === evt.currentTarget) {
      console.log('Close the modal now, please.')
      setIsOpen(false);
    }
  }, [setIsOpen]);

  return (
    <>
      <button
        className={classnames(styles.searchButton)}
        onClick={onOpen}>
          Search
      </button>

      {isOpen &&
        createPortal(
          <div 
            className={classnames('searchClose', styles.searchContainer)}
            onClick={onClose}>
            <div onClick={null} className={styles.searchModal}>
              
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
                          <div className={styles.resultVolume}>
                            <p>Your search returned {results.length} queries.</p>
                            <ResultsPerPage />
                          </div>
                        </div>
                        <div className={classnames('col col--8')}>
                          {searchTerm !== '' && results.map(r => (
                            <div key={r.id.raw} className={classnames(styles.searchResultItem)}>
                              {(() => {
                                if (r.url.raw.includes('learn.netdata.cloud') == true) {
                                  return (
                                    <Link onClick={onClose} to={r.url.raw.split('https://learn.netdata.cloud')[1]}>
                                      <h3>{r.title.raw} <span className={classnames(styles.resultFlag)}>Learn / Docs</span></h3>
                                      <p className={classnames(styles.resultUrl)}>{r.url.raw}</p>
                                    </Link>
                                  )
                                } else if (r.url.raw.includes('netdata.cloud/blog') == true) {
                                  return (
                                    <Link href={r.url.raw}>
                                      <h3>{r.title.raw} <span className={classnames(styles.resultFlag)}>Blog</span></h3>
                                      <p className={classnames(styles.resultUrl)}>{r.url.raw}</p>
                                    </Link>
                                  )
                                } else if (r.url.raw.includes('netdata.cloud') == true) {
                                  return (
                                    <Link href={r.url.raw}>
                                      <h3>{r.title.raw} <span className={classnames(styles.resultFlag)}>Netdata.Cloud</span></h3>
                                      <p className={classnames(styles.resultUrl)}>{r.url.raw}</p>
                                    </Link>
                                  )
                                } else if (r.url.raw.includes('github.com') == true) {
                                  return (
                                    <Link href={r.url.raw}>
                                      <h3>{r.title.raw} <span className={classnames(styles.resultFlag)}>GitHub</span></h3>
                                      <p className={classnames(styles.resultUrl)}>{r.url.raw}</p>
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
          </div>,
          document.body,
        )
      }

    </>
  )
}

export default SearchBar; 
