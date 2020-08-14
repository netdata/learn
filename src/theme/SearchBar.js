import React, {useEffect, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

import styles from './styles.SearchBar.module.scss';

let SearchModal = null;

const SearchBar = () => {
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
        onClick={onOpen}
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}>
          Search Netdata...
          <span className={styles.searchKey}>?</span>
      </button>

      {isOpen && 
        createPortal(
          <div 
            className={clsx('searchClose', styles.searchContainer)}
            onMouseDown={onClose}>
            <div onClick={null} className={styles.searchModal}>
              <SearchModal />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default SearchBar; 
