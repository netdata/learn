import React from 'react'
import Link from '@docusaurus/Link'
import SVG from 'react-inlinesvg'

import styles from './styles.module.scss'

export const Install = ({ className, children }) => (
  <div className={`grid grid-flow-row grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
    {children}
  </div>
)

export const InstallBox = ({ to, os, svg, community }) => (
  <Link to={to} className="group relative p-8 border">
    {svg &&
      <div className="flex items-center justify-center w-8 h-8 bg-blue rounded-full mb-1">
        <SVG 
          src={`/img/install/${svg}.svg`}
          alt={os} />
      </div>
    }
    <h3 className="!text-base font-semibold mb-2">{os}</h3>
    {community && <span>💡 community-supported</span>}
  </Link>
)