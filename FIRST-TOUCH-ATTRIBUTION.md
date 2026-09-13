# Learn first-touch capture preparation

Status: research-only production design; source characterization is qualified by the tests below.
This document does not describe an implemented Learn capture or handoff producer.

**Prerequisite: [netdata/cloud-frontend#5743](https://github.com/netdata/cloud-frontend/pull/5743).**
The reader contract is pinned to `netdata/cloud-frontend @ 3461255246041ad8c309e749973faaa53c716b55`,
`docs/first-touch-cookie.md`. Merge and deployment of prerequisite readers must be verified before
Learn capture can be enabled. Draft preparation does not authorize merge or release.

## Purpose and observed behavior

Preserve a visitor's first eligible Learn observation through SPA navigation and App navigation,
without changing Website field meanings, authentication, or existing analytics identities.
Source inspection targets `netdata/learn @ c3a16edd5ee4dc819976ef162c9afaff4b9b968c`.

- `src/theme/Root/index.js:21` handles Nedi assets. Initial loads and SPA transitions do not write
  `nd_first_touch`; the executable Root characterization verifies that absence.
- `docusaurus.config.js:159,172` supplies App links with `utm_source=learn` and a navigation label.
  These describe the internal click, not a carried first observation. No `nd_ft` is emitted.
- Markdown content and `src/data/News.js:426,534` also contain App links. A navbar-only decorator
  would miss those links; generated documentation must not be edited to add attribution.
- `docusaurus.config.js:186` uses `posthog-docusaurus@2.0.5`, pinned in `yarn.lock`, with the existing
  `https://app.posthog.com` endpoint and development disabled. Its actual route module sends
  `$pageview` on initial load and pathname changes; it does not capture a first-touch cookie.
- `static/api.html` is a standalone executable content page outside Docusaurus Root and its
  plugins. `static/oauth2-redirect.html` is an authentication utility, not a content-entry page.
- `/` redirects before page JavaScript executes (`netlify.toml:22`). Its owner is `static.toml`;
  generated redirects come from ingestion. Browser capture cannot reconstruct the original route.

## Bounded implementation scope after qualification

1. Add a Learn-owned adapter for the existing cookie and exact App handoff contract. Capture the
   initial page's pathname, permitted referrer, supported UTMs, and canonical UTC millisecond time
   together. Preserve earlier Website or other supported evidence as a whole; never put a Learn
   pathname into Website-only root fields. Unknown versions and malformed stored records must not
   become fresh captures or be overwritten. No additional cookie or persistent store is permitted.
2. Use the supported Docusaurus client-module hooks: initialize document evidence before the
   initial React render; use `onRouteUpdate` for route context and `onRouteDidUpdate` for rendered
   link refresh. Preserve the original observation across pathname, query, hash, and back navigation.
   Leave Root's Nedi head ownership intact. Qualify standalone `/api` coverage separately; do not
   attach capture to the OAuth redirect utility. See [Docusaurus client lifecycles](https://docusaurus.io/docs/advanced/client).
3. Decorate exact permitted HTTPS App destinations across navbar, content, news, and dynamically
   inserted links. Preserve their existing query/hash bytes and internal `utm_*` labels. Cover
   keyboard activation, middle-click, copied links, and SPA rerenders. Storage or SDK failure must
   not block navigation. Do not change redirects, generated content, backend inputs, or SDK setup.
4. Attach only identity candidates observed for the captured visit. Retain original `ts` and
   existing identities; never infer a historical ID from a later page or change SDK persistence.
   ID association is diagnostic evidence, not authorization to identify or merge people.
5. Include tests, a rendered-browser check with intercepted network traffic, operator instructions,
   and single-repository rollback qualification. Production code must have no SEO runtime dependency
   and no dependency on another capture PR from the same delivery batch.

## Reader constraints and unresolved qualification gates

- Numeric version 2 uses `entry` with `surface`, `path`, `referrer`, five `utm_*` strings, and `ts`.
  Optional Website roots retain their existing meaning. At most five identity candidates carry
  `distinct_id`, public `project_token`, `surface`, anonymous/identified `status`, and `observed_at`.
- Encoded cookie and `nd_ft` JSON values are bounded to 3,800 bytes. Every populated observation,
  including Website roots, requires canonical time, nonfuture time, original time plus 90 days
  strictly after now, and pre-signup time when known. Invalid roots reject the entire handoff.
- Structured referrers exclude credentials, query/fragment, IP/local/private hostnames and
  unsupported ports. Do not silently replace an unsupported referrer with an empty one. The safe
  projection must preserve the observation's meaning and pass the App's existing contract.
- App independently caps the complete auth callback at 3,800 serialized URL bytes and can omit
  `nd_ft` to preserve authentication. Envelope size alone does not prove callback continuity.
- **Concurrency is unresolved.** The approved requirement calls for recoverable earlier candidates
  across competing writers. A shared-cookie read/compare/write is not atomic; document memory does
  not prove recovery after a losing tab exits. The existing v2 reader exposes one primary entry
  and optional Website roots. Do not claim complete concurrency or add storage to conceal this gap.
- **Delayed identity persistence is unresolved.** `document.cookie` does not reveal stored expiry.
  Exact metadata is required for v1 migration. The approved timestamp-plus-90-day fallback belongs
  to Website enrichment; it does not authorize Learn identity updates or renewal after SDK load.
- **SDK readiness is unresolved.** The installed plugin's stub has no synchronous identity reader;
  the existence of `capture` or its queued opt-out method does not establish readiness. A `loaded`
  function in plugin options is discarded by JSON serialization, reproduced by the tests below.
  A supported readiness and anonymous/identified-state adapter must be qualified without changing
  project, endpoint, SDK identity, or existing tracking controls. [PostHog documents this serialization limit](https://posthog.com/docs/libraries/docusaurus).
- **Mixed versions and rollback need browser proof.** Learn-only cookies cannot supply legacy
  Website fields to a stale App reader. A stale Website existence guard can skip a later Website
  capture. Qualify against the deployed Website compatibility change from
  [netdata/website#1383](https://github.com/netdata/website/pull/1383) and the prerequisite App reader;
  explicitly retain cached-client limitations. No same-batch Website producer is required.
- Root/legacy redirect capture requires its separate policy approval. It remains outside this
  preparation scope. Missing SDK, disabled tracking, refused storage, oversize data, and absent
  referrers must remain visible limitations rather than invented successful attribution.

## Runnable characterization and later acceptance

Install the existing lockfile with Yarn 1.22.22 and the repository's Node.js 22.23.2 runtime, then run:

```sh
yarn vitest run src/theme/Root
node --test tests/first_touch_producer_baseline.test.mjs
```

The Root tests execute the actual React component. The native tests execute the installed plugin's
generated SDK stub and route module, with network insertion intercepted and only module bindings
adapted for the VM. They characterize missing capture and SDK limitations; they do not simulate an
unbuilt Learn writer or certify the desired production behavior. App owns its producer-contract
fixtures and real reader/auth/navigation checks; Learn does not vendor that source or require an App
checkout in CI. When capture is implemented, replace the absence assertions with behavior tests.

Acceptance must additionally cover Website/Learn ordering, repeated/competing tabs, original expiry,
missing or late SDK, known IDs and overflow, unsupported versions, malformed/oversize values,
both observation timestamp boundaries, App URL safety, standalone-page coverage, and rollback.
Run the owning production build, `scripts/run-post-build-gates.mjs`, and existing redirect,
indexability, and rendered-site checks; never widen their baselines to make attribution pass.
