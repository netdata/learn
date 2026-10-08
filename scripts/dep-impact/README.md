# dep-impact

A local reviewer tool. It answers one question for a Dependabot PR: **does this dependency change alter the rendered site?**

It builds the site twice, A (the PR's merge base) and B (the PR head). A and B have the same content and differ only in dependencies, so any difference comes from the PR. It runs four layers, cheapest first:

1. **Build:** does B still build?
2. **Rendered output:** did any file in `build/` change? Content hashes in asset names are ignored.
3. **Browser:** about 10 key pages are loaded from both builds in headless Chromium. It compares screenshots, console errors, failed requests and simple functional checks (diagram drawn, search shows results, API endpoints listed, navigation works).
4. **Human look:** only when layer 3 reports something. Open the diff images.

If the rendered output is identical, the browser step is skipped: identical files mean identical pages.

Everything is compared **A against B**. An error that already exists today shows up on both sides and is ignored. Only new errors are reported.

## Requirements

- Node 22, Yarn 1.22, git, curl
- `gh` (GitHub CLI, logged in) for `pr` mode
- About 6 GB of free RAM per build, 8 GB or more with `--parallel`
- Disk space for two worktrees with `node_modules` and `build/` (several GB), outside the repo by default

## Setup (once)

```bash
scripts/dep-impact/run.sh setup
```

This installs Playwright, pixelmatch and pngjs into `scripts/dep-impact/node_modules` (ignored by git) and downloads headless Chromium. Commit the generated `scripts/dep-impact/package-lock.json`.

## First: calibrate the noise baseline

Before trusting results, check that the tool reports nothing when nothing changed.

```bash
# 1. Browser noise only: one build served twice (one build, quick)
scripts/dep-impact/run.sh calibrate --same-build

# 2. Build noise too: the same revision built twice
scripts/dep-impact/run.sh calibrate
```

Both should end with `NO IMPACT FOUND`. If not, tune `config.json` (see below) and rerun with `--skip-build`, which reuses the builds, until both are clean.

## Review a PR

```bash
scripts/dep-impact/run.sh pr 3091
scripts/dep-impact/run.sh refs <base> <head>       # any two revisions
```

The script first lists the changed files. It warns about files outside the dependency manifests, and stops early when no npm file changed (`--force` overrides).

## Reading the result

The text summary is printed at the end and saved to `../learn-dep-impact/results/latest/summary.md`.

When there is a difference, inspect it in this order:

1. **Visual report:** `open ../learn-dep-impact/results/latest/report.html`. For each page with a difference it shows the problems, then a crop of **only the changed area** side by side: A, B and the diff (red = changed). Click the first image to **flip between A and B in place**: what moves is what changed. Links to the full-page images are below each crop. Magenta areas are masked on purpose (external widgets).
2. **Live pages:** `scripts/dep-impact/run.sh serve` serves the last A and B builds again and prints each page's URL pair. Open both in two tabs and compare them with DevTools (layout, network, console). Ctrl-C stops the servers.

| Verdict | Meaning | Action |
|---|---|---|
| `NO IMPACT FOUND` | Output identical, or no page needs review (each page OK or MINOR) | Merge; comment "no rendered impact" |
| `MINOR` (page) | 1 to `maxDiffPixels` pixels changed, nothing broken | Not a failure. Glance at `report.html` if the PR should not change anything visible |
| `REVIEW` (page) | The change altered the page without breaking it: screenshot or page size differs, or something improved (a check that failed now passes, console errors gone, a page that failed now loads) | Open `report.html`, flip A/B, confirm the difference or improvement is real and wanted |
| `REGRESSION` (page) | New console errors, new failed requests, a check that broke, or the page fails to load, only after the change | Do not merge; attach the details to the PR |
| `BROKEN` (page) | A check fails, or the page fails to load, before **and** after the change | Not caused by the change, but the run fails on purpose: find the root cause on `master` (wrong selector, feature already broken, or an external service such as Ask Nedi or the swagger spec unavailable), fix it, then come back to the Dependabot PRs |
| Build failed (B only) | The change breaks the build | Do not merge; comment with the log tail |

"Changed JavaScript contains code of: …" in the output section names the features whose code changed (mermaid, swagger-ui, search…). Look at those pages first.

Exit codes: `0` no impact found, `1` needs attention, `2` tool or setup problem.

## Tuning `config.json`

| Key | Purpose |
|---|---|
| `pages` | Pages to compare: `path`, optional `viewport`, `colorScheme`, `waitFor`, `mask`, `checks` |
| `pages[].mask` / `globalMask` | CSS selectors painted over in screenshots on both sides (external widgets like Ask Nedi, dynamic content) |
| `pages[].checks` | `selectorCount` (element exists), `search` (typing shows results), `clickNavigates` (a link changes the page) |
| `blockHosts` | Analytics and tracking hosts blocked in the browser |
| `maxDiffPixels` | Changed pixels allowed before a page needs review (5 in the shipped config). Required, like every setting here: a missing or invalid value stops the run with exit code 2. An absolute count: a share of a tall page hides real changes (with 0.1%, links turned red on every page still passed on 4 of 9 pages). Measured noise is 0 px; one changed letter in the navbar is 18-23 px. |
| `retries` | Re-run a page that is not OK; a pass on retry is reported as flaky |
| `outputIgnorePaths` | Regexes for build files to skip in the output comparison (for example `^sitemap\\.xml$`) |
| `contentIgnorePatterns` | Regexes removed from file content before comparing (for example build timestamps) |
| `featureMarkers` | Strings that identify a feature's code in changed JavaScript |

The Ask Nedi widget (`#nedi-persistent`) must stay masked: it shows a different greeting on every load, so its pixels never match. The "chat input appears" check still verifies that it loads.

A check that fails on **both** sides makes the page `BROKEN` and fails the run, even though the change did not cause it. That is deliberate: it stops Dependabot reviews until the root cause is fixed on `master`. If an external service was only briefly unavailable, rerun the job.

## Safety

The tool installs and builds code from the PR on your machine. Dependency install scripts are off by default (`--ignore-scripts`). If both builds fail because of that, use `--allow-scripts` for trusted PRs. The build itself still runs dependency code. For PRs from unknown sources, run the tool in a disposable VM.

## Clean up

```bash
scripts/dep-impact/run.sh clean    # removes ../learn-dep-impact (worktrees, builds, results)
```
