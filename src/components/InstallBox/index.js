import React from 'react';
import Link from '@docusaurus/Link';
import SVG from 'react-inlinesvg';

import styles from './styles.module.scss';

export const Install = ({children}) => (
  <div className={styles.Install}>
    {children}
    <div className={styles.others}>
      <Link to="/docs/agent/packaging/installer/#alternative-methods">
        More installation options and OSs available in our packaging docs.
      </Link>
    </div>
  </div>
)

export const InstallBox = ({to, img, imgDark, os}) => (
  <Link to={to} className={styles.InstallBox}>
    <h3>{os}</h3>
  </Link>
);