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

Documentation arrives in this repository via the [`ingest.js`](/ingest.js) script. This script uses the GitHub API to
gather and process all of Netdata's documentation, including changing file paths and overwriting links between
documents, then places the final files in the `/docs` folder.

Normally, this script runs via an automated [GitHub Action](.github/ingest.yml) once per day, but can also be run
automatically by a member of the Netdata team. If there are changes to any documentation file, the GitHub Action creates
a PR to be reviewed by a member of the docs team.

You can also run the script manually to pull recent changes to your local development environment.

```bash
node ingest.js
```

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting
service.

## Deployment

Deployment is handled automatically through Netlify. Each new commit to the `master` branch deploys the latest version
of Netdata Learn.

## Netdata Community
This repository follows the Netdata Code of Conduct and is part of the Netdata Community.

- [Community Forums](https://community.netdata.cloud/)
- [Netdata Code of Conduct](https://learn.netdata.cloud/contribute/code-of-conduct)