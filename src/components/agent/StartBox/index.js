import React from 'react';
import classnames from 'classnames';
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
        className={classnames('button button--lg')}>
        {button}
      </button>
    }
  </Link>
);