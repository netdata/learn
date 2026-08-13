import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home() {
  return (
    <Layout
      title="Netdata documentation"
      description="Learn how to install, configure, monitor, and troubleshoot systems and applications with Netdata."
    >
      <main className="container margin-vert--xl">
        <h1>Netdata documentation</h1>
        <p>
          Find practical guidance for installing Netdata, collecting metrics, and
          troubleshooting your infrastructure.
        </p>
        <ul>
          <li>
            <Link to="/docs/getting-started">Get started with Netdata</Link>
          </li>
          <li>
            <Link to="/docs/collecting-metrics">Browse collectors and integrations</Link>
          </li>
          <li>
            <Link to="/docs/ask-nedi">Ask Nedi about Netdata</Link>
          </li>
        </ul>
      </main>
    </Layout>
  );
}
