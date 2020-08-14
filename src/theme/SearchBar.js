import React, {useEffect, useState, useCallback} from 'react';

import styles from './styles.SearchBar.module.scss';

const loadJS = () => import('./SearchUI');
let SearchModal = null;

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

  const importDocSearchModalIfNeeded = useCallback(() => {
    if (SearchModal) {
      return Promise.resolve();
    }

    return Promise.all([import('./SearchUI')]).then(
      ([{default: SearchUI}]) => {
        SearchModal = SearchUI;
      },
    );
  }, []);


  const onOpen = useCallback(() => {
    importDocSearchModalIfNeeded().then(() => {
      setIsOpen(true);
      document.body.classList.add('search-open');
    });
   }, [importDocSearchModalIfNeeded, setIsOpen]);

  return (
    <>
      <button
        className={styles.searchButton}
        onClick={onOpen}
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}>
          Search Netdata...
          <span className={styles.searchKey}>?</span>
      </button>

      {isOpen && <SearchModal />}
    </>
  )
}

export default SearchBar; 
