import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

export const BoxGrid = ({children}) => (
  <div className={styles.BoxGrid}>
    {children}
  </div>
)

export const Box = ({children, href, title, cta, GuideTech}) => (
  <div className={styles.Box}>
    <h3>{title}</h3>
    {children && <p>{children}</p>}
    {cta && <span className={clsx('button button--primary', styles.BoxCTA)}>{cta}</span>}
    {GuideTech && 
      <ul className={styles.BoxGuideTech}>
        {GuideTech.map(item => (
          <li>{item}</li>
        ))}
      </ul>
    }
    <Link 
      className={styles.BoxHit}
      to={href} />
  </div>
);