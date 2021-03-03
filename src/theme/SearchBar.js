import React, {useEffect, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';
import SVG from 'react-inlinesvg';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistory} from '@docusaurus/router';
import Link from '@docusaurus/Link';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import {
  Layout,
  SingleSelectFacet,
  SingleLinksFacet,
  BooleanFacet
} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

// import "@elastic/react-search-ui-views/lib/styles/styles.css";
import styles from './styles.SearchBar.module.scss';

const connector = new SiteSearchAPIConnector({
  documentType: "page",
  engineKey: "BZL_aEiLAebVKkcm3eFr"
});

const config = {
  apiConnector: connector,
  searchQuery: {
    result_fields: {
      title: {
        snippet: {
          size: 100,
          fallback: true
        }
      },
      url: {
        raw: {}
      },
      description: {
        snippet: {
          size: 100,
          fallback: true
        }
      }
    },
  },
  alwaysSearchOnInitialLoad: false
}

const SORT_OPTIONS = [
  {
    name: "Relevance",
    value: "",
    direction: ""
  },
  {
    name: "Title",
    value: "title",
    direction: "asc"
  }
];

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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>

      {isOpen &&
        createPortal(
          <div 
            className={clsx('searchZ', styles.searchContainer)}
            style={{ zIndex: '300' }}
            onMouseDown={onClose}>
            <div onClick={null} className={styles.searchModal}>

              <SearchProvider config={config}>
                <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
                  {({ wasSearched }) => {
                    return (
                      <div className="App">
                        <ErrorBoundary>
                          <Layout
                            header={
                              <SearchBox
                                autocompleteMinimumCharacters={3}
                                autocompleteResults={{
                                  linkTarget: "_blank",
                                  sectionTitle: "Results",
                                  titleField: "title",
                                  shouldTrackClickThrough: true,
                                  clickThroughTags: ["test"]
                                }}
                                autocompleteSuggestions={true}
                                debounceLength={0}
                              />
                            }
                            sideContent={
                              <div>
                                {wasSearched && (
                                  <Sorting label={"Sort by"} sortOptions={SORT_OPTIONS} />
                                )}
                              </div>
                            }
                            bodyContent={
                              <Results
                                titleField="title"
                                urlField="url"
                                shouldTrackClickThrough={true}
                              />
                            }
                            bodyHeader={
                              <React.Fragment>
                                {wasSearched && <PagingInfo />}
                                {wasSearched && <ResultsPerPage />}
                              </React.Fragment>
                            }
                            bodyFooter={<Paging />}
                          />
                        </ErrorBoundary>
                      </div>
                    );
                  }}
                </WithSearch>
              </SearchProvider>

              {/* <SearchProvider config={configurationOptions}>
                  <div className="App">
                    <Layout
                      header={<SearchBox />}
                      bodyContent={<Results titleField="title" shouldTrackClickThrough={true} />}
                    />
                  </div>
              </SearchProvider> */}

              
              
              {/* <SearchProvider
                config={{
                  apiConnector: connector,
                  initialState: {
                    resultsPerPage: 20
                  },
                  shouldTrackClickThrough: true,

                }}
                searchAsYouType={false}
              > */}



                {/* <WithSearch mapContextToProps={({searchTerm, results}) => ({searchTerm, results})}>
                  {({searchTerm, results}) => {
                    return (
                      <>
                        <header className={styles.searchHeader}>
                          <SearchBox 
                            className={clsx('button--primary')}
                            inputProps={{ placeholder: "Search all of Netdata", autoFocus: true }} 
                            autocompleteResults={{
                              titleField: "title",
                              urlField: "url",
                              shouldTrackClickThrough: true,
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
                </WithSearch> */}

              {/* </SearchProvider> */}
              
            </div>  
          </div>,
          document.body,
        )
      }

    </>
  )
}

export default SearchBar; 
