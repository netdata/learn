import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

export const Learn = ({children}) => (
  <div className={styles.LearnContainer}>
    {children}
  </div>
)

export const LearnBox = ({children, title, description}) => (
  <div className={styles.LearnBox}>
    <header>
      <h3>{title}</h3>
      <p>{description}</p>
    </header>
    <main>
      {children}
    </main>
  </div>
);

export const LearnLinks = ({children}) => (
  <ul className={styles.LearnLinks}>
    {children}
  </ul>
)

export const LearnLink = ({to, title}) => (
  <li className={styles.LearnLink}>
    <Link to={to}>
      {title}
    </Link>
  </li>
)