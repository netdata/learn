# Learn first-touch implementation ledger

Status: implemented; local qualification passed. Deployment acceptance remains open.

## Purpose and approved scope

Preserve the first executable Learn page, sender, campaign and timestamp through browsing and
App navigation using the existing `nd_first_touch` version 2 cookie and `nd_ft` URL parameter.
No new storage, SDK identity operations, backend dependency, redirect policy or build-gate changes.

## Evidence, contracts and risk

The existing PostHog plugin records page views but neither Root nor the standalone API page captures
the shared cookie. Navbar campaign labels describe internal navigation, not first touch. A head
script captures once before SPA routing; the same script is included on the standalone API page.
An exact-host link adapter refreshes initial and dynamically rendered App links before copying or
activation. The Netdata Website IIFE and Cloud's versioned reader are the implementation patterns.

Preserve every existing cookie byte, including unsupported or malformed records. Never renew its
expiry. Fresh Learn observations have no Website-only roots. Referrer projection must match the
Cloud reader; unsafe existing evidence suppresses transport rather than inventing an empty sender.
Tracking opt-out, unavailable storage, size limits and nonproduction hosts must fail without
blocking navigation. A shared cookie cannot provide atomic cross-tab persistence.

New SDK identity collection is excluded pending an explicit disclosure policy; historical identity
candidates remain untouched in storage. Page attribution does not claim cross-browser history merge.

## Validation

Execute native VM/browser tests of the actual scripts for fresh/repeated/SPA capture, v1/v2/future
cookies, earlier evidence, expiry, denied storage, opt-out, unsafe refs, dynamic/copied/middle-click
links, destination safety and query preservation. Test output against Cloud's exact reader contract.
Run existing Learn tests and production build/gates without weakening baseline rules. Public
deployment and synthetic-account validation are separate acceptance work, not local test claims.

## Rollback

Remove the script inclusions to disable capture and decoration; existing cookie contents and
analytics initialization remain unchanged. Do not delete or reset cookies during rollback.

## Local evidence

- Node.js 22.23.2: 25 first-touch native tests passed, covering DOM capture, link mutation and the
  unchanged installed PostHog plugin. No provider writes occur in these tests.
- Node.js 22.23.2: all 35 Vitest files passed, with 455 tests passed and one existing skip. The
  redirect graph suite requires built output; it passed after the production build completed.
- Node.js 22.23.2: all 73 existing dependency-authority, IndexNow, Swagger-vendor and site-gate
  native tests passed. Running the site-gate test with Node.js 24 correctly fails its runtime gate.
- The production Docusaurus build passed. It reported existing content anchor/minifier warnings;
  attribution did not change the generated documentation or link policy.
- All post-build gates passed: rendered titles, functional H1, redirect graph, redirect-source
  links, indexability, RUM and the checksum-bound site gate. No baselines were widened.
- Chromium 1243 with all traffic intercepted: actual scripts passed synchronous capture, cookie
  domain/security/expiry, SPA dynamic copied links, reload without expiry renewal, and transport
  to an isolated cookie-free browser context.
- Chromium loaded actual built Ask Nedi and standalone API artifacts through an intercepted local
  response handler. Both captured their initial route; rendered App navbar links carried evidence.
  Both rendered artifacts contain the scripts in order without async/defer attributes.
- The pure handoff helper is byte-identical to the Website copy (SHA-256
  `ede4fb9c66c4301f24a2b584ab2a8912ad922919f2113c336446a347fe6c6013`).
- `tests/fixtures/first-touch-handoff.json` defines eight shared Website/Learn projection cases:
  legacy Website, Learn, Learn with Website roots, safe sender projection, unsupported versions,
  private senders, future timestamps and expired timestamps. Native tests execute the actual helper.

App-reader/auth interoperability and deployed signup reconciliation belong to the coordinated
release evidence; no local result certifies backend deployment or whole-history identity linkage.

## PR delivery authorization — 2026-09-17

The user authorized publishing the scoped implementation to existing PR #3079. Immediately before
publication, its head was `cd75c4071e12ccaccfc2d55080d0dca7446c648e`; existing required checks and
the Netlify preview had completed successfully, with no running checks. Those checks qualify the
preparation head only. Review comment 4033135419 is addressed by including both first-touch native
test files in `test:first-touch`, which runs within the existing `test:run` validation command.
