// Loads the same pages from two served Learn builds (A = before, B = after) in
// headless Chromium and reports only what differs between them: screenshots,
// console errors, failed requests and simple functional checks.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';
import pngjs from 'pngjs';

const { PNG } = pngjs;

const { values: args } = parseArgs({
  options: {
    a: { type: 'string' },
    b: { type: 'string' },
    config: { type: 'string' },
    out: { type: 'string' },
  },
});

for (const name of ['a', 'b', 'config', 'out']) {
  if (!args[name]) {
    console.error(`browser-check: missing --${name}`);
    process.exit(2);
  }
}

const config = JSON.parse(readFileSync(args.config, 'utf8'));

// Every setting is required: a missing number compares as undefined, which
// would silently accept every difference or skip every wait. No fallbacks.
function configError(message) {
  console.error(`browser-check: invalid config ${args.config}: ${message}`);
  process.exit(2);
}
if ('maxDiffRatio' in config) {
  configError('"maxDiffRatio" was replaced by "maxDiffPixels" (an absolute pixel count, 5 in the shipped config)');
}
const REQUIRED_NUMBERS = [
  'navigationTimeoutMs', 'networkIdleTimeoutMs', 'waitForTimeoutMs', 'checkTimeoutMs', 'settleMs',
  'maxScreenshotHeight', 'pixelThreshold', 'maxDiffPixels', 'retries',
];
for (const key of REQUIRED_NUMBERS) {
  if (!Number.isFinite(config[key]) || config[key] < 0) configError(`"${key}" must be a number >= 0`);
}
for (const key of ['blockHosts', 'globalMask', 'pages']) {
  if (!Array.isArray(config[key])) configError(`"${key}" must be an array`);
}
if (!config.viewport || !Number.isFinite(config.viewport.width) || !Number.isFinite(config.viewport.height)) {
  configError('"viewport" must have numeric "width" and "height"');
}

const CHECK_TYPES = new Set(['selectorCount', 'search', 'clickNavigates']);
for (const page of config.pages) {
  for (const check of page.checks ?? []) {
    if (!CHECK_TYPES.has(check.type)) {
      console.error(`browser-check: page "${page.name}" has unknown check type "${check.type}"`);
      process.exit(2);
    }
  }
}

const origins = [new URL(args.a).origin, new URL(args.b).origin];

function isBlocked(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  return config.blockHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

// Makes the same problem produce the same text on both sides: the two builds
// run on different ports and have different asset hashes and line numbers.
function normalize(text) {
  let out = text;
  for (const origin of origins) out = out.split(origin).join('<site>');
  return out
    .replace(/\b[0-9a-f]{8,}\b/g, '<hash>')
    .replace(/:\d+:\d+\b/g, ':<line>')
    .replace(/\?[^\s)'"]*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

async function runCheck(page, check) {
  const timeout = check.timeoutMs ?? config.checkTimeoutMs;
  try {
    if (check.type === 'selectorCount') {
      await page.locator(check.selector).first().waitFor({ state: 'attached', timeout });
      return (await page.locator(check.selector).count()) >= (check.min ?? 1);
    }
    if (check.type === 'search') {
      const input = page.locator(check.input).first();
      await input.click({ timeout });
      await input.fill(check.query);
      await page.locator(check.result).first().waitFor({ state: 'visible', timeout });
      return true;
    }
    if (check.type === 'clickNavigates') {
      const before = page.url();
      await page.locator(check.selector).first().click({ timeout });
      await page.waitForURL((url) => url.toString() !== before, { timeout });
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function capture(browser, baseUrl, pageConfig, shotPath) {
  const context = await browser.newContext({
    viewport: pageConfig.viewport ?? config.viewport,
    colorScheme: pageConfig.colorScheme ?? 'light',
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'UTC',
  });
  await context.route('**/*', (route) => (isBlocked(route.request().url()) ? route.abort('blockedbyclient') : route.continue()));
  const page = await context.newPage();
  const errors = new Set();
  const failed = new Set();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.add(normalize(message.text()));
  });
  page.on('pageerror', (error) => errors.add(normalize(`pageerror: ${error.message}`)));
  page.on('requestfailed', (request) => {
    if (!isBlocked(request.url())) failed.add(normalize(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`));
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && !isBlocked(response.url())) failed.add(normalize(`${response.status()} ${response.url()}`));
  });

  const result = { loadError: null, errors: [], failed: [], checks: [], shot: null, pageSize: null };
  try {
    await page.goto(baseUrl + pageConfig.path, { waitUntil: 'load', timeout: config.navigationTimeoutMs });
    await page.waitForLoadState('networkidle', { timeout: config.networkIdleTimeoutMs }).catch(() => {});
    if (pageConfig.waitFor) {
      await page.waitForSelector(pageConfig.waitFor, { timeout: config.waitForTimeoutMs }).catch(() => {});
    }
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    await page.waitForTimeout(config.settleMs);

    // Screenshot first: the checks below type into search and navigate away.
    const viewport = page.viewportSize();
    // The real page size, compared separately: screenshots are capped at
    // maxScreenshotHeight, and added blank space can look like no change.
    const { pageWidth, pageHeight } = await page.evaluate(() => ({
      pageWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight,
    }));
    result.pageSize = `${pageWidth}x${pageHeight}`;
    const masks = [...config.globalMask, ...(pageConfig.mask ?? [])].map((selector) => page.locator(selector));
    await page.screenshot({
      path: shotPath,
      fullPage: true,
      clip: { x: 0, y: 0, width: viewport.width, height: Math.min(pageHeight, config.maxScreenshotHeight) },
      animations: 'disabled',
      caret: 'hide',
      mask: masks,
      maskColor: '#FF00FF',
    });
    result.shot = shotPath;

    for (const check of pageConfig.checks ?? []) {
      result.checks.push({ name: check.name, pass: await runCheck(page, check) });
    }
  } catch (error) {
    result.loadError = error.message.split('\n')[0];
  }
  result.errors = [...errors].sort();
  result.failed = [...failed].sort();
  await context.close();
  return result;
}

// pixelmatch paints changed pixels pure red; unchanged ones become grey.
function changedRows(diff) {
  let first = -1;
  let last = -1;
  for (let y = 0; y < diff.height; y += 1) {
    for (let x = 0; x < diff.width; x += 1) {
      const i = (y * diff.width + x) * 4;
      if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) {
        if (first < 0) first = y;
        last = y;
        break;
      }
    }
  }
  return first < 0 ? null : { first, last };
}

const CROP_MARGIN = 80;
const CROP_MAX_HEIGHT = 1600;

function writeCrop(image, rows, file) {
  const y0 = Math.max(0, rows.first - CROP_MARGIN);
  const height = Math.min(image.height, rows.last + CROP_MARGIN + 1, y0 + CROP_MAX_HEIGHT) - y0;
  const crop = new PNG({ width: image.width, height });
  PNG.bitblt(image, crop, 0, y0, image.width, height, 0, 0);
  writeFileSync(file, PNG.sync.write(crop));
}

function compareImages(dir) {
  const a = PNG.sync.read(readFileSync(path.join(dir, 'A.png')));
  const b = PNG.sync.read(readFileSync(path.join(dir, 'B.png')));
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  // Pad the smaller image so a change in page height counts as a difference.
  const pad = (image) => {
    if (image.width === width && image.height === height) return image;
    const padded = new PNG({ width, height });
    // Opaque magenta, never a page colour. Transparent padding would blend to
    // white in pixelmatch and hide a taller page's added blank space.
    for (let i = 0; i < padded.data.length; i += 4) {
      padded.data[i] = 255;
      padded.data[i + 1] = 0;
      padded.data[i + 2] = 255;
      padded.data[i + 3] = 255;
    }
    PNG.bitblt(image, padded, 0, 0, image.width, image.height, 0, 0);
    return padded;
  };
  const paddedA = pad(a);
  const paddedB = pad(b);
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(paddedA.data, paddedB.data, diff.data, width, height, { threshold: config.pixelThreshold });
  const rows = pixels > 0 ? changedRows(diff) : null;
  if (pixels > 0) writeFileSync(path.join(dir, 'diff.png'), PNG.sync.write(diff));
  if (rows) {
    // Crops of only the changed area, so the reviewer does not scroll a full page.
    writeCrop(paddedA, rows, path.join(dir, 'A-crop.png'));
    writeCrop(paddedB, rows, path.join(dir, 'B-crop.png'));
    writeCrop(diff, rows, path.join(dir, 'diff-crop.png'));
  }
  return {
    pixels,
    ratio: pixels / (width * height),
    sizeA: `${a.width}x${a.height}`,
    sizeB: `${b.width}x${b.height}`,
    rows,
  };
}

const without = (list, other) => list.filter((item) => !other.includes(item));

async function comparePage(browser, pageConfig, attempt) {
  const dir = path.join(args.out, pageConfig.name);
  mkdirSync(dir, { recursive: true });
  // A then B right away, so external content has little time to drift.
  const a = await capture(browser, args.a, pageConfig, path.join(dir, 'A.png'));
  const b = await capture(browser, args.b, pageConfig, path.join(dir, 'B.png'));

  const report = {
    name: pageConfig.name,
    path: pageConfig.path,
    attempt,
    problems: [],
    notes: [],
    visual: null,
    newErrors: without(b.errors, a.errors),
    goneErrors: without(a.errors, b.errors),
    newFailed: without(b.failed, a.failed),
    checks: [],
  };

  if (a.loadError && b.loadError) report.problems.push(`page failed on both sides: ${b.loadError}`);
  else if (b.loadError) report.problems.push(`page failed only after the change: ${b.loadError}`);
  else if (a.loadError) report.notes.push(`page failed only before the change: ${a.loadError}`);

  let visualChange = false;
  if (a.shot && b.shot) {
    report.visual = compareImages(dir);
    if (report.visual.pixels > (config.maxDiffPixels ?? 20)) {
      visualChange = true;
      report.notes.push('visual difference above tolerance');
    }
  }
  if (a.pageSize && b.pageSize && a.pageSize !== b.pageSize) {
    visualChange = true;
    report.notes.push(`page size changed: ${a.pageSize} → ${b.pageSize} px`);
  }
  if (report.newErrors.length > 0) report.problems.push(`${report.newErrors.length} new console error(s)`);
  if (report.newFailed.length > 0) report.problems.push(`${report.newFailed.length} new failed request(s)`);

  const checksB = new Map(b.checks.map((check) => [check.name, check.pass]));
  for (const { name, pass: passA } of a.checks) {
    const passB = checksB.get(name) ?? false;
    let state = 'pass';
    if (passA && !passB) {
      state = 'REGRESSION';
      report.problems.push(`check "${name}" broke`);
    } else if (!passA && !passB) {
      state = 'fails on both (fix the check selector)';
    } else if (!passA && passB) {
      state = 'fixed by the change';
    }
    report.checks.push({ name, state });
  }

  if (report.problems.length > 0) report.verdict = 'REGRESSION';
  else if (visualChange) report.verdict = 'REVIEW';
  // Changed pixels within the tolerance: not a failure, but never shown as OK.
  else if (report.visual?.pixels > 0) report.verdict = 'MINOR';
  else report.verdict = 'OK';
  return report;
}

// REVIEW and REGRESSION fail the run and are retried; OK and MINOR do not.
const needsAttention = (report) => report.verdict === 'REVIEW' || report.verdict === 'REGRESSION';

// Exit 2 = the tool failed (Chromium missing, crash), never a verdict on the
// change; run.sh and CI rely on 1 meaning only "the change needs attention".
function toolFailure(message, error) {
  console.error(`browser-check: ${message}: ${error?.stack ?? error}`);
  process.exit(2);
}
process.on('uncaughtException', (error) => toolFailure('unexpected error', error));
process.on('unhandledRejection', (error) => toolFailure('unexpected error', error));

let browser;
try {
  browser = await chromium.launch();
} catch (error) {
  toolFailure('cannot launch Chromium (run "run.sh setup")', error);
}
const reports = [];
let runError = null;
try {
  for (const pageConfig of config.pages) {
    let report = await comparePage(browser, pageConfig, 1);
    for (let attempt = 2; needsAttention(report) && attempt <= config.retries + 1; attempt += 1) {
      const retry = await comparePage(browser, pageConfig, attempt);
      if (!needsAttention(retry)) {
        const reasons = [...report.problems, ...report.notes, ...report.newErrors.map((e) => `new error: ${e}`), ...report.newFailed.map((f) => `new failed request: ${f}`)];
        retry.notes.push(`flaky: attempt ${attempt - 1} was ${report.verdict} (${reasons.join('; ') || 'no details'})`);
      }
      report = retry;
    }
    console.log(`${report.verdict.padEnd(10)} ${pageConfig.name}`);
    reports.push(report);
  }
} catch (error) {
  runError = error;
} finally {
  await browser.close().catch(() => {});
}
if (runError) toolFailure('page comparison failed', runError);

writeFileSync(path.join(args.out, 'browser.json'), `${JSON.stringify(reports, null, 2)}\n`);

const percent = (ratio) => `${(ratio * 100).toFixed(3)}%`;
const lines = ['## Browser comparison', ''];
lines.push('| Page | Verdict | Visual diff | New errors | New failed requests | Checks |');
lines.push('|---|---|---|---|---|---|');
for (const r of reports) {
  const visual = r.visual ? `${r.visual.pixels} px (${percent(r.visual.ratio)})${r.visual.sizeA !== r.visual.sizeB ? ` (${r.visual.sizeA} → ${r.visual.sizeB})` : ''}` : 'n/a';
  const checks = r.checks.length === 0 ? '-' : r.checks.filter((c) => c.state === 'pass').length + '/' + r.checks.length + ' pass';
  lines.push(`| ${r.name} | **${r.verdict}** | ${visual} | ${r.newErrors.length} | ${r.newFailed.length} | ${checks} |`);
}
lines.push('');
for (const r of reports) {
  const details = [];
  for (const problem of r.problems) details.push(`- Problem: ${problem}`);
  for (const note of r.notes) details.push(`- Note: ${note}`);
  for (const check of r.checks.filter((c) => c.state !== 'pass')) details.push(`- Check "${check.name}": ${check.state}`);
  for (const error of r.newErrors) details.push(`- New error: \`${error}\``);
  for (const request of r.newFailed) details.push(`- New failed request: \`${request}\``);
  for (const error of r.goneErrors) details.push(`- Error gone after the change: \`${error}\``);
  if (r.visual?.pixels > 0) details.push(`- Images: open \`report.html#${r.name}\``);
  if (details.length > 0) lines.push(`### ${r.name} (\`${r.path}\`)`, '', ...details, '');
}
writeFileSync(path.join(args.out, 'browser.md'), `${lines.join('\n')}\n`);

const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const list = (title, items) => (items.length === 0 ? '' : `<h3>${escape(title)}</h3><ul>${items.map((i) => `<li><code>${escape(i)}</code></li>`).join('')}</ul>`);

function pageSection(r) {
  const v = r.visual;
  const where = v?.rows ? ` Changed area: rows ${v.rows.first}-${v.rows.last} px from the top.` : '';
  const images = v?.rows
    ? `<p>Changed area only.${escape(where)} Click the left image to flip between A and B in place: what moves is what changed.</p>
      <div class="grid">
        <figure class="flip" data-a="${r.name}/A-crop.png" data-b="${r.name}/B-crop.png"><figcaption>Flip: <b>A (before)</b></figcaption><img src="${r.name}/A-crop.png" data-side="A" alt="A"></figure>
        <figure><figcaption>B (after)</figcaption><img src="${r.name}/B-crop.png" alt="B"></figure>
        <figure><figcaption>Diff (red = changed)</figcaption><img src="${r.name}/diff-crop.png" alt="diff"></figure>
      </div>
      <p class="quiet">Full pages: <a href="${r.name}/A.png">A</a> · <a href="${r.name}/B.png">B</a> · <a href="${r.name}/diff.png">diff</a>.
      Magenta areas are masked on purpose (external widgets).</p>`
    : !v
    ? '<p class="quiet">No screenshot: the page failed to load on at least one side.</p>'
    : `<details><summary>No visual difference. Show both screenshots</summary>
        <div class="grid two">
          <figure><figcaption>A (before)</figcaption><a href="${r.name}/A.png"><img src="${r.name}/A.png" loading="lazy" alt="A"></a></figure>
          <figure><figcaption>B (after)</figcaption><a href="${r.name}/B.png"><img src="${r.name}/B.png" loading="lazy" alt="B"></a></figure>
        </div>
      </details>`;
  return `<section id="${r.name}">
    <h2>${escape(r.name)} <span class="verdict ${r.verdict}">${r.verdict}</span></h2>
    <p>Live (while <code>run.sh serve</code> runs): <a href="${args.a}${r.path}" target="_blank">A ${escape(r.path)}</a> · <a href="${args.b}${r.path}" target="_blank">B ${escape(r.path)}</a></p>
    ${list('Problems', r.problems)}${list('Notes', r.notes)}
    ${list('Checks not passing', r.checks.filter((c) => c.state !== 'pass').map((c) => `${c.name}: ${c.state}`))}
    ${list('New console errors (only in B)', r.newErrors)}${list('New failed requests (only in B)', r.newFailed)}
    ${list('Errors gone after the change', r.goneErrors)}
    ${images}
  </section>`;
}

const flagged = reports.filter((r) => r.verdict !== 'OK' || r.visual?.pixels > 0 || r.goneErrors.length > 0);
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dependency impact report</title>
<style>
  body { font: 14px/1.5 system-ui, sans-serif; margin: 24px; color: #1b1f24; background: #fff; }
  table { border-collapse: collapse; margin: 12px 0 24px; }
  th, td { border: 1px solid #d0d7de; padding: 4px 10px; text-align: left; }
  section { border-top: 1px solid #d0d7de; padding-top: 8px; margin-top: 24px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .grid.two { grid-template-columns: repeat(2, 1fr); margin-top: 8px; }
  summary { cursor: pointer; color: #57606a; }
  figure { margin: 0; } figcaption { font-weight: 600; margin-bottom: 4px; }
  img { width: 100%; border: 1px solid #d0d7de; }
  .flip { cursor: pointer; } .flip img { outline: 3px solid #0969da; }
  .verdict { font-size: 13px; padding: 2px 8px; border-radius: 4px; color: #fff; }
  .OK { background: #1a7f37; } .MINOR { background: #57606a; } .REVIEW { background: #9a6700; } .REGRESSION { background: #cf222e; }
  .quiet { color: #57606a; } code { font-size: 12px; }
</style></head><body>
<h1>Dependency impact report</h1>
<p>A = before (merge base), B = after (the change). Same content on both sides, so every difference comes from the dependencies.</p>
<table><tr><th>Page</th><th>Verdict</th><th>Visual diff</th><th>New errors</th><th>New failed requests</th></tr>
${reports.map((r) => `<tr><td><a href="#${r.name}">${escape(r.name)}</a></td><td><span class="verdict ${r.verdict}">${r.verdict}</span></td><td>${r.visual ? `${r.visual.pixels} px (${percent(r.visual.ratio)})` : 'n/a'}</td><td>${r.newErrors.length}</td><td>${r.newFailed.length}</td></tr>`).join('\n')}
</table>
${flagged.length === 0 ? '<p><b>No page shows any difference.</b> Each page below still has its screenshots and live links.</p>' : ''}
${reports.map(pageSection).join('\n')}
<script>
  for (const figure of document.querySelectorAll('.flip')) {
    figure.addEventListener('click', () => {
      const img = figure.querySelector('img');
      const toB = img.dataset.side === 'A';
      img.src = toB ? figure.dataset.b : figure.dataset.a;
      img.dataset.side = toB ? 'B' : 'A';
      figure.querySelector('b').textContent = toB ? 'B (after)' : 'A (before)';
    });
  }
</script>
</body></html>
`;
writeFileSync(path.join(args.out, 'report.html'), html);

process.exit(reports.some(needsAttention) ? 1 : 0);
