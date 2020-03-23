const axios = require('axios')
const fs = require('fs').promises
const path = require('path')

// TODO: strip github badges, see /docs/what-is-netdata
// TODO: error handling

// see the README.md for instructions to set up a github access token
const githubToken = process.env.GITHUB_TOKEN
const baseDir = './docs'
const outDir = path.join(__dirname, baseDir)
// the following files will not be cleared during the clearDir step
// necessary to keep local docs that are not fetched from other repos
const retainPaths = [
  path.join(baseDir, 'introduction.md')
]

const ax = axios.create({
  baseURL: 'https://api.github.com/repos/netdata/',
  headers: {
    'Authorization': `token ${githubToken}`
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

async function getRootSha(repo = 'netdata', branch = 'master') {
  const { data: { commit: { sha } } } = await ax.get(`${repo}/branches/${branch}`)
  return sha
}

async function getNodes(rootSha, repo = 'netdata') {
  const { data: { tree } } = await ax.get(`${repo}/git/trees/${rootSha}?recursive=true`)
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
      body: Buffer.from(content, 'base64').toString('binary')
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
      body: page.body.replace(/\]\((.*?)docs\/(.*?)\)/gs, ']($1$2)')
    }
  })
}

function normalizeLinks(pages) {
  return pages.map(page => {
    const tokens = path.parse(page.meta.path)

    const body = page.body.replace(/\]\((.*?)\)/gs, (match, url) => {
      const normalizedUrl = url.startsWith('http')
        ? url
        : path.join('/', baseDir, tokens.dir, url).toLowerCase()
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

      // we need to extract any hash and querystring args
      const parsedUrl = new URL(url, 'http://__FAKE__')

      const urlTokens = path.parse(url)
      const renameUrl = (
        urlTokens.base.toLowerCase().startsWith('readme.md') &&
        urlTokens.dir.length
      )
        ? urlTokens.dir + urlTokens.ext + parsedUrl.hash + parsedUrl.search
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

// read files that we want to keep into memory
async function retainFiles(retainPaths=[]) {
  return Promise.all(retainPaths.map(async p => {
    const f = await fs.readFile(p, { encoding: 'utf8' })
    return [p, f]
  }))
}

// restore files from memory back to the file system
// expects an array of arrays [[path, file], [path, file], ...]
async function restoreFiles(files=[]) {
  return Promise.all(files.map(async ([p, f]) => {
    await fs.mkdir(path.dirname(p), { recursive: true })
    return fs.writeFile(p, f, { encoding: 'utf8' })
  }))
}

async function clearDir(dir) {
  await fs.rmdir(dir, { recursive: true })
}


function sanitize(doc) {
  // strip comment tags around frontmatter
  doc = doc.replace(/^<!--\s+(---\s+.*?\s+---)\s+-->/gs, '$1')

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
    const fullPath = path.join(outDir, page.meta.path).toLowerCase()
    // because the page path may contain additional directories
    const fullDir = path.dirname(fullPath)
    await fs.mkdir(fullDir, { recursive: true })

    await fs.writeFile(fullPath, page.body)
  }))
}

async function ingest() {
  const rate = await getRateLimit()
  console.log(`Rate limit ${rate.remaining} / ${rate.limit} requests per hour remaining. Resets at ${rate.date} (${rate.resetMinutes} minutes from now).`)

  // ensure we have enough remaining rate to perform node fetching
  if (rate.remaining < 50) {
    console.error('Rate limit reached. Retry in ${rate.resetMinutes} minutes.')
    return
  }

  console.log(`Fetching root SHA for 'netdata' repo...`)
  const rootSha = await getRootSha('netdata')
  console.log(`Fetching nodes from 'netdata' repo...`)
  const nodes = await getNodes(rootSha)

  console.log(`Fetching root SHA for 'go.d.plugin' repo...`)
  const goRootSha = await getRootSha('go.d.plugin')
  console.log(`Fetching nodes from 'go.d.plugin' repo...`)
  const goNodes = await getNodes(goRootSha, 'go.d.plugin')

  const goPrefixedNodes = prefixNodes(goNodes, 'collectors/go.d.plugin/')

  const combinedNodes = [...nodes, ...goPrefixedNodes]

  const filteredNodes = filterNodes(
    combinedNodes,
    includePatterns=[
      /^[^\.].*?\.md$/ // only markdown files
    ],
    excludePatterns=[
      /^\./, // exclude dot files and directories
      /^README\.md/, // exclude root readme
      /docs\/README\.md/, // exclude /docs/readme
      /DOCUMENTATION\.md/,
      /HISTORICAL_CHANGELOG\.md/,
      /contrib\/sles11\/README\.md/,
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

  console.log(`Sanitizing ${pages.length} pages`)
  const sanitizedPages = sanitizePages(movedPages)

  console.log(`Normalizing links in ${pages.length} pages`)
  const normalizedPages = normalizeLinks(sanitizedPages)

  console.log(`Renaming README.md files`)
  const renamedPages = renameReadmes(normalizedPages)

  console.log('Retaining files...')
  retainPaths.map(f => console.log(`  ${f}`))
  const retainedFiles = await retainFiles(retainPaths)

  console.log('Clearing', baseDir)
  await clearDir(baseDir, ['./introduction.md'])

  console.log('Restoring files...')
  retainedFiles.map(([p]) => console.log(`  ${p}`))
  await restoreFiles(retainedFiles)

  console.log(`Writing ${renamedPages.length} to ${baseDir}`)
  const writeStartTime = new Date()

  await writePages(renamedPages)

  const writeEndTime = new Date()
  console.log(`Writing completed in ${writeEndTime - writeStartTime} ms`)

  const rateAfter = await getRateLimit()
  console.log(`Rate limit ${rateAfter.remaining} / ${rateAfter.limit} requests per hour remaining. Reset in ${rateAfter.resetMinutes} minutes.`)
}

if (githubToken) {
  ingest()
} else {
  console.warn('Missing GITHUB_TOKEN environment variable. Rate limit will be reduced from 5000 to 60 requests per hour.')
}
