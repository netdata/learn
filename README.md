# Netdata Learn

A public site to learn about Netdata built on [Docusaurus](https://docusaurus.io/).

## Contributing to Netdata Learn

Most of the files in the `/docs` folder are "mirrors" of their original files in either the
[`netdata/netdata`](https://github.com/netdata/netdata) or
[`netdata/go.d.plugin`](https://github.com/netdata/go.d.plugin) repositories.

Generally speaking, the files in the `/docs` folder of repository should not be edited. The [documentation contribution
guidelines](https://learn.netdata.cloud/contribute/documentation) explains this architecture a bit further and explains
some of the methods for making or suggesting edits.

Moreover, after taking a look at the [documentation contribution guidelines](https://learn.netdata.cloud/contribute/documentation), please take a look at the [style guide](https://learn.netdata.cloud/contribute/style-guide). We offer friendly advice on how to produce quality documentation, hoping that it will help you in your contribution.

There are a few exceptions to the _don't edit files in this repository_ rule. The following files can be edited here:

- `/docs/docs.mdx` &rarr; `https://learn.netdata.cloud/docs`
- `/docs/cloud.mdx` &rarr; `https://learn.netdata.cloud/docs/cloud`
- Any file in the `/docs/cloud/` directory, which generate all the many `https://learn.netdata.cloud/docs/cloud` pages.

Finally, if you are curious about contributing to Netdata in other ways, take a look at the [contributing handbook](https://learn.netdata.cloud/contribute/handbook) that we have compiled.

## Installation

Clone this repository.

```bash
git clone git@github.com:netdata/netdata-learn-docusaurus.git
cd netdata-learn-docusaurus
```

Install dependencies.

```console
yarn install
```

Create a `.env` file in the project root. This file will be ignored by Git and should **NOT** be committed, as it will
contain sensitive environment variables.

```bash
touch .env
```

Edit the `.env` file and add the following.

```bash
GITHUB_TOKEN=<token>
```

Generate a new GitHub personal access token [here](https://github.com/settings/tokens).

- Set the token note as `netdata-learn`.
- Check `repo`.
- Click **Generate**.
- Copy the token and replace `<token>` in the `.env` file with it.

## Local development

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without
having to restart the server.

## Ingest and process documentation files

As explained in the [contributing to Netdata's documentation](#contributing-to-netdatas-documentation) section above,
most of the files in the `/docs` folder are mirrors of their original versions in the `netdata/netdata` repository.

Documentation arrives in this repository via the [`ingest.js`](/scripts/ingest.js) script. This script uses the GitHub
API to gather and process all of Netdata's documentation, including changing file paths and overwriting links between
documents, then places the files in the `/docs`, `/guides`, and `/contribute` folders.

Read more about [how the ingest script works](/scripts/ingest.md).

### Automated ingest via GitHub Actions

This repo uses a GitHub Action called [`ingest.yml`](.github/ingest.yml) to run the `ingest.js` process.

This action runs at 14:00 UTC every day.

If there are changes to any documentation file, the GitHub Action creates a PR for review by a member of the Netdata
team.

The action can be configured to automatically assign one or more reviewers. To enable automatic assignments, uncomment
the `# reviewers:` line at the end of [`ingest.yml`](.github/ingest.yml) and add the appropriate GitHub username(s)
either space- or comma-separated.

### Manual ingest via GitHub Actions

To run the action manually, click on the **Actions** tab at the top of the page. Click on the **Ingest** workflow. On
the right-hand side of the screen, there's a small dropdown menu that reads **Run workflow**. Click on that, then **Run
workflow**.

As with the automated ingest, the action creates a PR if there are any changes.

### Manual ingest via local environment

You can also run the script manually in a local development environment.

```bash
node ingest.js
```

If there are changes, you will see them with `git status`. You can then add, commit, and push these changes to the
repository and create a new PR.

## Broken link checker

This repo uses a GitHub Action called [`check-broken-links.yml`](.github/check-broken-links.yml) to test the _internal_
links in each Markdown file.

This action runs at 17:00 UTC every day.

If the action finds broken links, it creates a new issue ([example](https://github.com/netdata/learn/issues/591)). Click
**View the results.** to find which file(s) contain broken links.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting
service.

## Deployment

Deployment is handled automatically through Netlify. Each new commit to the `master` branch deploys the latest version
of Netdata Learn. If there are questions about deployment, please create an issue.

### Redirects

If a document is moved from one location to another, edit the `netlify.toml` file with the previous path (`from`) and
the new path (`to`).

```
[[redirects]]
  from = "/docs/agent/packaging/installer"
  to = "/docs/get-netdata"
```

## Netdata Community

This repository follows the Netdata Code of Conduct and is part of the Netdata Community.

- [Community Forums](https://community.netdata.cloud/)
- [Netdata Code of Conduct](https://learn.netdata.cloud/contribute/code-of-conduct)