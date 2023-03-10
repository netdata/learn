# Netdata Learn

This repository hosts the code for Netdata's documentation site, **Netdata Learn** built on [Docusaurus](https://docusaurus.io/).
Docusaurus is a free, open-source project maintained by Facebook.
The site is then deployed automatically to Netlify from the latest commit of the master branch, which we also use to maintain certain redirects.

## Contributing to Netdata Learn

Most of the files in the `/docs` folder are "mirrors" of their original files found in the [ingested repositories](#ingested-repositories).

Generally speaking, the files in the `/docs` folder of repository should not be edited.
The [documentation contribution guidelines](https://github.com/netdata/netdata/blob/master/docs/guidelines.md) explains this architecture a bit further and explains some of the methods for making or suggesting edits.

Moreover, after taking a look at the [documentation contribution guidelines](https://github.com/netdata/netdata/blob/master/docs/guidelines.md),
please also take a look at the [style guide](https://github.com/netdata/netdata/blob/master/docs/contributing/style-guide.md).
We offer friendly advice on how to produce quality documentation, hoping that it will help you in your contribution.

## Installation

### Prerequisites

- `yarn` should be installed on the system, if you don't have it check the different package types listed in the [yarn releases](https://github.com/yarnpkg/yarn/releases) page
- `node.js`, version "12 - 16" should also be installed on the system, [install node.js v16.19.1 from here](https://nodejs.org/download/release/v16.19.1)
- Git installed on the system

### Steps

> Note, if you are using Windows, use Powershell or CMD for these commands, as for example the integrated terminal of VSCode might not find the commands.

1. Clone this repository

    ```bash
    git clone https://github.com/netdata/learn.git
    cd learn
    ```

2. Install dependencies.

    ```bash
    yarn install
    ```

3. Create a `.env` file in the project root. This file will be ignored by Git and should **NOT** be committed, as it will
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

To start a local version of Netdata Learn, running at port `3000` use:

```console
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without
having to restart the server. If you want to suppress warnings you can run `yarn -s start`.

## Ingest and process documentation files

As explained in the [contributing to Netdata Learn](#contributing-to-netdata-learn) section above,
all of the files in the `/docs` folder are mirrors of their original versions located in Netdata's repositories.

The organization of the files is handled by the `map.tsv` file, that contains metadata for every file. That file should only be edited by members of the Netdata team.

In the `ingest` GitHub action, the ingest script runs with the flag `-f`, which allows it to fail upon detecting broken links.

To run the ingest process refer to the [Manual ingest via local environment](#manual-ingest-via-local-environment) section.

### Ingested repositories

At the moment documentation is ingested from the following repos:

- netdata/netdata
- netdata/go.d.plugin
- netdata/.github
- netdata/agent-service-discovery
- netdata/netdata-grafana-datasource-plugin
- netdata/helmchart

Documentation arrives in this repository via the [`ingest.py`](/ingest/ingest.py) script. This script clones the repos and processes all of Netdata's documentation, including changing file paths and overwriting links between documents, then places the files in the `/docs` folder.

### Automated ingest via GitHub Actions

This repo uses a GitHub Action called [`ingest.yml`](.github/workflows/ingest.yml) to run the `ingest/ingest.py` process.

This action runs at 14:00 UTC every day.

If there are changes to any documentation file, the GitHub Action creates a PR that is then reviewed by a member of the Netdata team.

The action can be configured to automatically assign one or more reviewers.
To enable automatic assignments, uncomment the `# reviewers:` line at the end of [`ingest.yml`](.github/ingest.yml) and add the appropriate GitHub username(s)either space or comma-separated.

### Manual ingest via GitHub Actions

To run the action manually:

1. Click on the **Actions** tab at the top of the page.
2. Click on the **Ingest** workflow.
3. On the right-hand side of the screen, there's a small dropdown menu that reads **Run workflow**. Click on that, then **Run workflow**.

As with the automated ingest, the action creates a PR if there are any changes.

### Manual ingest via local environment

You can also run the script manually in a local development environment. Most of the times you will make changes in
any repo of the [repos](#ingested-repositories) (or your forks) we mentioned above.
To do that you need to setup your local environment for the ingest process to work.
This script is a python script and has it's own dependencies (separate from the docusaurus framework).

To run the ingest process and spin up a local development environment:

#### Linux environments or WSL

##### Prerequisites

- Python v3.9+

##### Steps

1. Navigate under your `netdata/learn` local clone.

2. [Optional] Create a local test branch otherwise work on the `master` branch.

3. Create a python virtual environment.

  ```bash
  python -m venv myenv
  ```
  
  The name `myenv` is included in the `.gitignore` file of this repo.

4. Activate your environment.

  ```bash
  source myenv/bin/activate
  ```

5. Run the ingest process to fetch the documents you are working on from one or multiple repos.

  ```bash
  python ingest/ingest.py --repos <owner>/<repo>:<branch>
  ```
  
  for example, let's assume that you made some changes in the markdown files of `netdata/netdata` repo (branch: patch1)
  and on your own fork `user1/go.d.plugin` repo (branch: user1-patch).

  ```bash
  python ingest/ingest.py --repos netdata/netdata:patch1 user1/go.d.plugin:user1-patch
  ```

6. Build a local website,

  ```bash
  yarn start
  ```

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
