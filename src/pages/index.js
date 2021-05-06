import React from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { Grid, Box } from '@site/src/components/Grid'
import { News, Release } from '@site/src/data/News'
import HeroImage from '/static/img/hero.svg'

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="overflow-hidden bg-gradient-to-br from-gray-200 to-gray-50 dark:from-gray-800 dark:to-gray-900 py-16 mb-16">
      <div className="container relative">
        <div className="z-10 relative w-full md:w-3/4 lg:w-1/2">
          <h1 className="text-2xl lg:text-5xl text-text font-semibold mb-6 dark:text-gray-50">{siteConfig.title}</h1>
          <p className="prose text-lg lg:text-xl text-text dark:text-gray-50">{siteConfig.tagline}</p>
        </div>
        <div className="z-0 absolute hidden lg:block -top-24 -right-24">
          <HeroImage />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main className="container">
        <Grid className="mb-16" columns="3">
          <Box 
            to="/docs/get-started/"
            title="Get started"
            cta="Install now"
            image={true}>
            Install the open-source monitoring agent on physical/virtual systems running most Linux distributions (Ubuntu, Debian, CentOS, and more), container platforms (Kubernetes clusters, Docker), and many other operating systems, with no <code>sudo</code> required.
          </Box>
          <Box 
            to="/docs/"
            title="Docs"
            cta="Read the docs"
            image={false}>
            Solution- and action-based docs for Netdata's many features and capabilities. Your table of contents to becoming an expert in using Netdata to monitor and troubleshoot applications and their infrastructure.
          </Box>
          <Box 
            to="/guides/"
            title="Guides"
            cta="Start learning"
            image={false}>
            Thoughtful guides to walk you through collecting the right metrics, monitoring your infrastructure, troubleshooting with Netdata's powerful visualizations, and much more.
          </Box>
        </Grid>
        <div id="updates" className="relative flex flex-row flex-wrap pb-12">
          <div className="relative w-full lg:w-3/4">
            <h2 className="z-10 relative text-xl lg:text-3xl font-semibold mb-6">What's new at Netdata?</h2>
            <div className="z-0 absolute top-4 -bottom-8 left-1.5">
              <div className="z-10 relative w-4 h-16 top-0 bg-gradient-to-t from-transparent to-white dark:to-gray-darkbg"></div>
              <div className="z-0 absolute top-0 w-1 h-full bg-green-lighter bg-opacity-20"></div>
              <div className="z-10 absolute w-4 h-16 bottom-0 bg-gradient-to-b from-transparent to-white dark:to-gray-darkbg"></div>
            </div>
            <ul>
              {News.map((props, idx) => (
                <li key={`${props.title}-${idx}`} className="group">
                  <Link to={props.href} className="grid md:grid-cols-8 xl:grid-cols-9 items-start">
                    <div className="md:col-start-3 md:col-span-6 xl:col-start-3 xl:col-span-7 p-8 rounded group-hover:bg-gray-50 dark:group-hover:bg-gray-800">
                      <h3 className="text-lg lg:text-xl font-semibold mb-2">{props.title}</h3>
                      <p>{props.description}</p>
                    </div>
                    <div className="flex items-center md:col-start-1 md:col-span-2 row-start-1 md:row-end-3 pt-8">
                      <div className="z-10 w-4 h-4 mr-8 bg-green rounded-full group-hover:bg-blue" />
                      <time className="text-base text-gray-500 font-medium uppercase dark:text-gray-400">{props.date}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 markdown prose-lg ml-0 lg:ml-8 mt-16">
            <h2 className="z-10 relative text-lg lg:text-2xl font-semibold mb-6">
              Latest major release 
              <span class="flex items-center font-semibold">
                <code className="text-base">v1.30.0</code>
                <span className="text-base mx-2">•</span>
                <time className="text-base text-gray-500 font-medium uppercase dark:text-gray-400">March 31, 2021</time>
              </span>
            </h2>
            <ul>
              {Release.map((props, idx) => (
                <li key={props} dangerouslySetInnerHTML={{ __html: props }}></li>
              ))}
            </ul>
            <p>Read the <Link to="https://github.com/netdata/netdata/releases">release notes</Link> or <Link to="/docs/agent/packaging/installer/update"> update now</Link>.</p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
