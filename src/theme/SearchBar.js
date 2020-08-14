import React, {useEffect, useState, useCallback, Suspense, lazy} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

import Link from '@docusaurus/Link';

import styles from './styles.SearchBar.module.scss';

const SearchUI = lazy(() => import('./SearchUI/index.js'));

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

  return (
    <>
      <button
        className={styles.searchButton}
        onClick={onOpen}>
          Search Netdata...
          <span className={styles.searchKey}>?</span>
      </button>

      <Suspense fallback={<div>Loading...</div>}>
        {isOpen && <SearchUI />}
      </Suspense>
    </>
  )
}

export default SearchBar; 
