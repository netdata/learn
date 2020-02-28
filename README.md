# Netdata Learn

A public site to learn about Netdata built on
[Docusaurus 2](https://v2.docusaurus.io/).

## Installation

Install [Docker Desktop 18+](https://www.docker.com/products/docker-desktop).

Clone this repository.

    git clone <repo>
    cd netdata-learn-docusaurus

## Development

Build the Docker image.

    docker-compose build

Run the image inside a container.

    docker-compose up

Browse to http://localhost:3000

To run individual commands in the Docker container (the container is named
`docusaurus`).

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

## Updating Dependencies

Any time you change your package's dependencies, you must rebuild.

```bash
docker-compose build
```

A shortcut for building and restarting in one step is.

```bash
docker-compose up --build
```

**NOTE:** If a dependency is installed and exists in the `package.json` but
you get erros saying it cannot be found, clear out the anonymous volumes with
the `-V` flag.

```bash
docker-compose up --build -V
```

## Build

To generate the static content into the `/build` directory.

    docker-compose run --rm docusaurus npm run build

## Deployment

**TODO: deployment instructions**
