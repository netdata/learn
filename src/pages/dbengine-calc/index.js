import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Select from 'react-select';
import styles from './styles.module.css';

function Wizard() {
  const [state, setState] = React.useState({
    master: 1,
    slaves: 0,
    dims: 2000,
    update: 1,
    retention: 14,
    compression: 56.5,
    pageSize: 32,

  })

  const [finalDisk, setFinalDisk] = React.useState('')
  const [finalRAM, setFinalRAM] = React.useState('')

  useEffect(() => {
    const nodes = state.master + state.slaves
    const totalDims = nodes * state.dims
    const totalPoints = (totalDims / state.update) * state.retention * 24 * 3600
    const uncompressedPageSize = 4096
    const pointsPerPage = 1024
    const maxPages = totalPoints / pointsPerPage
    const pageSize = uncompressedPageSize / 1024 / 1024
    const uncompressedStorage = maxPages * pageSize
    const requiredDisk = uncompressedStorage * ( 1 - (state.compression / 100))
    const cacheRAM = state.pageSize * nodes
    const dimPages = totalDims * uncompressedPageSize * 2 / 1024 / 1024
    const metadata = uncompressedStorage * 0.03
    const requiredRAM = cacheRAM + dimPages + metadata

    setFinalDisk(Math.round(requiredDisk))
    setFinalRAM(Math.round(requiredRAM))

  });

  const handleChange = (evt) => {
    const value = parseFloat(evt.target.value);
    setState({
      ...state,
      [evt.target.name]: value
    })
  }

  // function changeBackground(e) {
  //   e.target.style.background = 'red';
  // }

  return (
    <Layout
      title={`Calculate `}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero', styles.heroBanner)}>
        <div className="container">
          <div className="row">
            <div className="col col--9">
              <h1 className="hero__title">RAM and disk usage calculator</h1>
              <p>The Agent's database engine uses RAM to store your real-time metrics, then "spills" historical metrics to disk for efficient long-term storage.</p>
              <p>This calculator helps you determine how much RAM and disk the Agent will use based on how many slave nodes you have, the frequency at which you collect metrics, and <em>how long you can retain your metrics</em>.</p>
              <p><blockquote>⚠️ This calculator provides an <em>estimate</em> of disk and RAM usage. Real-life usage may vary based on the accuracy of the values you put here, or due to changes in the compression ratio.</blockquote></p>
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className="container">
          
          <div className="row">
            <div className="col col--6">
              <form className={classnames(styles.calcForm)}>
                
                <label htmlFor="retention">How many days do you want to store your metrics?</label>
                <input type="number" id="retention" name="retention" value={state.retention} onChange={handleChange} />

                <label htmlFor="update">How often, on average, do your Agents collect metrics?</label>
                <input type="number" id="update" name="update" value={state.update} onChange={handleChange} />

                <label htmlFor="dims">How many dimensions, on average, do your Agents collect?</label>
                <input type="number" id="dims" name="dims" min="0" value={state.dims} onChange={handleChange} />

                <label htmlFor="slaves">How many slave streaming nodes do you have?</label>
                <input type="number" id="slaves" name="slaves" min="0" value={state.slaves} onChange={handleChange} />

                <label htmlFor="compression">What is your compression savings ratio?</label>
                <input type="number" id="compression" name="compression" value={state.compression} onChange={handleChange} />

                <label htmlFor="pageSize">What is your page cache size?</label>
                <input type="number" id="pageSize" name="pageSize" value={state.pageSize} onChange={handleChange} />
              </form>
            </div>
            <div class="col col--6">
              <p>Instructions go here.</p>
            </div>
          </div>

          <div className="row">
            <div className={classnames("col col--6", styles.results)}>

              <p></p>

              <input type="number" id="finalDisk" name="finalDisk" value={finalDisk} readOnly />
              <input type="number" id="finalRAM" name="finalRAM" value={finalRAM} readOnly />

            </div>
          </div>
          
        </section>
      </main>
    </Layout>
  );
}

export default Wizard;