import React from 'react'
import Link from '@docusaurus/Link'
import SVG from 'react-inlinesvg'

export const InstallRegexLink = ({ className, children }) => (
  <div className={`grid grid-flow-row grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
    {children}
  </div>
)

export const InstallBoxRegexLink = ({ to, os, svg }) => (
  <Link to={to.match(/\]\((.*?)\)/)[1]} className={`group relative p-8 border border-gray-200 rounded !no-underline shadow-sm hover:text-text dark:bg-gray-800 dark:border-gray-500`}>
    {svg &&
      <div className="flex items-center justify-center w-8 h-8 bg-blue group-hover:bg-green-light rounded-full mb-1">
        <SVG 
          src={`/img/install/${svg}.svg`}
          alt={os} />
      </div>
    }
    <h3 className="!text-base font-semibold group-hover:text-green-light">{os}</h3>
  </Link>
)