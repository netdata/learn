# Learn first-touch capture and handoff

Status: implemented locally; qualification evidence and outstanding deployment acceptance are recorded in
[FIRST-TOUCH-IMPLEMENTATION.md](FIRST-TOUCH-IMPLEMENTATION.md).

## Behavior

The synchronous head scripts `static/js/first-touch-handoff.js` and `static/js/first-touch.js`
capture the first executable Learn document before hydration or SPA routing. The same scripts
run on standalone `static/api.html`; the OAuth redirect utility does not capture content entry.
Root's Nedi assets and the existing PostHog initializer remain unchanged.

When no first-touch cookie exists, capture the pathname, referrer, supported UTMs and original UTC
timestamp as one `entry` with `surface: "learn"`. Use only the existing `nd_first_touch` cookie:
URI-encoded JSON, version 2, Domain=.netdata.cloud, Path=/, Secure, SameSite=Lax, 90-day expiry.
Learn entries never populate Website-only root fields.

Every existing cookie remains byte-for-byte unchanged, including v1, unsupported versions,
malformed records and earlier observations. Reading does not renew expiry. A supported v1 record
can be projected into a v2 URL envelope without physically upgrading the cookie. No SDK identities
are collected, reset or merged; valid already-associated candidates are retained by projection.

## Links and authentication boundary

Exact HTTPS App destinations receive the bounded `nd_ft` projection. Navbar, content, news,
dynamically added anchors and SPA rerenders use the same adapter. Links are decorated before
activation so copied URLs and middle-clicks carry evidence. Existing campaign labels, query bytes,
fragments and already-present envelopes are preserved. Existing `nd_ft` values are not replaced.

The serializer shares exact source bytes with the Website-owned implementation, but this repository
contains its own copy: builds and runtime require no other repository. The contract is compatible
with the versioned App reader introduced in Cloud Frontend #5743 and retained in #5745.
An App deployment must implement that reader to consume Learn-only observations.

Referrer projection removes query and fragment only when the remaining URL meets the App's
public-host contract. Credentials, private/local/IP hosts, unsupported ports and non-public Netdata
paths cannot be handed off. Their cookie evidence is retained unchanged, and transport is omitted;
it is never silently rewritten as direct traffic. All populated observations, including Website
roots, must have canonical, nonfuture timestamps within 90 days. Both the encoded envelope and the
complete decorated URL are limited to 3,800 characters. App additionally validates signup time and
authentication callback size.

## Failure and compatibility boundaries

- Capture and decoration run only on https://learn.netdata.cloud. Preview and local builds do not
  create production cookies. Tests intercept requests while using the canonical origin.
- Existing SDK opt-out and persisted PostHog opt-out markers suppress both capture and handoff.
  The asynchronous SDK stub is not mistaken for a loaded identity/consent reader.
- Refused writes retain evidence in document memory for outbound links. Unreadable storage fails
  closed. No additional cookie, localStorage write or sessionStorage is introduced.
- SPA routes do not recapture. A competing later cookie cannot replace the retained earlier
  document record during link projection; tied differing observations suppress projection.
  The cookie is not an atomic cross-origin store, and document memory cannot recover after tab exit.
- Cookie expiry, unsupported/malformed evidence and oversize observations never become fresh
  invented visits. No late SDK callback renews the cookie or infers historical identity.
- HTTP redirects execute before browser capture. The root redirect therefore captures the first
  executable destination, not the original HTTP request. Redirect policy is unchanged.
- Historical cached clients may not read this format. The Website compatibility deployment accepts
  Learn-only cookies and can add Website roots without replacing their entry; legacy Website-only
  reports are not repurposed. Page delivery does not establish cross-browser SDK-history linkage.

## Validation and rollback

Use Node.js 22.23.2 and the existing Yarn lockfile:

```sh
npm run test:first-touch
yarn vitest run
yarn build
node scripts/run-post-build-gates.mjs
```

Native tests execute the actual scripts in a DOM environment; characterization tests retain checks
of unchanged PostHog plugin behavior. Complete build output is required by the redirect graph suite.
Additional browser qualification and App-reader interoperability evidence are recorded in the
implementation ledger. A local build is not proof of deployed behavior.

Rollback removes the two script inclusions from Docusaurus and standalone API HTML. Leave the
existing cookie and analytics identities untouched. No cookie deletion or migration is needed.
