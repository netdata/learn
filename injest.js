const axios = require('axios')
const frontmatter = require('front-matter')
const fs = require('fs').promises
const path = require('path')
// const { Remarkable } = require('remarkable')

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

// bb951397e6ba4934885c74242d9152183eb58646

// TODO: filter pattern
async function getPages(root, pattern) {
  // TODO: use proper URL building
  const { data } = await axios.get(`${root}?recursive=true`)

  const node = data.tree.find(node => node.path === 'README.md')

  // decode base64 content
  const { data: { content: rawDoc } } = await axios.get(node.url)

  return [{
    meta: node,
    body: Buffer.from(rawDoc, 'base64').toString('binary')
  }]
}

const baseDir = 'junk'
const outDir = path.join(__dirname, baseDir)

async function ingest() {
  const pages = await getPages('https://api.github.com/repos/joelhans/netdata/git/trees/5434e1b4d1317cad1d87757b7aef2e8093f209fc')

  pages.forEach(async (page) => {
    const fullPath = path.join(outDir, page.meta.path)
    // because the page path may contain additional directories
    const fullDir = path.dirname(fullPath)
    await fs.mkdir(fullDir, { recursive: true })
    await fs.writeFile(fullPath, page.body)
  })

  // const sanitized = sanitize(doc)
}

ingest()

// TODO: remove remarkable?
// TODO: remove yaml
