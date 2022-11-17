# Netdata Learn

A public site to learn about Netdata built on [Docusaurus](https://docusaurus.io/). Docusaurus is a free, open-source
project maintained by Facebook. The site is then deployed automatically to Netlify from the latest commit to the master
branch, which we also use to maintain certain redirects.

Docusaurus parses the Markdown (`.md`/`.mdx`) files in the repository and inserts the content from them into various
templates, which are then used to build static HTML files that are deployed with Netlify.

## Contributing to Netdata Learn

Most of the files in the `/docs` folder are "mirrors" of their original files in either the
[`netdata/netdata`](https://github.com/netdata/netdata) or
[`netdata/go.d.plugin`](https://github.com/netdata/go.d.plugin) repositories.

Generally speaking, the files in the `/docs` folder of repository should not be edited. The [documentation contribution
guidelines](https://learn.netdata.cloud/contribute/documentation) explains this architecture a bit further and explains
some of the methods for making or suggesting edits.

Moreover, after taking a look at the [documentation contribution
guidelines](https://learn.netdata.cloud/contribute/documentation), please take a look at the [style
guide](https://learn.netdata.cloud/contribute/style-guide). We offer friendly advice on how to produce quality
documentation, hoping that it will help you in your contribution.

There are a few exceptions to the _don't edit files in this repository_ rule. The following files can be edited here:

- `/docs/docs.mdx` &rarr; `https://learn.netdata.cloud/docs`
- `/docs/cloud.mdx` &rarr; `https://learn.netdata.cloud/docs/cloud`
- Any file in the `/docs/cloud/` directory, which generate all the `https://learn.netdata.cloud/docs/cloud` pages.

Finally, if you are curious about contributing to Netdata in other ways, take a look at the [contributing
handbook](https://learn.netdata.cloud/contribute/handbook) that we have compiled.

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

If you get an error saying command not found when **docusaurus** is trying to start you need to install docusaurus (reference to [docusaurus on npm](https://www.npmjs.com/package/docusaurus)).

```console
yarn run v1.22.5
$ docusaurus start
```

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

## Using JSX components in Markdown (`.mdx`) files

We have a few custom JSX (React) components in use throughout the documentation. These components can be found in
[`/src/components/`](/src/components), and can only be used to MDX (`.mdx`) files, which behave identically to
traditional Markdown files (`.md`).

To use a component, you first need to **import** it into the top of the `.mdx` file. For example, from the `/docs/cloud/get-started.mdx` file:

```
---
title: Get started with Netdata Cloud
description: >-
  Ready to get real-time visibility into your entire infrastructure? 
  This guide will help you get started on Netdata Cloud.
image: /img/seo/cloud_get-started.png
custom_edit_url: link to GitHub source file
---

import Callout from '@site/src/components/Callout'

...
```

The `import` path should begin with `@site` and then continue with the rest of the path to the component file. Here are
the available components:

```
import Callout from '@site/src/components/Callout'
import { Grid, Box, BoxList, BoxListItem } from '@site/src/components/Grid/'
import { OneLineInstallWget, OneLineInstallCurl } from '@site/src/components/OneLineInstall/'
import { Install, InstallBox } from '@site/src/components/Install/'
import { Calculator } from '@site/src/components/agent/dbCalc/'
```

See each file for usage information, or reference a file where the component is already being used.

- [`/docs/docs.mdx`](/docs/docs.mdx)
- [`/docs/get-started.mdx`](/docs/get-started.mdx)
- [`/docs/cloud/get-started.mdx`](/docs/cloud/get-started.mdx)
- [`/docs/store/change-metrics-storage.md`](/docs/store/change-metrics-storage.md)

## Add or update a guide

The process for adding or updating guide content is similar to that of Agent documentation—the guides live inside the
Agent repo, after all. However, there are a few additional steps.

1. Put the guide into the `/docs/guides/` folder inside the `netdata/netdata` repository, create a PR, and have the
   guide reviewed/approved by engineering using the standard practice.
2. Merge your PR with the new/updated guide.
3. Ingest the new guide into the `netdata/learn` repository via one of the methods listed above.
4. Open `/src/pages/guides.js`, which contains the code for the Guides page. Unfortunately, this page is still
   hard-coded. 
  1. Find the GuideItems array near the top of the file. 
  2. Duplicate an existing item and replace the `title`, `href`, `category`, and `description` fields.
    1. `title` can be pulled directly from the guide's frontmatter.
    2. `href` is the full path (minus any extension) to the guide. It always starts with /guides/
    3. `category` is one of the following: configure, deploy, collect-monitor, export, and step-by-step
    4. `description` can be pulled directly from the guide's frontmatter.
  3. The end result should look something like this:
      ```
      const GuideItems = [
        {
          title: <>Develop a custom data collector in Python</>,
          href: '/guides/python-collector',
          category: 'develop',
          description: (
            <>
              Learn how write a custom data collector in Python, which you'll use to collect metrics from and monitor any application that isn't supported out of the box.
            </>
          )
        },
        ...
      ]
      ```
5. Save the file, commit, and push your code. Create a new PR, check the deploy preview, get a review, and merge it.

Add a category
The GuideCategories array contains all the possible categories. To add a new one, create a new item in the array with the label, title, and description.

## Update news on the Learn homepage

There are two parts to the news section on the Learn homepage: the _timeline_ and the _latest release_.

### Timeline

The timeline section on the Learn homepage should be updated whenever the team publishes new docs/guides or when an
existing doc/guide receives a major overhaul/improvement.

1. Open the `/src/data/News.js` file.
  1. Find the `News` array near the top of the page.
  2. Duplicate an existing item and replace the `title`, `href`, `date`, `type`, and `description` fields. 
     1. `title` can be pulled directly from .md file. 
     2. `href` field is the full path, including the root /, to that document.
     3. `date` is the date that doc was published/updated.
     4. `type` is one of the following: Doc, Guide, Video
     5. `description` can be pulled directly from .md file. It must be surrounded by the <> … </> tags to React-ify it
        and escape any troublesome characters.
  3. The end result should look something like this:
     ```
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
2. If you added one news item, delete the oldest item from the list. Try to maintain only 6 items in the list at any one
   time.
3. Save the file, commit, and push your code. Create a new PR, check the deploy preview, get a review, and merge it.

### Latest release

Update the latest release section when there is a new release of Netdata, like `1.31.0` → `1.32.0`.

1. Open the /src/data/News.js file.
  1. Find the `ReleaseVersion` and `ReleaseDate` variables, and the `ReleaseNotes` array.
  2. Update the version and date.
  3. Update the major features in `ReleaseNotes`, which are then converted into the list.
  4. The end result should look something like this:
      ```
      export const ReleaseVersion = '1.31.0'

      export const ReleaseDate = 'May 19, 2021'

      export const ReleaseNotes = [
        'Re-packaged and redesigned dashboard',
        'eBPF expands into the directory cache',
        'Machine learning-powered collectors',
        'An improved Netdata learning experience',
      ]
      ```
2. Save the file, commit, and push your code. Create a new PR, check the deploy preview, merge it.

## Edit the sidebar

To edit the links displayed in the sidebar, edit sidebars.js. This is a JSON-like file with an entry for every
documentation page. You can add individual docs by typing out the path to that document (minus the `/docs/` folder and
minus the `.md/.mdx extension)`. You can also create new dropdown groupings with the `type: 'category'` option.

See the [Docusaurus docs](https://v2.docusaurus.io/docs/docs-introduction/#sidebar) for details.

## Edit CSS

Global CSS rules are stored in `/src/css/custom.css` file. 

The various pages and components that make up Learn also come with extra CSS using [Tailwind](https://tailwindcss.com/),
which uses utility classes to create styling. You can find these utility classes throughout the components and pages.

For example, the following utility classes style the hero text on the Learn homepage.

```
<div className="z-10 relative w-full md:w-3/4 lg:w-1/2">
  <h1 className="text-2xl lg:text-5xl text-text font-semibold mb-6 dark:text-gray-50">{siteConfig.title}</h1>
  <p className="prose text-lg lg:text-xl text-text dark:text-gray-50">{siteConfig.tagline}</p>
</div>
```

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting
service.

## Update Docusaurus

The current version is `v2.1.0`, which, as of June 14, 2021, is the latest version of Docusaurus. Stay tuned to
the [Docusaurus website](https://docusaurus.io/) and [GitHub project](https://github.com/facebook/docusaurus) for future
updates.

Generally, it's not recommended to update unless there's a new feature that's a must-have or a fix to a major bug.
`v2.1.0` is very stable and provides all the functionality we need at this point. Updates also could create
issues with [custom components](#custom-swizzled-docusaurus-components).

To update Docusaurus, open [`package.json`](package.json) and update the string next to `"@docusaurus/core"` and
`"@docusaurus/preset-classic"`. Run `yarn install` to upgrade the dependencies locally, then run `yarn start` to test
the new version. If everything works as expected, commit/push your changes to GitHub.

### Custom (swizzled) Docusaurus components

Every `.js` file in the `/src/theme` folder is a component that has been customized from the defaults supplied by
Docusaurus. This process is called [swizzling](https://docusaurus.io/docs/using-themes#swizzling-theme-components).

The customizations in each file are marked with `BEGIN EDIT`/`END EDIT` comments.

If you update Docusaurus, these swizzled components aren't updated. This could create some breakage if there are major
changes to the default versions of these components in the Docusaurus core. The only solution is to merge the existing
customizations with the new version of the file or remove the customizations altogether.

To merge:

1. Make a copy of the component (`xyz.js`) in the `/src/theme` folder and save it outside the repo.
2. Delete the file/folder for that component.
3. Run `yarn run swizzle @docusaurus/theme-classic NAME`, replacing `NAME` with the name of the component, like
   `DocItem` or `Seo`. You may also have to add a `-- --danger` to the end: `yarn run swizzle @docusaurus/theme-classic
   NAME -- --danger`.
4. Open the newly-created `.js` file in the `/src/theme` folder.
5. Add the customization (the code between `BEGIN EDIT`/`END EDIT`) comments, back into the file in the appropriate
   place.
6. Start Docusaurus with `yarn start` and test.

### Swizzled items in the current version:

| theme                          | component name |
|--------------------------------|----------------|
| @docusaurus/theme-classic      | MDXContent     |
| @docusaurus/theme-classic      | NotFound       |


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

The SRE team also maintains redirects that happen at the Cloudflare level. This includes all the redirects from
`docs.netdata.cloud`. Please contact @netdata/infra to add any rules that should be managed by Cloudflare instead of
Netlify.

### Broken link checker

This repo uses a GitHub Action called [`check-broken-links.yml`](.github/check-broken-links.yml) to test the _internal_
links in each Markdown file.

This action runs at 17:00 UTC every day.

If the action finds broken links, it creates a new issue ([example](https://github.com/netdata/learn/issues/591)). Click
**View the results.** to find which file(s) contain broken links.

## Netdata Community

This repository follows the Netdata Code of Conduct and is part of the Netdata Community.

- [Community Forums](https://community.netdata.cloud/)
- [Netdata Code of Conduct](https://learn.netdata.cloud/contribute/code-of-conduct)
