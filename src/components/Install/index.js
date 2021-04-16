import React from 'react'
import Link from '@docusaurus/Link'

import styles from './styles.module.scss'

export const Install = ({children}) => (
  <div className={styles.Install}>
    {children}
  </div>
)

export const InstallBox = ({to, os}) => (
  <Link to={to} className={styles.InstallBox}>
    <h3>{os}</h3>
  </Link>
)

export const Quickstarts = ({ children }) => (
  <div className={styles.Quickstarts}>
    {children}
  </div>
)


export const Quickstart = ({ name, to }) => (
  <Link to={to} className={styles.InstallBox}>
    <h3>{name}</h3>
  </Link>
)