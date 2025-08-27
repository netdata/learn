import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Box } from '@site/src/components/Grid';
import AskNetdataInline from '@site/src/components/AskNetdataInline';

import { News } from '@site/src/data/News';
import HeroImage from '/static/img/hero.svg';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className="overflow-hidden bg-gradient-to-br from-gray-200 to-gray-50 dark:from-gray-800 dark:to-gray-900 py-10 mb-10">
      <div className="container relative">
        <div className="z-10 relative w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-xl lg:text-4xl font-semibold mb-3 text-text dark:text-gray-50">
            {siteConfig.title}
          </h1>
          <p className="prose text-base lg:text-lg text-text dark:text-gray-50">
            {siteConfig.tagline}
          </p>
        </div>
        <div className="z-0 absolute hidden lg:block -top-24 -right-1 w-1/3 max-w-sm">
          <HeroImage />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout description="Here you'll find documentation and reference material for monitoring and troubleshooting your systems with Netdata.">
      <HomepageHeader />
      <main className="container">
        {/* === Left stack + Chat grid (keep width logic) === */}
        <div
          className="mb-16"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2.6fr',   // width stays as you had it
            gap: 'var(--col-gap)',
            alignItems: 'start',
            // Tweak these to control heights:
            '--col-gap': '1rem',
            '--ai-header-h': '48px',           // AskNetdataInline header height 
            '--chat-iframe-h': '400px',        // AskNetdataInline `height` prop below
            '--chat-h': 'calc(var(--ai-header-h) + var(--chat-iframe-h))',
          }}
        >
          {/* Left column: two boxes whose combined height == chat height */}
          <div
            className="grid"
            style={{
              gap: 'var(--col-gap)',
              gridTemplateRows:
                'calc((var(--chat-h) - var(--col-gap)) / 2) calc((var(--chat-h) - var(--col-gap)) / 2)',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <Box
              className="h-full"
              to="/docs/getting-started/"
              title="Get started"
              cta="Install now"
              image
            >
              Install on Linux, containers, Kubernetes — no <code>sudo</code> needed.
            </Box>

            <Box
              className="h-full"
              to="/docs/welcome-to-netdata"
              title="Docs"
              cta="Read the docs"
            >
              Action-based docs to monitor &amp; troubleshoot fast.
            </Box>
          </div>

          {/* Right column: container height matches left stack */}
          <div
            style={{
              height: 'var(--chat-h)',
              minWidth: 0,
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            {/* The widget keeps its own header visible; iframe height is --chat-iframe-h */}
            <AskNetdataInline height={400} className="w-full" />
          </div>
        </div>

        {/* === Timeline === */}
        <div id="updates" className="relative flex flex-row flex-wrap pb-12">
          <div className="relative w-full">
            <h2 className="z-10 relative text-xl lg:text-3xl font-semibold mb-6">
              What's new at Netdata?
            </h2>

            {/* vertical line */}
            <div className="z-0 absolute top-4 -bottom-8 left-1.5">
              <div className="z-0 absolute top-0 w-1 h-full nd-timeline-line" id="timeline" />
            </div>

            <ul>
              {News.map((props, idx) => (
                <li key={idx} className="group nd-timeline-item">
                  <Link
                    to={props.href}
                    className="grid md:grid-cols-8 xl:grid-cols-9 items-start"
                  >
                    {/* center content */}
                    <div className="nd-timeline-content md:col-start-3 md:col-span-6 xl:col-start-3 xl:col-span-7 p-6 md:p-8 rounded">
                      <h3 className="text-lg lg:text-xl font-semibold mb-2">
                        {props.title}
                      </h3>
                      <p>{props.description}</p>
                    </div>

                    {/* left rail: dot + date */}
                    <div className="flex items-center md:col-start-1 md:col-span-2 row-start-1 md:row-end-3 pt-8">
                      <div className="nd-timeline-dot mr-8" />
                      <time className="text-base font-medium uppercase">
                        {props.date}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}
