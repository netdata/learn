# Vendored website IndexNow build plugin

`netdata/website` owns this shared IndexNow implementation. Learn vendors the checksum-covered
schema-2 bytes from website commit `eb6246fcf87e4fc2b9160ed77606f6322d953cc1` and adapts only
the host and published-route fixtures outside those covered files.
The thin Netlify entry adapter, core implementation, manifest, dependency declaration, contract
fixtures, and receipt schema are the six-file byte-identical vendor contract. Their SHA-256 values
and exact dependency versions are recorded in
`vendor-checksums.json` and checked before every Netlify Learn build.

`index.js` is only the Netlify lifecycle interface and exports exactly `onPreBuild` and
`onSuccess`. Netlify validates every enumerable entry as an event, so implementation helpers must
remain in `core.js`; tests import that module directly. The shared contract fixture pins the two
allowed entry events and the owner suite rejects any extra export.

The plugin restores its prior HTML-hash state before the build and runs only after a successful
production deploy. It parses direct `url`/`loc` entries from a well-formed published sitemap,
supports Hugo trailing-slash and Docusaurus non-trailing-slash routes, hashes the corresponding
HTML files, and classifies added, updated, and removed URLs. A removed URL is submitted so
IndexNow can recrawl its redirect, 404, or 410 response. Sitemap comments and extension elements
cannot create entries; namespace prefixes, CDATA, and XML named or numeric entities are handled.
The root, direct `url`, and direct `loc` must all use the sitemap root namespace. Missing, reset,
or mixed namespaces and malformed XML fail closed before state or submission changes.

A missing, empty, invalid, legacy, non-canonical, or cross-host cache seeds the current state
without bulk submission. The public key uses the protocol's letters, digits, and dashes grammar;
this shared implementation deliberately supports only the root `/<key>.txt` authorization used
by both sites. Before reading state or making a request it proves that the built root key artifact
is a regular non-symlink file whose bytes equal the key exactly, with no newline. Sitemap, state,
and payload URLs are serialized to one canonical HTTPS identity.
URL paths use one strict decoder for sitemap acceptance and built-file mapping. Repeated
separators, raw or encoded dot segments or separators, invalid UTF-8, controls, and NUL are
rejected. Raw empty query or fragment delimiters are rejected too; URL parsers otherwise erase
that ambiguity. A URL must resolve to exactly one regular, non-symlink output file, and two URLs
cannot claim the same HTML file. Ambiguous directory-index and direct-HTML candidates fail the build.
Canonical state and receipt objects use JavaScript code-unit key order, independent of locale or
timezone.

Independent request batches continue after a failure. Each request has one bounded deadline that
covers the HTTP request and response body. HTTP 200 and 202 advance state; timeouts, transport
errors, and every other status remain pending for a later deploy and the weekly SEO safety-net
submission. Before state advances, the plugin writes one deterministic, content-addressed receipt
to the deploy-specific `netdata-indexnow-receipts` Netlify Blob store. It records exact submitted
URL identities and each batch's accepted or pending status without the public key or key location.
Only the deploy ID, digest, counts, and response classes are logged. The SEO archive collector can
enumerate production deploys and retrieve the receipt through Netlify's supported SDK; build logs
and the local cache are not the audit record.
Only integer HTTP statuses from 100 through 599 enter a receipt; every other response status is
recorded as a schema-valid invalid response with a null status. `COMMIT_REF` is either null or an
exact non-empty, already-trimmed string, matching the collector's provider identity boundary.

State-cache persistence is transactional: the candidate file is written atomically, cache saving must
return `true`, and a false result or exception restores the exact prior local state (or removes a
new seed). The plugin never claims accepted state was cached before that succeeds. IndexNow,
receipt, and cache failures are logged but never invalidate a successful site deployment. The
external submission and local evidence cannot be one atomic transaction, so delivery is at least
once: a crash after an accepted response but before durable receipt/cache state can resend the
same notification, which is safer than losing it.

The cache state machine assumes production hooks for one site do not overlap against the same
restored cache workspace. If Netlify overlaps them, both hooks may submit the same change; the
deploy-specific receipts still preserve exact evidence and the later cache state is only an
optimization. Preventing even that permitted at-least-once duplicate would require an external
compare-and-swap state owner.

Learn copies every file covered by `vendor-checksums.json`, uses
`scripts/verify-indexnow-vendor.js` in `build:netlify`, and runs the complete owner adversarial
suite in `tests/indexnow_plugin.test.js`. Do not copy stale checksums from prose;
`vendor-checksums.json` is the machine-checked source of truth.
