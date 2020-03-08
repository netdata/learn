const axios = require('axios')
const frontmatter = require('front-matter')
const fs = require('fs').promises
const path = require('path')

// TODO: move contents of docs up a level
// TODO: readme to pretty url?
// TODO: error handling

// TODO: remove remarkable, yaml, frontmatter

const githubToken = 'bb951397e6ba4934885c74242d9152183eb58646'
const baseDir = './docs'
const outDir = path.join(__dirname, baseDir)

const ax = axios.create({
  baseURL: 'https://api.github.com/repos/joelhans/netdata/',
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

async function getRootSha() {
  const { data: { commit: { sha } } } = await ax.get('branches/master')
  return sha
}

async function getNodes(rootSha) {
  const { data: { tree } } = await ax.get(`git/trees/${rootSha}?recursive=true`)
  return tree
}

function filterNodes(nodes) {
  return nodes.filter(node => (
    node.type === 'blob' && // include only files (blobs)
    !node.path.startsWith('.') && // exclude dot folders
    !node.path.startsWith('README.md') && // exclude root readme
    !node.path.startsWith('docs/README.md') && // exclude /docs/readme
    node.path.match(/^[^\.].*?\.md$/) // include only markdown
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

function normalizeLinks(pages) {
  return pages.map(page => {
    const tokens = path.parse(page.meta.path)

    const body = page.body.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
      return `[${text}](${path.join(baseDir, tokens.dir, url)})`
    })

    return {
      meta: { ...page.meta },
      body
    }
  })
}

function renameReadmes(pages) {
  return pages.map(page => {
    const tokens = path.parse(page.meta.path)

    const pagePath = tokens.base.toLowerCase() === 'readme.md' && tokens.dir.length
      ? tokens.dir + tokens.ext
      : page.meta.path

    // TODO: update readme links
    const body = page.body

    return {
      meta: {
        ...page.meta,
        path: pagePath
      },
      body
    }
  })
}

async function clearDir(dir) {
  return fs.rmdir(dir, { recursive: true })
}

function sanitize(doc) {
  // strip comment tags around frontmatter
  doc = doc.replace(/^<!--\s+(---\s+.*?\s+---)\s+-->/gs, '$1')

  // strip level 1 heading
  doc = doc.replace(/^#\s+.*/m, '')

  // strip analytics pixel
  doc = doc.replace(/^\[\!\[analytics\].*/m, '')

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
  console.log(`Rate limit ${rate.remaining} / ${rate.limit} requests per hour remaining. Reset in ${rate.resetMinutes} minutes.`)

  const rootSha = await getRootSha()
  console.log('rootSha', rootSha)

  const nodes = await getNodes(rootSha)
  const filteredNodes = filterNodes(nodes)

  console.log(`Fetching ${filteredNodes.length} pages...`)
  const fetchStartTime = new Date()

  const pages = await getPages(filteredNodes)

  const fetchEndTime = new Date()
  console.log(`Fetching completed in ${fetchEndTime - fetchStartTime} ms`)

  console.log(`Sanitizing ${pages.length} pages`)
  const sanitizedPages = sanitizePages(pages)

  console.log(`Normalizing links in ${pages.length} pages`)
  const normalizedPages = normalizeLinks(sanitizedPages)

  console.log(`Renaming README.md files`)
  const renamedPages = renameReadmes(normalizedPages)

  console.log('Clearing', baseDir)
  await clearDir(baseDir)

  console.log(`Writing ${renamedPages.length} to ${baseDir}`)
  const writeStartTime = new Date()

  await writePages(renamedPages)

  const writeEndTime = new Date()
  console.log(`Writing completed in ${writeEndTime - writeStartTime} ms`)

  const rateAfter = await getRateLimit()
  console.log(`Rate limit ${rateAfter.remaining} / ${rateAfter.limit} requests per hour remaining. Reset in ${rateAfter.resetMinutes} minutes.`)
}

ingest()
