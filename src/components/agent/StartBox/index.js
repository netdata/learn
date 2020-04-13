import React from 'react';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

export const Start = ({children}) => (
  <div className={styles.Start}>
    {children}
  </div>
)

export const StartBox = ({children, href, title}) => (
  <Link href={href} className={styles.StartBox}>
    <h3>{title}</h3>
    <p>{children}</p>
  </Link>
);