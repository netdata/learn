import React from 'react'
import Link from '@docusaurus/Link'
import SVG from 'react-inlinesvg'

import styles from './styles.module.scss'

export const Install = ({ children }) => (
  <div className={styles.Install}>
    {children}
  </div>
)

export const InstallBox = ({ to, os, svg, community }) => (
  <Link to={to} className={styles.InstallBox}>
    {svg &&
      <div className={styles.InstallIcon}>
        <SVG 
          src={`/img/index/methods/${svg}.svg`}
          alt={os} />
      </div>
    }
    <h3>{os}</h3>
    {community && <span>💡 community-supported</span>}
  </Link>
)