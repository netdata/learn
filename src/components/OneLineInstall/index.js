import React, { useState } from 'react';
import Link from '@docusaurus/Link'
import clsx from 'clsx';

import CodeBlock from '@theme/CodeBlock'

import styles from './styles.module.scss'; 

export function OneLineInstall() {
  const [currentCommandUpdates, setCurrentCommandUpdates] = useState('');
  const [currentCommandRelease, setCurrentCommandRelease] = useState('');
  const [currentCommandStatistics, setCurrentCommandStatistics] = useState('');
  const [updatesChecked, setUpdatesChecked] = useState(true);
  const [releaseChecked, setReleaseChecked] = useState(true);
  const [statsChecked, setStatsChecked] = useState(true);

  let currentCommand = `bash <(curl -Ss https://my-netdata.io/kickstart.sh)${currentCommandUpdates}${currentCommandRelease}${currentCommandStatistics}`;
  const lang = `bash`

  function handleUpdatesChange() {
    if (currentCommandUpdates === '' && updatesChecked == true) {
      setCurrentCommandUpdates(' --no-updates');
      setUpdatesChecked(false);
    } else {
      setCurrentCommandUpdates('');
      setUpdatesChecked(true);
    }
  }

  function handleReleaseChange() {
    if (currentCommandRelease === '' && releaseChecked == true) {
      setCurrentCommandRelease(' --stable-channel');
      setReleaseChecked(false);
    } else {
      setCurrentCommandRelease('');
      setReleaseChecked(true);
    }
  }

  function handleStatisticsChange() {
    if (currentCommandStatistics === '' && statsChecked == true) {
      setCurrentCommandStatistics(' --disable-telemetry');
      setStatsChecked(false);
    } else {
      setCurrentCommandStatistics('');
      setStatsChecked(true);
    }
  }

  return (
    <div className={clsx('relative overflow-hidden mt-8 mb-8 bg-white rounded-tr rounded-tl !rounded-br-none dark:bg-gray-900', styles.Container)}>
      <CodeBlock className={clsx('bash text-2xl !mb-0 rounded', styles.getOneLineCommand)} language={lang}>{currentCommand}</CodeBlock>
      <div className="z-10 relative p-6 border-l border-b border-r border-gray-200 rounded-br rounded-bl">
        <div className="py-1 flex items-center">
          <input 
            onChange={handleUpdatesChange}
            checked={updatesChecked}
            type="checkbox" 
            id="toggle__updates"/>
          <label htmlFor="toggle__updates" className="relative text-sm pl-2">Do you want automatic updates? <code>default: enabled</code></label>
        </div>
        <div className="py-1 flex items-center">
          <input 
            onChange={handleReleaseChange}
            checked={releaseChecked}
            type="checkbox" 
            id="toggle__type" />
          <label htmlFor="toggle__type" className="relative text-sm pl-2">Do you want nightly or stable releases? <code>default: nightly</code></label>
        </div>
        <div className="py-1 flex items-center">
          <input 
            onChange={handleStatisticsChange}
            checked={statsChecked}
            type="checkbox" 
            id="toggle__stats" />
          <label htmlFor="toggle__stats" className="relative text-sm pl-2">Do you want to contribute <Link to="/docs/agent/anonymous-statistics" className="text-green hover:text-blue">anonymous statistics?</Link> <code>default: enabled</code></label>
        </div>
      </div>
    </div>
  )
}
