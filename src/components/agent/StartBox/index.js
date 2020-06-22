import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

export const Start = ({children}) => (
  <div className={styles.Start}>
    {children}
  </div>
)

export const StartBox = ({children, href, title, button}) => (
  <Link href={href} className={styles.StartBox}>
    <h3>{title}</h3>
    <p>{children}</p>
    {button &&
      <button 
        className={clsx('button button--lg')}>
        {button}
      </button>
    }
  </Link>
);