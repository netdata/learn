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

## Review-qualified resource-link repair — 2026-09-17

Review comment 4040311529 reproduces: an attribute mutation on a non-anchor resource link
receives `nd_ft`. The approved repair guards the central decorator with `a[href]`, covering
every invocation without changing capture or anchor behavior. A native DOM regression fails
before the guard; resource-link and SVG-reference mutations must remain byte-identical afterward.
Website/Fleet already reject non-anchor targets in `isAppLink`.

Comments 4040290361 and 4040311545 propose identity timestamp eligibility not present in the
App reader contract. `firstTouchCookie.js:validIdentity` requires canonical finite `observed_at`;
`firstTouchHandoff.js:readFirstTouchHandoff` applies age/signup eligibility only to entry and
Website-root `ts`. Identity candidates remain diagnostic, not ordering or merge authority.
Shared conformance fixtures retain valid diagnostic candidates independently of entry age.

Qualification: 26 first-touch native checks pass on Node 22.23.2. The resource mutation regression
fails before the guard and passes afterward; intercepted Chromium confirms resource URLs remain
unchanged while real anchors are decorated on both Learn and Website. Both identity cases also
pass the actual App reader with metadata unchanged. The shared helper runtime remains byte-identical.
Before publishing this repair, all checks on implementation head `f64efcd784b67e9f74838dc747e4ed03b8a582ad`
were complete and passing (Netlify informational checks neutral). No build-policy changes are made.

## Test sensitivity repair — 2026-09-18

Review comments 4040420748 and 4040420754 identify verified coverage gaps: removing the auxclick
handler or injecting an existing-cookie renewal still passes the respective tests. Strengthen the
middle-click test to assert synchronous decoration before observer delivery. Seed a real expiring
cookie in the DOM cookie jar, intercept producer writes, and compare expiry after handoff/refresh.
Apply the same inherited test corrections to the offline Community tests; runtime bytes are unchanged.

Qualification on Node 22.23.2: all 26 Learn native checks and all 30 offline Community checks pass.
Four in-memory mutation controls fail for the intended reason: disabling the auxclick listener
leaves the synchronous link undecorated; injecting a same-value 90-day cookie renewal triggers the
write assertion, on both surfaces. Neither mutation writes runtime files. Both original Learn tests
pass those deliberately broken variants, establishing their prior insensitivity. Community desktop
and mobile Chromium cases also assert decoration in the same JavaScript turn as insertion/auxclick.
All PR checks on `e81bb688be80477889d5279850b3e5468afd4b51` were complete and passing before this
tests-only publication; no production rebuild is needed to qualify unchanged runtime bytes.

## Runtime rollback

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
- `tests/fixtures/first-touch-handoff.json` defines ten shared Website/Learn projection cases:
  legacy Website, Learn, Learn with Website roots, safe sender projection, unsupported versions,
  private senders, future timestamps, expired timestamps and future/older diagnostic identity metadata.
  Native tests execute the actual helper.

App-reader/auth interoperability and deployed signup reconciliation belong to the coordinated
release evidence; no local result certifies backend deployment or whole-history identity linkage.

## PR delivery authorization — 2026-09-17

The user authorized publishing the scoped implementation to existing PR #3079. Immediately before
publication, its head was `cd75c4071e12ccaccfc2d55080d0dca7446c648e`; existing required checks and
the Netlify preview had completed successfully, with no running checks. Those checks qualify the
preparation head only. Review comment 4033135419 is addressed by including both first-touch native
test files in `test:first-touch`, which runs within the existing `test:run` validation command.
