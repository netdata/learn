const axios = require('axios')
const frontmatter = require('front-matter')
const { Remarkable } = require('remarkable')

var doc = `<!--
---
title: Health monitoring
description: "Use hundreds of pre-configured alarms, write new alarms, and integrate alarm notifications with dozens of
popular systems."
custom_edit_url: <https://github.com/netdata/netdata/edit/master/health/README.md>
keywords:
-   health monitoring
-   alerts
---
-->

# Health monitoring

With Netdata, you can monitor the health and performance of your systems and applications. You start with hundreds of
alarms that have been pre-configured by the Netdata community, but you can write new alarms, tune existing ones, or
silence any that you're not interested in.

Netdata creates charts dynamically, and runs an independent thread to constantly evaluate them, which means Netdata
operates like a health watchdog for your services and applications.

You can even run statistical algorithms against the metrics you've collected to power complex lookups. Your imagination,
and the needs of your infrastructure, are your only limits.

**Take the next steps with health monitoring:**

<DocsSteps>

[<FiPlay /> Quickstart](QUICKSTART.md)

[<FiCode /> Configuration reference](REFERENCE.md)

[<FiBook /> Tutorials](#tutorials)

</DocsSteps>

## Tutorials

Every infrastructure is different, so we're not interested in mandating how you should configure Netdata's health
monitoring features. Instead, these tutorials should give you the details you need to tweak alarms to your heart's
content.

<DocsTutorials>
<div>

### Health entities

[Stopping notifications for individual alarms](tutorials/stop-notifications-alarms.md)

[Use dimension templates to create dynamic alarms](tutorials/dimension-templates.md)

</div>
</DocsTutorials>

## Related features

**[Health notifications](notifications/README.md)**: Get notified about Netdata's alarms via your favorite platform(s).

[![analytics](https://www.google-analytics.com/collect?v=1&aip=1&t=pageview&_s=1&ds=github&dr=https%3A%2F%2Fgithub.com%2Fnetdata%2Fnetdata&dl=https%3A%2F%2Fmy-netdata.io%2Fgithub%2Fhealth%2FREADME&_u=MAC~&cid=5792dfd7-8dc4-476b-af31-da2fdb9f93d2&tid=UA-64295674-3)](<>)
`

function sanitize(doc) {
  // strip comment tags around frontmatter
  doc = doc.replace(/^<!--\s+(---\s+.*?\s+---)\s+-->/gs, '$1')

  // strip level 1 heading
  doc = doc.replace(/^#\s+.*/m, '')

  // strip analytics pixel
  doc = doc.replace(/^\[\!\[analytics\].*/m, '')

  return doc
}

// const sanitized = sanitize(doc)

// parse frontmatter
// const fm = frontmatter(sanitized)

// console.log(sanitized)
// console.log(fm.attributes)

// var md = new Remarkable()

// bb951397e6ba4934885c74242d9152183eb58646

async function get(url) {
  // const response = await axios.get('https://raw.githubusercontent.com/joelhans/netdata/frontmatter-health/health/README.md')
  const { data } = await axios.get(url)

  return data.reduce(async (acc, item) => {
    if (item.type === 'file') {
      if (item.download_url.endsWith('.md')) {
        acc.push(item.download_url)
      }
    // } else if (item.type === 'dir') {
    //   const childUrls = await get(item.url)
    //   acc.concat(childUrls)
    }

    return acc
  }, [])

  // const reses = await Promise.all(downloadUrls.map(url => axios.get(url)))
  // const sanitizeds = reses.map(({ data }) => sanitize(data))

  // console.log(sanitizeds)
}

get('https://api.github.com/repos/joelhans/netdata/contents/health?ref=master')
.then((urls) => {
  console.log(urls)
})

// TODO: remove remarkable?
// TODO: remove yaml
