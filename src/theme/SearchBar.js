import React, {useEffect} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import { SearchProvider, WithSearch, Results, SearchBox, ResultsPerPage } from "@elastic/react-search-ui";

// import styles from './styles.module.scss';

const connector = new SiteSearchAPIConnector({
  documentType: "page",
  engineKey: "BZL_aEiLAebVKkcm3eFr"
});

const SearchBar = (props) => {

  return (
    <input
      className={clsx()}
      onClick={onOpen}
    />
  )
}

export default SearchBar; 
