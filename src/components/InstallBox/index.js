import React from 'react';
import Link from '@docusaurus/Link';
import SVG from 'react-inlinesvg';

import styles from './styles.module.scss';

export const Install = ({children}) => (
  <div className={styles.Install}>
    {children}
  </div>
)

export const InstallBox = ({to, img, os}) => (
  <Link to={to} className={styles.InstallBox}>
    <SVG 
      src={img}
      alt={os} />
    <h4>{os}</h4>
  </Link>
);