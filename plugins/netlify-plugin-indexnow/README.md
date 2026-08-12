# Learn IndexNow build plugin

This is the Learn vendor copy of the website-owned IndexNow build plugin contract. The two
copies must carry matching checksums before the parallel implementation lanes are integrated.
`vendor-checksums.json` is enforced by the Netlify build before Docusaurus starts.

The plugin restores its prior HTML-hash state before the build and runs only after a
successful deploy. It reads the published sitemap, hashes the corresponding HTML files,
submits only changed or removed URLs, and never invalidates a successful deploy when
IndexNow or the build cache is unavailable.

A missing cache seeds the current state without submitting the entire site.
