import React from 'react';
import Link from '@docusaurus/Link';
import SVG from 'react-inlinesvg';

import styles from './styles.module.scss';

export const Install = ({children}) => (
  <div className={styles.Install}>
    {children}
  </div>
)

export const InstallBox = ({to, img, imgDark, os}) => (
  <Link to={to} className={styles.InstallBox}>
    <div className={imgDark && styles.InstallIconSwitch}>
      <SVG 
        className={styles.InstallIcon}
        src={img}
        alt={os} />
      {imgDark && 
        <SVG 
          className={styles.InstallIconDark}
          src={imgDark}
          alt={os} />
      }
    </div>
    <h4>{os}</h4>
  </Link>
);