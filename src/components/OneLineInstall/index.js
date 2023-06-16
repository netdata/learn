import React, { useState } from 'react';
import Link from '@docusaurus/Link'
import clsx from 'clsx';

import CodeBlock from '@theme/CodeBlock'

import styles from './styles.module.css'; 

export function OneLineInstallWget() {
  const [currentCommandUpdates, setCurrentCommandUpdates] = useState('');
  const [currentCommandRelease, setCurrentCommandRelease] = useState('');
  const [currentCommandStatistics, setCurrentCommandStatistics] = useState('');
  const [currentCloudOption, setCurrentCloudOption] = useState('');
  const [updatesChecked, setUpdatesChecked] = useState(true);
  const [releaseChecked, setReleaseChecked] = useState(false);
  const [statsChecked, setStatsChecked] = useState(true);
  const [cloudChecked, setCloudChecked] = useState(false);

  let currentCommand = `wget -O /tmp/netdata-kickstart.sh https://my-netdata.io/kickstart.sh && sh /tmp/netdata-kickstart.sh${currentCommandUpdates}${currentCommandRelease}${currentCommandStatistics}${currentCloudOption}`;
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

  function handleCloudChange() {
    if (currentCloudOption === '' && cloudChecked == false) {
      setCurrentCloudOption(' --claim-token YOUR_CLAIM_TOKEN');
      setCloudChecked(true);
    } else {
      setCurrentCloudOption('');
      setCloudChecked(false);
    }
  }

  return (
    <div className={clsx('relative overflow-hidden mt-8 mb-8 rounded-tr rounded-tl', styles.Container)}>
      <div className="text-lg lg:text-xl">
        <CodeBlock className="bash">
          {currentCommand}
        </CodeBlock>
      </div>
      <div className="z-10 relative -t-2 p-6 border-l border-b border-r border-gray-200 rounded-br rounded-bl dark:bg-gray-darkbg dark:border-gray-500">
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
          <label htmlFor="toggle__stats" className="relative text-sm pl-2">Do you want to contribute <Link to="/docs/deployment-in-production/security-and-privacy-design" className="hover:text-blue">anonymous statistics?</Link> <code>default: enabled</code></label>
        </div>
        <div className="py-1 flex items-center">
          <input
            onChange={handleCloudChange}
            checked={cloudChecked}
            type="checkbox"
            id="toggle__cloud" />
          <label htmlFor="toggle__cloud" className="relative text-sm pl-2">Do you want to <Link to="/docs/getting-started/monitor-your-infrastructure/connect-agent-to-cloud" className="hover:text-blue">connect</Link> the node to Netdata Cloud?<code>default: disabled</code></label>
        </div>
      </div>
    </div>
  )
}


export function OneLineInstallCurl() {
  const [currentCommandUpdates, setCurrentCommandUpdates] = useState('');
  const [currentCommandRelease, setCurrentCommandRelease] = useState('');
  const [currentCommandStatistics, setCurrentCommandStatistics] = useState('');
  const [currentCloudOption, setCurrentCloudOption] = useState('');
  const [updatesChecked, setUpdatesChecked] = useState(true);
  const [releaseChecked, setReleaseChecked] = useState(true);
  const [statsChecked, setStatsChecked] = useState(true);
  const [cloudChecked, setCloudChecked] = useState(false);

  let currentCommand = `curl https://my-netdata.io/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh${currentCommandUpdates}${currentCommandRelease}${currentCommandStatistics}${currentCloudOption}`;
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

  function handleCloudChange() {
    if (currentCloudOption === '' && cloudChecked == false) {
      setCurrentCloudOption(' --claim-token YOUR_CLAIM_TOKEN');
      setCloudChecked(true);
    } else {
      setCurrentCloudOption('');
      setCloudChecked(false);
    }
  }


  return (
    <div className={clsx('relative overflow-hidden mt-8 mb-8 rounded-tr rounded-tl', styles.Container)}>
      <div className="text-lg lg:text-xl">
        <CodeBlock className="bash">
          {currentCommand}
        </CodeBlock>
      </div>
      <div className="z-10 relative -t-2 p-6 border-l border-b border-r border-gray-200 rounded-br rounded-bl dark:bg-gray-darkbg dark:border-gray-500">
        <div className="py-1 flex items-center">
          <input 
            onChange={handleUpdatesChange}
            checked={updatesChecked}
            type="checkbox" 
            id="toggle__updates_curl" />
          <label htmlFor="toggle__updates_curl" className="relative text-sm pl-2">Do you want automatic updates? <code>default: enabled</code></label>
        </div>
        <div className="py-1 flex items-center">
          <input 
            onChange={handleReleaseChange}
            checked={releaseChecked}
            type="checkbox" 
            id="toggle__type_curl" />
          <label htmlFor="toggle__type_curl" className="relative text-sm pl-2">Do you want nightly or stable releases? <code>default: nightly</code></label>
        </div>
        <div className="py-1 flex items-center">
          <input 
            onChange={handleStatisticsChange}
            checked={statsChecked}
            type="checkbox" 
            id="toggle__stats_curl" />
          <label htmlFor="toggle__stats_curl" className="relative text-sm pl-2">Do you want to contribute <Link to="/docs/deployment-in-production/security-and-privacy-design" className="hover:text-blue">anonymous statistics?</Link> <code>default: enabled</code></label>
        </div>
        <div className="py-1 flex items-center">
          <input
            onChange={handleCloudChange}
            checked={cloudChecked}
            type="checkbox"
            id="toggle__cloud_curl" />
          <label htmlFor="toggle__cloud_curl" className="relative text-sm pl-2">Do you want to <Link to="/docs/getting-started/monitor-your-infrastructure/connect-agent-to-cloud" className="hover:text-blue">connect</Link> the node to Netdata Cloud?<code>default: disabled</code></label>
        </div>
      </div>
    </div>
  )
}
