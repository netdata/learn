# Netdata Learn Working Rules

## Repository purpose

This repository builds `learn.netdata.cloud` with Docusaurus and deploys the static result through
Netlify. Public-route validation must use rendered output; source Markdown alone is not proof that
a published path or fragment exists.

## Link integrity contract

Implementation status: policy specified; enforcement is unsupported until the standalone GitHub
jobs and corresponding branch-protection settings exist.

Learn link validation is repository-owned and self-contained. This repository owns its checker
code, fixtures, workflows, schedule, artifacts, issue maintenance, branch-protection integration,
repair automation, implementation plan, and validation evidence. No Learn link-validation job may
fetch, import, vendor, or execute production code from `netdata/seo`, and Learn CI must not require
an SEO checkout, workflow, artifact, service, or repository permission. SEO may consume published
results for measurement, but it is never a production dependency.

Link validation has four distinct failure domains. Do not collapse them into one job or make a
Netlify build or deployment responsible for merge eligibility:

- **Same-site links:** rendered links whose destination is `learn.netdata.cloud`, including
  relative links, must resolve to an existing rendered path and fragment in the Learn build.
  Validate them in a standalone required GitHub job outside Netlify. A same-site failure blocks
  merging, while the deploy preview remains available.
- **Cross-Netdata-site links:** rendered links to another Netdata-owned site, including
  `www.netdata.cloud`, run in a distinct standalone advisory GitHub job outside Netlify. Findings
  remain visible but cannot block merging or deployment because coordinated source and target pull
  requests may merge in either order.
- **New third-party links:** a third-party target URL present in the pull-request rendered output
  but absent from the merge-base rendered output runs in a separate standalone advisory GitHub job
  outside Netlify. The pull-request job checks only these newly introduced targets; its findings
  cannot block merging or deployment.
- **Complete third-party reconciliation:** the full rendered third-party link inventory is checked
  by a Learn-owned weekly scheduled job, not by every pull request. Its issue and any repair pull
  request stay in this repository. Confirmation policy, issue lifecycle behavior, request policy,
  and optional AI-assisted repair require explicit user decisions before implementation.

## Change discipline

- Keep the required same-site job independent from the advisory cross-site and third-party jobs.
- Do not weaken Docusaurus or CI link enforcement to make a pull request pass. Repair the owning
  source or its generator.
- Generated documentation must be repaired through its owning producer and normal ingestion path;
  do not hand-edit output that regeneration will replace.
- Use explicit file paths when staging changes; never stage the whole worktree.

## Generated Prometheus profile catalogues

Agent-generated Prometheus profile catalogues carry static `data-prometheus-profile-catalog`,
`data-prometheus-profile`, `data-prometheus-profile-family`, and
`data-prometheus-profile-chart` hooks. The Learn theme root enhances those disclosures with
catalogue-scoped search, counts, and expand/collapse controls after initial render and client-side
navigation. Keep all catalogue content in the generated HTML for no-JavaScript use; Learn must not
parse Agent profile source contracts or hand-edit generated integration pages.
