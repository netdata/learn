import React, {useEffect, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import Link from '@docusaurus/Link';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import { SearchProvider, WithSearch, Results, SearchBox, ResultsPerPage, Paging, PagingInfo } from "@elastic/react-search-ui";

// import "@elastic/react-search-ui-views/lib/styles/styles.css";
import styles from './styles.SearchBar.module.scss';

const connector = new SiteSearchAPIConnector({
  documentType: "page",
  engineKey: "BZL_aEiLAebVKkcm3eFr"
});

const SearchBar = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const keyPressHandler = (e) => {

      // Open on typing `s`
      if (e.target.tagName === 'BODY' && e.key === 's' || e.key === '?') {
        e.preventDefault()
        onOpen()
      }

      // Close on `Escape`
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false);
        document.body.classList.remove('search-open');
      }
    };

    document.addEventListener('keydown', keyPressHandler);
    return () => {
      document.removeEventListener('keydown', keyPressHandler);
    };
  }, []);

  const onOpen = () => {
    setIsOpen(true);
    document.body.classList.add('search-open');
  }

  const onClose = useCallback((e) => {
    if (e.target === e.currentTarget || e.currentTarget.tagName === 'A') {
      setIsOpen(false);
      document.body.classList.remove('search-open');
    }
  }, [setIsOpen]);

  return (
    <>
      <button
        className={styles.searchButton}
        onClick={onOpen}>
          <span className={styles.searchButtonTextLarge}>🔍</span>
      </button>

      {isOpen &&
        createPortal(
          <div 
            className={clsx('searchZ', styles.searchContainer)}
            style={{ zIndex: '300' }}
            onMouseDown={onClose}>
            <div onClick={null} className={styles.searchModal}>
              
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
                            className={clsx('button--primary')}
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
                                      <span className={clsx(styles.resultFlag)}>Learn / Docs</span>
                                      <h3>{r.title.raw}</h3>
                                      <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                                      {r.description && 
                                        <p className={clsx(styles.resultDescription)}>{r.description.raw}</p>
                                      }
                                    </Link>
                                  )
                                } else if (r.url.raw.includes('netdata.cloud/blog') == true) {
                                  return (
                                    <Link href={r.url.raw}>
                                      <span className={clsx(styles.resultFlag)}>Blog</span>
                                      <h3>{r.title.raw}</h3>
                                      <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                                      {r.description && 
                                        <p className={clsx(styles.resultDescription)}>{r.description.raw}</p>
                                      }
                                    </Link>
                                  )
                                } else if (r.url.raw.includes('netdata.cloud') == true) {
                                  return (
                                    <Link href={r.url.raw}>
                                      <span className={clsx(styles.resultFlag)}>Netdata.Cloud</span>
                                      <h3>{r.title.raw}</h3>
                                      <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                                      {r.description && 
                                        <p className={clsx(styles.resultDescription)}>{r.description.raw}</p>
                                      }
                                    </Link>
                                  )
                                } else if (r.url.raw.includes('github.com') == true) {
                                  return (
                                    <Link href={r.url.raw}>
                                      <span className={clsx(styles.resultFlag)}>GitHub</span>
                                      <h3>{r.title.raw}</h3>
                                      <p className={clsx(styles.resultUrl)}>{r.url.raw}</p>
                                      {r.description && 
                                        <p className={clsx(styles.resultDescription)}>{r.description.raw}</p>
                                      }
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
              
            </div>  
          </div>,
          document.body,
        )
      }

    </>
  )
}

export default SearchBar; 
