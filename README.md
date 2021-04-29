# Netdata Learn

A public site to learn about Netdata built on [Docusaurus](https://docusaurus.io/).

## Contributing to Netdata's documentation

Most of the files in the `/docs` folder are "mirrors" of their original files in either the
[`netdata/netdata`](https://github.com/netdata/netdata) or
[`netdata/go.d.plugin`](https://github.com/netdata/go.d.plugin) repositories.

Generally speaking, the files in the `/docs` folder of repository should not be edited. The [documentation contribution
guidelines](https://learn.netdata.cloud/contribute/documentation) explains this architecture a bit further and explains
some of the methods for making or suggesting edits.

There are a few exceptions to the _don't edit files in this repository_ rule. The following files can be edited here:

- `/docs/docs.mdx` &rarr; `https://learn.netdata.cloud/docs`
- `/docs/agent.mdx` &rarr; `https://learn.netdata.cloud/docs/agent`
- `/docs/cloud.mdx` &rarr; `https://learn.netdata.cloud/docs/cloud`
- Any file in the `/docs/cloud/` directory, which generate all the many `https://learn.netdata.cloud/docs/cloud` pages.

## Developing Netdata Learn

Install [Docker](https://docs.docker.com/get-docker/).

Clone this repository.

```bash
git clone <repo>
cd netdata-learn-docusaurus
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

### Ingesting and processing documentation files

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
docker-compose run --user $(id -u):$(id -g) --rm docusaurus node ingest.js
```

### Local development

Build the Docker image.

```bash
docker-compose build
```

Run the image inside a container.

```bash
docker-compose up
```

Browse to http://localhost:3000

To run individual commands in the Docker container (the container is named `docusaurus`).

```bash
docker-compose run --rm docusaurus <command>
```

If a container is already running you can run commands in it.

```bash
docker-compose exec docusaurus <command>
```

To shell into a running container.

```bash
docker-compose exec docusaurus /bin/sh
```

### Updating Dependencies

Any time you change your package's dependencies, you must rebuild.

```bash
docker-compose build
```

A shortcut for building and restarting in one step is.

```bash
docker-compose up --build
```

**NOTE:** If a dependency is installed and exists in the `package.json` but you get errors saying it cannot be found,
clear out the anonymous volumes with the `-V` flag.

```bash
docker-compose up --build -V
```

### Build

To generate the static content into the `/build` directory.

```bash
docker-compose run --rm docusaurus npm run build
```
