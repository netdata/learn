const axios = require('axios')
const frontmatter = require('front-matter')
const fs = require('fs').promises
const path = require('path')

// TODO: do not write root readme.md or docs/readme.md
// TODO: move contents of docs up a level
// TODO: link sanitization
// TODO: readme to pretty url?
// TODO: error handling

// TODO: remove remarkable
// TODO: remove yaml
// TODO: remove frontmatter

const githubToken = 'bb951397e6ba4934885c74242d9152183eb58646'
const baseDir = './junk'
const outDir = path.join(__dirname, baseDir)

const ax = axios.create({
  baseURL: 'https://api.github.com/repos/joelhans/netdata/',
  headers: {
    'Authorization': `token ${githubToken}`
  }
})

async function getRootSha() {
  const { data: { commit: { sha } } } = await ax.get('branches/master')
  return sha
}

async function getNodes(rootSha) {
  // TODO: use proper URL building
  const { data } = await ax.get(`git/trees/${rootSha}?recursive=true`)

  return data.tree.filter(node => (
    node.type === 'blob' &&
    node.path.match(/^[^\.].*?\.md$/) // exclude dot folders, include markdown
  ))
}

async function getPages(nodes) {
  return Promise.all(nodes.map(async node => {
    const { data: { content: rawDoc } } = await ax.get(node.url)

    return {
      meta: { ...node },
      body: Buffer.from(rawDoc, 'base64').toString('binary')
    }
  }))
}

async function transformPages(pages) {

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
  pages.forEach(async (page) => {
    const fullPath = path.join(outDir, page.meta.path).toLowerCase()
    // because the page path may contain additional directories
    const fullDir = path.dirname(fullPath)
    await fs.mkdir(fullDir, { recursive: true })

    await fs.writeFile(fullPath, page.body)
  })
}

async function ingest() {
  const rootSha = await getRootSha()
  console.log('rootSha', rootSha)

  const nodes = await getNodes(rootSha)

  console.log(`Fetching ${nodes.length} pages...`)
  const fetchStartTime = new Date()

  const pages = await getPages(nodes)

  const fetchEndTime = new Date()
  console.log(`Fetching completed in ${fetchEndTime - fetchStartTime} ms`)

  const sanitizedPages = sanitizePages(pages)
  console.log(`Sanitizing ${pages.length} pages`)

  console.log('Clearing', baseDir)
  await clearDir(baseDir)

  console.log(`Writing ${sanitizedPages.length} to ${baseDir}`)
  const writeStartTime = new Date()

  writePages(sanitizedPages)

  const writeEndTime = new Date()
  console.log(`Writing completed in ${writeEndTime - writeStartTime} ms`)
}

ingest()
