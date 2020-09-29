import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

export const Discover = ({children}) => (
  <div className={styles.Discover}>
    {children}
  </div>
)
export const DiscoverBox = ({children, href, title, cta}) => (
  <Link href={href} className={styles.DiscoverBox}>
    <h3>{title}</h3>
    <p>{children}</p>
    {cta && <span className={clsx(styles.DiscoverCTA)}>{cta}</span>}
  </Link>
);