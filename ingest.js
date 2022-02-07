const axios = require('axios')
const fs = require('fs').promises
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

// See the README.md for instructions to set up a GitHub access token.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const MIN_RATE_LIMIT = 50

// Set the GitHub user and branch for every repo that this script
// ingests.

const repo_config = {
  //default values
  netdata_user: 'netdata',
  netdata_branch: 'master',
  github_user: 'netdata',
  github_branch: 'main',
  go_d_plugin_user: 'netdata',
  go_d_plugin_branch: 'master',
  agent_service_discovery_user: 'netdata',
  agent_service_discovery_branch: 'master'
}

const baseDir = '/docs'
const agentDir = '/docs/agent'
const guideDir = '/guides/'
const contribDir = '/contribute/'
const outDir = path.join(__dirname, agentDir)

const ax = axios.create({
  baseURL: `https://api.github.com/repos/`,
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`
  }
})

async function getRateLimit() {
  const { data: { rate } } = await ax.get('https://api.github.com/rate_limit')

  const resetDate = new Date(parseInt(rate.reset, 10) * 1000)
  const resetMilliseconds = resetDate - new Date()
  const resetSeconds = Math.ceil(resetMilliseconds / 1000)
  const resetMinutes = Math.ceil(resetMilliseconds / 1000 / 60)

  return {
    ...rate,
    resetDate,
    resetMilliseconds,
    resetSeconds,
    resetMinutes
  }
}

async function getRootSha(user = 'netdata', repo = 'netdata', branch = 'master') {
  const { data: { commit: { sha } } } = await ax.get(`${user}/${repo}/branches/${branch}`)
  return sha
}

async function getNodes(rootSha, user = 'netdata', repo = 'netdata') {
  const { data: { tree } } = await ax.get(`${user}/${repo}/git/trees/${rootSha}?recursive=true`)
  return tree
}

function prefixNodes(nodes, prefix) {
  return nodes.map(node => {
    return {
      ...node,
      path: path.join(prefix, node.path)
    }
  })
}

function filterNodes(nodes, includePatterns=[], excludePatterns=[]) {
  return nodes.filter(node => (
    node.type === 'blob' && // include only files (blobs)
    includePatterns.every(p => node.path.match(p)) &&
    excludePatterns.every(p => !node.path.match(p))
  ))
}

async function getPages(nodes) {
  return Promise.all(nodes.map(async node => {
    const { data: { content } } = await ax.get(node.url)

    return {
      meta: { ...node },
      body: Buffer.from(content, 'base64').toString('utf-8')
    }
  }))
}

function moveDocs(pages) {
  return pages.map(page => {
    return {
      meta: {
        ...page.meta,
        path: page.meta.path.startsWith('docs/') ? page.meta.path.slice(5) : page.meta.path
      },
      body: page.body
    }
  })
}

function normalizeLinks(pages) {
  return pages.map(page => {
    const tokens = path.parse(page.meta.path)

    const body = page.body.replace(/\]\((.*?)\)/gs, (match, url) => {

      // For links started with `https://learn.netdata.cloud/`, cut that and
      // leave the rest of the path in place. Return the normalized link.
      if (url.startsWith('https://learn.netdata.cloud/')) return `](${url.split('https://learn.netdata.cloud')[1]})`

      // Skip the whole process if a relative anchor, external link, or a mailto
      // link. Return the normalized link.
      if (url.startsWith('#') || url.startsWith('http') || url.startsWith('mailto')) return `](${url})`

      // Exceptions to accomodate the new documentation structure, with many
      // documents in various `/docs/X` folders.
      if (url.includes('docs/get-started.mdx') || url.includes('docs/overview') || url.includes('docs/collect/') || 
          url.includes('docs/configure/') || url.includes('docs/export/') || url.includes('docs/configure/') || 
          url.includes('docs/monitor/') || url.includes('docs/quickstart/') || url.includes('docs/store/') ||  
          url.includes('docs/metrics-storage-management') || url.includes('docs/dashboard') || url.includes('docs/visualize/')) {
        return `](${url})`
      }

      // If the link is to a guide page in the `/docs/guides` folder.
      if (url.includes('guides/')) {
        url = url.split('guides/')[1]
        const guideUrl =  path.join(guideDir, url)
        return `](${guideUrl})`
      }

      // If the link is to a step-by-step guide page in the `/docs/step-by-step`
      // folder.
      if (url.includes('step-by-step/') || url.includes('step-')) {
        if (url.includes('step-by-step/')) {
          url = url.split('step-by-step/')[1]
        }
        const guideUrl =  path.join(guideDir, 'step-by-step', url)
        return `](${guideUrl})`
      }

      // If the link is to one of a few contributing-related documents.
      if (url.includes('contributing-documentation')) {
        const contribUrl =  path.join(contribDir, 'documentation')
        return `](${contribUrl})`
      } else if (url.includes('style-guide')) {
        const contribUrl =  path.join(contribDir, 'style-guide')
        return `](${contribUrl})`
      } else if (url.includes('code_of_conduct')) {
        const contribUrl =  path.join(contribDir, 'code-of-conduct')
        return `](${contribUrl})`
      } else if (url.includes('contributing.md')) {
        const contribUrl =  path.join(contribDir, 'handbook')
        return `](${contribUrl})`
      } else if (url.includes('contributors.md')) {
        const contribUrl =  path.join(contribDir, 'license')
        return `](${contribUrl})`
      }


      // If the link is already absolute-relative. If it begins with `/docs`,
      // cut that. Return the normalized link.
      if (url.startsWith('/')) {
        if (url.startsWith('/docs')) {
          url = url.replace('/docs', '')
        }
        const absRelUrl = path.join(agentDir, url)
        return `](${absRelUrl})`
      }

      // Catch for anything else. Return the normalized link.
      const normalizedUrl = path.join('/', agentDir, '/', tokens.dir, url).toLowerCase()
      return `](${normalizedUrl})`
    })

    return {
      meta: { ...page.meta },
      body
    }
  })
}

// rename readme after parent directory, then move it up a directory
function renameReadmes(pages) {
  return pages.map(page => {
    const tokens = path.parse(page.meta.path)

    const pagePath = tokens.base.toLowerCase() === 'readme.md' && tokens.dir.length
      ? tokens.dir + tokens.ext
      : page.meta.path

    const body = page.body.replace(/\]\((.*?)\)/gs, (match, url) => {
      if (url.startsWith('http')) return `](${url})`

      // // we need to extract any hash and querystring args
      // const parsedUrl = new URL(url, 'http://__FAKE__')

      const urlTokens = path.parse(url)
      const renameUrl = (
        urlTokens.base.toLowerCase().startsWith('readme.md') &&
        urlTokens.dir.length
      )
        ? urlTokens.dir + urlTokens.ext// + parsedUrl.hash + parsedUrl.search
        : url

      return `](${renameUrl.toLowerCase()})`
    })

    return {
      meta: {
        ...page.meta,
        path: pagePath
      },
      body
    }
  })
}

// remove .md extensions from links in pages so they are all slashes
function beautifyLinks(pages) {
  return pages.map(page => {
    const body = page.body.replace(/\]\((.*?)\)/gs, (match, url) => {
      // ignore absolute urls and external links alone
      const prettyUrl = url.startsWith('http')
        ? url
        : url.replace(/\.mdx?/gs, '')
      return `](${prettyUrl})`
    })

    return {
      meta: { ...page.meta },
      body
    }
  })
}

// read files that we want to keep into memory
async function retainFiles(retainPaths=[]) {
  return Promise.all(retainPaths.map(async p => {
    const relativePath = `.${p}`
    const f = await fs.readFile(relativePath, { encoding: 'utf8' })
    return [p, f]
  }))
}

// restore files from memory back to the file system
// expects an array of arrays [[path, file], [path, file], ...]
async function restoreFiles(files=[]) {
  return Promise.all(files.map(async ([p, f]) => {
    const relativePath = `.${p}`
    await fs.mkdir(path.dirname(relativePath), { recursive: true })
    return fs.writeFile(relativePath, f, { encoding: 'utf8' })
  }))
}

async function clearDir(dir) {
  await fs.rmdir(dir, { recursive: true })
}


function sanitize(doc) {
  // Strip comment tags around frontmatter. Both strip commands exist as we have
  // .md files that begin with both comments `<!--` and frontmatter `---`.
  // Eventually, we'll just put the frontmatter in basic HTML comments and
  // replace using the second command.
  doc = doc.replace(/^<!--\s+(---\s+.*?\s+---)\s+-->/gs, '$1')
  doc = doc.replace(/^<!--\s+(.*?)-->/gs, '---\n$1---')

  // strip level 1 heading
  doc = doc.replace(/^#\s+.*/m, '')

  // strip analytics pixel
  doc = doc.replace(/^\[\!\[analytics\].*/m, '')

  // TODO: strip github badges

  return doc
}

function sanitizePages(pages) {
  return pages.map(page => ({
    ...page,
    body: sanitize(page.body)
  }))
}

async function writePages(pages) {
  return Promise.all(pages.map(async (page) => {
    let fullPath = path.join(outDir, page.meta.path).toLowerCase()
    let fullDir = path.dirname(fullPath)

    // This whole thing is really ugly.
    if (fullPath.includes('agent/overview')) {
      fullPath = fullPath.replace('docs/agent/overview', 'docs/overview/');
      fullDir = fullDir.replace('docs/agent/overview', 'docs/overview/');
    } else if (fullPath.includes('docs/agent/get-started.mdx') && !fullPath.includes('getting-started')) {
      fullPath = fullPath.replace('docs/agent/get-started.mdx', 'docs/get-started.mdx');
      fullDir = fullDir.replace('docs/agent/', 'docs/');
    } else if (fullPath.includes('agent/quickstart')) {
      fullPath = fullPath.replace('docs/agent/quickstart', 'docs/quickstart/');
      fullDir = fullDir.replace('docs/agent/quickstart', 'docs/quickstart/');
    } else if (fullPath.includes('agent/configure')) {
      fullPath = fullPath.replace('docs/agent/configure', 'docs/configure/');
      fullDir = fullDir.replace('docs/agent/configure', 'docs/configure/');
    } else if (fullPath.includes('docs/agent/collect') && !fullPath.includes('agent/collectors')) {
      fullPath = fullPath.replace('docs/agent/collect', 'docs/collect/');
      fullDir = fullDir.replace('docs/agent/collect', 'docs/collect/');
    } else if (fullPath.includes('agent/dashboard')) {
      fullPath = fullPath.replace('docs/agent/dashboard', 'docs/dashboard/');
      fullDir = fullDir.replace('docs/agent/dashboard', 'docs/dashboard/');
    } else if (fullPath.includes('agent/visualize')) {
      fullPath = fullPath.replace('docs/agent/visualize', 'docs/visualize/');
      fullDir = fullDir.replace('docs/agent/visualize', 'docs/visualize/');
    } else if (fullPath.includes('agent/monitor')) {
      fullPath = fullPath.replace('docs/agent/monitor', 'docs/monitor/');
      fullDir = fullDir.replace('docs/agent/monitor', 'docs/monitor/');
    } else if (fullPath.includes('agent/store')) {
      fullPath = fullPath.replace('docs/agent/store', 'docs/store/');
      fullDir = fullDir.replace('docs/agent/store', 'docs/store/');
    } else if (fullPath.includes('agent/metrics-storage-management')) {
      fullPath = fullPath.replace('docs/agent/metrics-storage-management', 'docs/metrics-storage-management/');
      fullDir = fullDir.replace('docs/agent/metrics-storage-management', 'docs/metrics-storage-management/');
    } else if (fullPath.includes('agent/export') && !fullPath.includes('agent/exporting')) {
      fullPath = fullPath.replace('docs/agent/export', 'docs/export/');
      fullDir = fullDir.replace('docs/agent/export', 'docs/export/');
    }

    // Move anything from the `/docs/guides` folder into the new `guides` folder.
    if (fullPath.includes('agent/guides')) {
      fullPath = fullPath.replace('docs/agent/guides/', 'guides/');
      fullDir = fullDir.replace('docs/agent/guides/', 'guides/');
    }
    
    // Move content from .github repo.
    if (fullPath.includes('docs/agent/contribute/contributing.md')) {
      fullPath = fullPath.replace('docs/agent/contribute/contributing.md', './contribute/handbook.md');
      fullDir = fullDir.replace('docs/agent/contribute/', 'contribute/');
    } else if (fullPath.includes('docs/agent/contribute/code_of_conduct.md')) {
      fullPath = fullPath.replace('docs/agent/contribute/code_of_conduct.md', './contribute/code-of-conduct.md');
      fullDir = fullDir.replace('docs/agent/contribute/', 'contribute/');
    } else if (fullPath.includes('docs/agent/contribute/security.md')) {
      fullPath = fullPath.replace('docs/agent/contribute/security.md', './contribute/security.md');
      fullDir = fullDir.replace('docs/agent/contribute/', 'contribute/');
    } else if (fullPath.includes('docs/agent/contribute/support.md')) {
      fullPath = fullPath.replace('docs/agent/contribute/support.md', './contribute/support.md');
      fullDir = fullDir.replace('docs/agent/contribute/', 'contribute/');
    } else if (fullPath.includes('docs/agent/contributors.md')) {
      fullPath = fullPath.replace('docs/agent/contributors.md', './contribute/license.md');
      fullDir = fullDir.replace('docs/agent/', 'contribute/');
    }

    // Move various contribution documents to alternative locations.
    if (fullPath.includes('docs/agent/contributing/contributing-documentation.md')) {
      fullPath = fullPath.replace('docs/agent/contributing/contributing-documentation.md', 'contribute/documentation.md');
      fullDir = fullDir.replace('docs/agent/contributing', 'contribute/');
    } else if (fullPath.includes('docs/agent/contributing/style-guide.md')) {
      fullPath = fullPath.replace('docs/agent/contributing/style-guide.md', 'contribute/style-guide.md');
      fullDir = fullDir.replace('docs/agent/contributing', 'contribute/');
    }

    await fs.mkdir(fullDir, { recursive: true })
    await fs.writeFile(fullPath, page.body)
  }))
}

async function debugMetas(pages, filename = 'debug.txt') {
  const metas = pages.map(page => page.meta)
  await fs.writeFile(filename, JSON.stringify(metas, null, 2), { encoding: 'utf8' })
}

async function ingest() {
  const rate = await getRateLimit()
  console.log(`Rate limit ${rate.remaining} / ${rate.limit} requests per hour remaining. Resets at ${rate.date} (${rate.resetMinutes} minutes from now).`)

  // ensure we have enough remaining rate to perform node fetching
  if (rate.remaining < MIN_RATE_LIMIT) {
    console.error('Rate limit too low. Retry in ${rate.resetMinutes} minutes.')
    return
  }

  // change defaults from argv
  for (let i = 2; i < process.argv.length; i++) {
    [arg_key, arg_value] = process.argv[i].split(":")
    try {
      repo_config[arg_key] = arg_value
    } catch (error) {
      console.error("Wrong argument parse in the ingest script, check the usage in the README.md")
    }
  }

  console.log(`Fetching root SHA for '${repo_config.netdata_user}/netdata' repo`)
  const rootSha = await getRootSha(repo_config.netdata_user, 'netdata', repo_config.netdata_branch)
  console.log(`Fetching nodes from ${repo_config.netdata_branch} branch of ${repo_config.netdata_user}/netdata repo...`)
  const nodes = await getNodes(rootSha)

  console.log(`Fetching root SHA for '${repo_config.github_user}/.github' repo...`)
  const ghRootSha = await getRootSha(repo_config.github_user, '.github', repo_config.github_branch)
  console.log(`Fetching nodes from ${repo_config.github_branch} branch of  '${repo_config.github_user}/.github' repo...`)
  const ghNodes = await getNodes(ghRootSha, repo_config.github_user, '.github')

  console.log(`Fetching root SHA for 'go.d.plugin' repo...`)
  const goRootSha = await getRootSha(repo_config.go_d_plugin_user, 'go.d.plugin', repo_config.go_d_plugin_branch)
  console.log(`Fetching nodes from ${repo_config.go_d_plugin_branch} branch of '${repo_config.go_d_plugin_user}/go.d.plugin' repo...`)
  const goNodes = await getNodes(goRootSha, repo_config.go_d_plugin_user, 'go.d.plugin')

  console.log(`Fetching root SHA for '${repo_config.agent_service_discovery_user}/agent-service-discovery' repo...`)
  const sdRootSha = await getRootSha(repo_config.agent_service_discovery_user, 'agent-service-discovery',
      repo_config.agent_service_discovery_branch)
  console.log(`Fetching nodes from ${repo_config.agent_service_discovery_branch} branch of '${repo_config.agent_service_discovery_user}/agent-service-discovery' repo...`)
  const sdNodes = await getNodes(sdRootSha, repo_config.agent_service_discovery_user, 'agent-service-discovery')

  const ghPrefixedNodes = prefixNodes(ghNodes, '/contribute/')
  const goPrefixedNodes = prefixNodes(goNodes, 'collectors/go.d.plugin/')
  const sdPrefixedNodes = prefixNodes(sdNodes, 'collectors/go.d.plugin/modules/service-discovery/')

  const combinedNodes = [...nodes, ...ghPrefixedNodes, ...goPrefixedNodes, ...sdPrefixedNodes]

  const filteredNodes = filterNodes(
    combinedNodes,
    includePatterns=[
      /^[^\.].*?\.mdx?$/, // only .md and .mdx files
    ],
    excludePatterns=[
      /^\./, // exclude dot files and directories
      /^README\.md/, // exclude root readme
      /docs\/README\.md/, // exclude /docs/readme
      /DOCUMENTATION\.md/,
      /HISTORICAL_CHANGELOG\.md/,
      /contrib\/sles11\/README\.md/,
      /^CODE_OF_CONDUCT\.md/, // exclude root Code of Conduct
      /\/contribute\/README\.md/, // exclude root README.md from .github repo
      /^CONTRIBUTING\.md/, // exclude root CONTRIBUTING.md
      /dev\.md/, // Exclude the `dev.md` docs from the go.d.plugin repo
    ]
  )
  console.log(`Filtering ${combinedNodes.length} nodes to ${filteredNodes.length}`)

  if (filteredNodes.length > rate.remaining) {
    console.error(`Rate limit too low to fetch all documents. Retry in ${rate.resetMinutes} minutes.`)
    return
  }

  console.log(`Fetching ${filteredNodes.length} pages...`)
  const fetchStartTime = new Date()

  const pages = await getPages(filteredNodes)

  const fetchEndTime = new Date()
  console.log(`Fetching completed in ${fetchEndTime - fetchStartTime} ms`)

  console.log(`Moving /docs to root`)
  const movedPages = moveDocs(pages)
  // await debugMetas(movedPages, 'debug-moved.txt')

  console.log(`Sanitizing ${pages.length} pages`)
  const sanitizedPages = sanitizePages(movedPages)
  // await debugMetas(sanitizedPages, 'debug-sanitized.txt')

  console.log(`Renaming README.md files`)
  const renamedPages = renameReadmes(sanitizedPages)

  console.log(`Normalizing links in ${pages.length} pages`)
  const normalizedPages = normalizeLinks(renamedPages)
  // await debugMetas(normalizedPages, 'debug-normalized.txt')

  console.log(`Beautifying URLs...`)
  const beautifiedPages = beautifyLinks(normalizedPages)
  // await debugMetas(beautifiedPages, 'debug-beautified.txt')

  console.log('Clearing', agentDir)
  await clearDir(`.${agentDir}`)

  console.log(`Writing ${beautifiedPages.length} to ${agentDir}`)
  const writeStartTime = new Date()

  await writePages(beautifiedPages)

  const writeEndTime = new Date()
  console.log(`Writing completed in ${writeEndTime - writeStartTime} ms`)

  const rateAfter = await getRateLimit()
  console.log(`Rate limit ${rateAfter.remaining} / ${rateAfter.limit} requests per hour remaining. Reset in ${rateAfter.resetMinutes} minutes.`)
}

if (GITHUB_TOKEN) {
  ingest()

  //TODO: remove, testing normalize links
  // const p = [{
  //   meta: {
  //     path: 'collectors/go.d.plugin/pkg/matcher/README.md'
  //   },
  //   body: 'this [whatever](#ding) is [testing](../something/README.md#whatever)'
  // }]

  // console.log(p)
  // const r = renameReadmes(p)
  // console.log(r)
  // const n = normalizeLinks(r)
  // console.log(n)
  // const b = beautifyLinks(n)
  // console.log(b)
} else {
  console.warn('Missing GITHUB_TOKEN environment variable. Rate limit will be reduced from 5000 to 60 requests per hour.')
}
