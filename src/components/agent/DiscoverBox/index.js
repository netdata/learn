import React from 'react';
import classnames from 'classnames';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

export const Discover = ({children}) => (
  <div className={styles.Discover}>
    {children}
  </div>
)
export const DiscoverBox = ({children, href, title}) => (
  <Link href={href} className={styles.DiscoverBox}>
    <h3>{title}</h3>
    <p>{children}</p>
  </Link>
);