# Netdata Learn

This repository hosts the code for Netdata's documentation site, **Netdata Learn** built on [Docusaurus](https://docusaurus.io/).

> **Important**
>
> This repo is a **mirror**! Means any changes made here on the `docs/` directory will be overwritten from the [`netdata/netdata`](https://github.com/netdata/netdata)

The site is then deployed automatically to Netlify from the latest ingested commit of the [`netdata/netdata`](https://github.com/netdata/netdata) master branch, which we also use to maintain certain redirects.

## Netlify status

master    : [![Netlify Status](https://api.netlify.com/api/v1/badges/bafd033d-602b-4635-94f4-17c0b1235480/deploy-status)](https://app.netlify.com/sites/netdata-docusaurus/deploys) </br>
staging  : [![Netlify Status](https://api.netlify.com/api/v1/badges/bafd033d-602b-4635-94f4-17c0b1235480/deploy-status?branch=staging)](https://app.netlify.com/sites/netdata-docusaurus/deploy-status?branch=staging) </br>
staging1  : [![Netlify Status](https://api.netlify.com/api/v1/badges/bafd033d-602b-4635-94f4-17c0b1235480/deploy-status?branch=staging1)](https://app.netlify.com/sites/netdata-docusaurus/deploy-status?branch=staging1) </br>

## Contributing to Netdata Learn

Most of the files in the `/docs` folder are "mirrors" of their original files found in the [ingested repositories](#ingested-repositories).

The files in the `/docs` folder of repository should not be edited.

The [documentation contribution guidelines](https://github.com/netdata/netdata/blob/master/docs/guidelines.md) explain this architecture a bit further and go through some of the methods for making or suggesting edits.

Please also look at the [style guide](https://github.com/netdata/netdata/blob/master/docs/developer-and-contributor-corner/style-guide.md). We offer friendly advice on producing quality documentation, hoping that it will help you contribute.

## Local Deploy of Learn

1. Clone this repository

    ```bash
    git clone https://github.com/netdata/learn.git
    cd learn
    ```

2. Install Node.js 22.14.0, the version pinned by the Netlify build. With `nvm`:

    ```bash
    nvm install 22.14.0
    nvm use 22.14.0
    ```

3. Install Yarn Classic 1.22.22 and the locked dependencies. Netlify selects Yarn because
   this repository tracks `yarn.lock`; npm 10.9.2 remains pinned for the nested build-gate
   install run by `build:netlify`.

    ```bash
    npm install --global yarn@1.22.22
    yarn install --frozen-lockfile
    ```

4. To start the frontend end of Learn, running at port `3000`, use:

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Markdown changes are reflected live without having to restart the server (removing/adding files will need a re-run of the command).

## Ingest and process documentation files

As explained in the [contributing to Netdata Learn](#contributing-to-netdata-learn) section above,
all of the files in the `/docs` folder are mirrors of their original versions located in Netdata's repositories.

### Manual ingest via local environment

You can run the ingest script manually in a local development environment. Most of the time you will make changes in any repo of the [repos](#ingested-repositories) (or your forks).
To do that you need to setup your local environment for the ingest process to work.
The ingest script is a python script and has its dependencies (separate from the docusaurus framework).

#### Prerequisites

- Python v3.9+

#### Steps

1. Navigate under your `netdata/learn` local clone.

2. (Optional) Create a local test branch otherwise work on the `master` branch.

3. Create a python virtual environment.

    ```bash
    python -m venv myenv
    ```

    The name `myenv` is included in the `.gitignore` file of this repo.

4. Activate your environment.

    ```bash
    source myenv/bin/activate
    ```

5. Install the required packages, via pip

    ```bash
    pip install -r .learn_environment/ingest-requirements.txt
    ```

6. The organization of the files is handled by the [`map.yaml` file](https://github.com/netdata/netdata/blob/master/docs/.map/map.yaml), that contains metadata for every file. That file should only be edited by members of the Netdata team.

7. Run the ingest process to fetch the documents you are working on from one or multiple repos.

    ```bash
    python ingest/ingest.py --repos <owner>/<repo>:<branch>
    ```

    You can also use local paths instead of GitHub repos:

    ```bash
    python ingest/ingest.py --repos /path/to/local/netdata
    ```

    Or specify the repo name explicitly for a local path:

    ```bash
    python ingest/ingest.py --repos netdata:/path/to/local/netdata
    ```

    Examples combining GitHub and local paths:

    ```bash
    python ingest/ingest.py --repos netdata/netdata:patch1 /path/to/local/go.d.plugin
    ```

    Or if you have your own fork:

    ```bash
    python ingest/ingest.py --repos netdata/netdata:patch1 user1/go.d.plugin:user1-patch
    ```

    If you don't use `--repos` the ingest will run on the master branches of netdata's repos.

8. Normal ingest already reconciles the generated integration grids. To repair only those grids
   from the committed full-ingest state without refreshing upstream documentation, run:

   ```bash
   python ingest/ingest.py --regenerate-grids-only
   ```

   During ingest, integration logos from `netdata.cloud/img` are also analyzed for theme contrast.
   The ingest process tags low-contrast logos so Learn can apply a subtle glow only where needed.
   
9.  Build a local website  

    ```bash
    yarn start
    ```

    You can also build the project instead of running by:

    ```bash
    yarn build
    ```

    and then:

    ```bash
    yarn serve
    ```

### Ingested repositories

At the moment documentation is ingested from the following repos:

- netdata/netdata
- netdata/.github
- netdata/agent-service-discovery
- netdata/netdata-grafana-datasource-plugin
- netdata/helmchart

Documentation arrives in this repository via the [`ingest.py`](/ingest/ingest.py) script. This script clones the repos and processes all of Netdata's documentation, including changing file paths and overwriting links between documents, then places the files in the `/docs` folder.

### Automated ingest via GitHub Actions

This repo uses a GitHub Action called [`ingest.yml`](.github/workflows/ingest.yml) to run the `ingest/ingest.py` process.

The action runs every three hours from 08:10 through 23:10 UTC, can be started manually, and
runs after relevant generator, site-source, or documentation changes merge to `master`.

If there are changes to any documentation file, the GitHub Action creates a PR that is then reviewed by a member of the Netdata team.

Feature and technical PRs must contain only source, generator, and test changes. Pipeline-owned
`docs/**`, `ingest/generated_map.yaml`, and generated sidebar-state artifacts belong only in the
same-repository `ingest` automation PR carrying both the `ingest` and `automation` labels. A PR
check enforces this boundary. `netlify.toml` is the narrow exception because Netlify reads that
deployed configuration before the ingest or site build runs; it remains generated from
`static.toml` and must match it.

The first ingest after a generator change also creates the generated sidebar-state checksum. Its
presence activates the strict rendered-title, redirect-source-link, and complete site-build gates.
Before that generated PR lands, the source PR still enforces redirects, functional headings,
zero-noindex, and Cloudflare RUM without pretending that the old documentation corpus has already
been regenerated.

The action can be configured to automatically assign one or more reviewers.
To enable automatic assignments, uncomment the `# reviewers:` line at the end of [`ingest.yml`](/.github/workflows/ingest.yml) and add the appropriate GitHub username(s) either space or comma-separated.

## Update news on the Learn homepage

There are two parts to the news section on the Learn homepage: the _timeline_ and the _latest release_.

### Timeline

The timeline section on the Learn homepage should be updated whenever the team publishes new docs/guides or when an
existing doc/guide receives a major overhaul/improvement.

1. Open the `/src/data/News.js` file.
2. Find the `News` array near the top of the page.
3. Duplicate an existing item and replace the `title`, `href`, `date`, `type`, and `description` fields.
     1. `title` can be pulled directly from .md file.
     2. `href` field is the full path, including the root /, to that document.
     3. `date` is the date that doc was published/updated.
     4. `type` is one of the following: Doc, Guide, Video
     5. `description` can be pulled directly from .md file. It must be surrounded by the <> … </> tags to React-ify it and escape any troublesome characters.
4. The end result should look something like this:

     ```js
     const updates = [
       {
         title: <>Monitor any process in real-time with Netdata</>,
         href: '/guides/monitor/process',
         date: 'December 8, 2020',
         type: 'Guide',
         description: (
           <>
             Tap into Netdata's powerful collectors, with per-second utilization metrics for every process, to troubleshoot faster and make data-informed decisions.
           </>
         ),
       },
       ...
     ]
     ```

5. If you added one news item, delete the oldest item from the list. Try to maintain only 6 items in the list at any one time.
6. Save the file, commit, and push your code. Create a new PR, check the deploy preview, get a review, and merge it.

### Latest release

Update the latest release section when there is a new release of Netdata, like `1.31.0` → `1.32.0`.

1. Open the /src/data/News.js file.
2. Find the `ReleaseVersion` and `ReleaseDate` variables, and the `ReleaseNotes` array.
3. Update the version and date.
4. Update the major features in `ReleaseNotes`, which are then converted into the list.
5. The end result should look something like this:

      ```js
      export const ReleaseVersion = '1.31.0'

      export const ReleaseDate = 'May 19, 2021'

      export const ReleaseNotes = [
        'Re-packaged and redesigned dashboard',
        'eBPF expands into the directory cache',
        'Machine learning-powered collectors',
        'An improved Netdata learning experience',
      ]
      ```

6. Save the file, commit, and push your code. Create a new PR, check the deploy preview, merge it.

## Edit CSS

Global CSS rules are stored in `/src/css/custom.css` file.

The various pages and components that make up Learn also come with extra CSS using [Tailwind](https://tailwindcss.com/),
which uses utility classes to create styling. You can find these utility classes throughout the components and pages.

For example, the following utility classes style the hero text on the Learn homepage.

```css
<div className="z-10 relative w-full md:w-3/4 lg:w-1/2">
  <h1 className="text-2xl lg:text-5xl text-text font-semibold mb-6 dark:text-gray-50">{siteConfig.title}</h1>
  <p className="prose text-lg lg:text-xl text-text dark:text-gray-50">{siteConfig.tagline}</p>
</div>
```

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Custom (swizzled) Docusaurus components

Every `.js` file in the `/src/theme` folder is a component that has been customized from the defaults supplied by Docusaurus.
This process is called [swizzling](https://docusaurus.io/docs/using-themes#swizzling-theme-components).

If you update Docusaurus, these swizzled components aren't updated. This could create some breakage if there are major changes to the default versions of these components in the Docusaurus core.
The only solution is to merge the existing customizations with the new version of the file or remove the customizations altogether.

To merge:

1. Make a copy of the component (`xyz.js`) in the `/src/theme` folder and save it outside the repo.
2. Delete the file/folder for that component.
3. Run `yarn run swizzle @docusaurus/theme-classic NAME`, replacing `NAME` with the name of the component, like `DocItem` or `Seo`. You may also have to add a `-- --danger` to the end: `yarn run swizzle @docusaurus/theme-classic NAME -- --danger`.
4. Open the newly-created `.js` file in the `/src/theme` folder.
5. Add the customization (the code between `BEGIN EDIT`/`END EDIT`) comments, back into the file in the appropriate place.
6. Start Docusaurus with `yarn start` and test.

## Deployment

Deployment is handled automatically through Netlify. Each new commit to the `master` branch deploys the latest version of Netdata Learn.

If there are questions about deployment, please create an issue.

### Redirects

If a document is moved from one location to another, the ingest script is responsible for generating relative redirects.

There is also a `static.toml` file, containing more complex, static redirects.
