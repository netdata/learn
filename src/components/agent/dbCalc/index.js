import React, { useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.scss';

import CodeBlock from '@theme/CodeBlock'

export function Calculator() {
  const [state, setState] = React.useState({
    parent: 1,
    child: 0,
    dims: 2000,
    update: 1,
    retention: 1,
    compression: 50,
    pageSize: 32,
  })

  const [requiredDisk, setRequiredDisk ] = React.useState('')
  const [diskPerNode, setDiskPerNode] = React.useState('')
  const [requiredRAM, setRequiredRAM] = React.useState('')
  const [conf, setConf] = React.useState('')

  // Establish measurements per page
  // These values do not change
  const uncompressedPageSize = 4096
  const uncompressedBytesPerMeasurements = 4
  const measurementsPerPage = uncompressedPageSize / uncompressedBytesPerMeasurements

  useEffect(() => {
    const nodes = state.parent + state.child
    const totalDims = nodes * state.dims
    const totalDimsPerSecond = totalDims / state.update
    const totalMeasurements = state.retention * totalDimsPerSecond * 24 * 3600

    // Calculate required disk space after compression
    const maxUncompressedPages = totalMeasurements / measurementsPerPage
    const uncompressedPageSizeDiv = uncompressedPageSize / 1024 / 1024
    const uncompressedStorage = maxUncompressedPages * uncompressedPageSizeDiv
    let diskSpace = Math.round(uncompressedStorage * ( 1 - (state.compression / 100)))

    // Calculate required RAM
    const ramPagesDims = totalDims * uncompressedPageSize * 2 / 1024 / 1024
    const ramMetadata = uncompressedStorage * 0.03
    const requiredRam = Math.round(state.pageSize + ramPagesDims + ramMetadata)

    // Calculate dbengine disk space setting
    // First, take the maximum between the calculated `diskSpace` and `ramPagesDims`.
    // Then enforce a minimum of 64 MiB, but if the calculated `diskSpace` is larger, use that instead. With multihost,
    // don't multiply the disk space by the number of nodes.
    diskSpace = Math.max(diskSpace, ramPagesDims)
    diskSpace = (diskSpace < 64) ? diskSpace = 64 : diskSpace

    // Calculate the disk space per node.
    const diskPerNode = Math.round(diskSpace / nodes)

    // Set states
    setRequiredDisk(diskSpace)
    setDiskPerNode(diskPerNode)
    setRequiredRAM(requiredRam)

    // Console output for debugging
    // console.log('Nodes: ' + nodes + '\nTotal dimensions: ' + totalDims + '\nTotal measurements collected per sec: ' + totalMeasurements + '\nMax uncompressed pages retained: ' + maxUncompressedPages + '\nUncompressed page size / 1024 / 1024: ' + uncompressedPageSizeDiv + '\nUncompressed storage required (MiB): ' + uncompressedStorage + '\nREQUIRED DISK SPACE: ' + diskSpace + '\nnetdata.conf [global] "dbengine disk space": ' + settingDiskSpace + '\nRAM for page cache: ' + ramPageCache + '\n2 pages for each dimension being collected: ' + ramPagesDims + '\n+ Metadata: ' + ramMetadata + '\nREQUIRED RAM: ' + requiredRam)

    const confString = String.raw`[global]
    dbengine multihost disk space = ${diskSpace}`
    setConf(confString)

  });

  const handleChange = (evt) => {
    const value = parseFloat(evt.target.value);
    setState({
      ...state,
      [evt.target.name]: value
    })
  }

  return (
    <div className={clsx('row', styles.dbCalc)}>
      <div className={'col col--12'}>
        <div className={clsx('row', styles.calcRow)}>
          <div className={clsx('col col--2', styles.calcInput)}>
            <input type="number" id="retention" name="retention" min="0" step="any" value={state.retention} onChange={handleChange} />
          </div>
          <div className={clsx('col col--10', styles.calcInstruction)}>
            <label htmlFor="retention">How many days do you want to store metrics?</label>
          </div>
        </div>

        <div className={clsx('row', styles.calcRow)}>
          <div className={clsx('col col--2', styles.calcInput)}>
            <input type="number" id="update" name="update" min="1" value={state.update} onChange={handleChange} />
          </div>
          <div className={clsx('col col--10', styles.calcInstruction)}>
            <label htmlFor="update">How often, on average, do your Agents collect metrics?</label>
            <p>By default, the Agent collects metrics once per second (<code>1</code>). See the <code>update every</code> setting in your <code>netdata.conf</code> file if yours may be different. If you have streaming nodes, use the average of their settings.</p>
          </div>
        </div>

        <div className={clsx('row', styles.calcRow)}>
          <div className={clsx('col col--2', styles.calcInput)}>
            <input type="number" id="dims" name="dims" min="0"  value={state.dims} onChange={handleChange} />
          </div>
          <div className={clsx('col col--10', styles.calcInstruction)}>
            <label htmlFor="dims">How many metrics, on average, do your Agents collect?</label>
            <p>
              To find this value for an Agent, scroll to the bottom of the dashboard to find the number of metrics your Agent collects. If you have streaming nodes, input the average of these values.
            </p>
          </div>
        </div>

        <div className={clsx('row', styles.calcRow)}>
          <div className={clsx('col col--2', styles.calcInput)}>
            <input type="number" id="child" name="child" min="0" value={state.child} onChange={handleChange} />
          </div>
          <div className={clsx('col col--10', styles.calcInstruction)}>
            <label htmlFor="child">How many child streaming nodes do you have?</label>
          </div>
        </div>

        <div className={clsx('row', styles.calcRow)}>
          <div className={clsx('col col--2', styles.calcInput)}>
            <input type="number" id="compression" name="compression" min="0" value={state.compression} onChange={handleChange} />
          </div>
          <div className={clsx('col col--10', styles.calcInstruction)}>
            <label htmlFor="compression">What is your compression savings ratio?</label>
            <p>To find this value, click on the <strong>Netdata Monitoring</strong> &rarr; <strong>dbengine</strong> items in the right-hand menu and look at the first chart under the <strong>dbengine</strong> section. You can also use your browser's search feature to look for <strong>compression savings ratio</strong>. Estimate an average value to input into the calculator.</p>
          </div>
        </div>

        <div className={clsx('row', styles.calcRow)}>
          <div className={clsx('col col--2', styles.calcInput)}>
            <input type="number" id="pageSize" name="pageSize" min="8" value={state.pageSize} onChange={handleChange} />
            
          </div>
          <div className={clsx('col col--10', styles.calcInstruction)}>
            <label htmlFor="pageSize">What is your page cache size?</label>
            <p>Open your <code>netdata.conf</code> file and find the <code>page cache size</code> setting in the <code>[global]</code> section.</p>
          </div>
        </div>
      </div>

      <div className={clsx("col col--12", styles.calcResults)}>

        <div className={styles.calcFinal}>
          <p>With the above configuration, Netdata will use the following resources{state.child > 0 && <em>&nbsp;on your parent node</em>} to store metrics{state.child > 0 && <span>&nbsp;for both parent and child nodes</span>}: </p>
          <span>
            <code>{requiredDisk} MiB</code> in total disk space
          </span>
          <span>
            <code>{requiredRAM} MiB</code> in system memory
          </span>
        </div>

        <div className={styles.calcConfig}>
          <p>To enable this setup, edit the <code>netdata.conf</code> file&nbsp;
            {state.child > 0 &&
              <em>on your parent node&nbsp;</em>
            }
            and change the <code>dbengine multihost disk space</code> setting to the following:
          </p>
          <CodeBlock className={clsx('conf')} language='conf'>{conf}</CodeBlock>
          <p>Restart your Agent for the setting to take effect.</p>
          {state.child > 0 ? (
            <p>Your Agent now stores metrics for {state.parent + state.child} nodes (1 parent and {state.child} child node{state.child > 1 && <span>s</span>}) for {state.retention} day{state.retention !== 1 && <span>s</span>} using a total of <code>{requiredDisk} MiB</code> in disk space.</p>
          ) : (
            <p>Your Agent now stores metrics for {state.retention} day{state.retention !== 1 && <span>s</span>} using a total of <code>{requiredDisk} MiB</code> in disk space.</p>
          )}
        </div>

        <div className={styles.calcNotes}>
          <h3>Notes</h3>
          <ul>
            {state.child > 0 && (
              <>
                <li>
                  <p>Your parent node uses one shared dbengine multi-host instance to store all metrics values and associated metadata from all parent and child nodes. To store the volume and granularity of metrics specified above, the instance must be large enough for all metrics/metadata from all nodes.</p>
                  <p><code>{diskPerNode} MiB per node * 1 parent node + {state.child} child node{state.child > 1 && <span>s</span>} = {requiredDisk} MiB</code></p>
                  <p>See the <Link href="/docs/agent/database/engine">dbengine documentation</Link> for details on how the Agent allocates database engine instances.</p>
                </li>
              </>
            )}
            <li>The database engine requires a minimum disk space, which is reflected in this calculator. This required space is the maximum between your <code>dbengine multihost disk space</code>/<code>dbengine disk space</code> setting and <code>dimensions-being-collected * 4096 * 2</code>.</li>
            <li>The system memory figure above is <em>only for the database engine</em>, and it may be higher in real-world situations due to memory fragmentation. The Agent will require additional memory for collection, visualization, and alerting features.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
