# ingest.js

## What does this do?

- Uses the GitHub API to create a tree of every file in the following repositories:
  - `netdata/netdata`
  - `netdata/.github`
  - `netdata/go.d.plugin`
  - `netdata/agent-service-discovery`
- Filters out every file except `.md`/`.mdx` files (L425).
- Filters out specific `.md`/`.mdx` files as defined by `excludePatterns` (L427-L438).
- Downloads the content of each file from GitHub.
- Sanitizes content by removing unnecessary frontmatter, h1s, and Google Analytics tags.
- Renames `README.md` files by the folder that contains them.
- Normalizes links between documents to match the final structure in the `/docs` folder.
- Writes files to their target directory.

## Usage

```
node scripts/ingest.js
```

### Options

The script takes two additional options: a GitHub username and a branch name. These options override the default
username and branch to ingest documentation files from the `netdata/netdata` repository, which are `netdata` and
`master`.

By overriding the defaults, you can test how a documentation file will look and operate when published on Netdata Learn,
or test the functionality of the script itself.

**You must use these options together**.

```
node scripts/ingest.js USER BRANCH
```

> Currently, these options only affect how `ingest.js` pulls files from the `netdata/netdata` repository. The other
> repositories still ingest from the `netdata` user and `master` branches.

#### Example: Override branch only

If you want to pull from a `dashboard` branch that exists _on the `netdata/netdata` repository, pass `netdata` for the
username.

```
node scripts/ingest.js netdata dashboard
```

#### Example: Override both user and branch

For example, let's say you have a fork of the `netdata/netdata` repository under a GitHub account named `userXYZ`. You
also have a `charts` branch on your fork that you want ingest on your local development environment. You would run:

```
node scripts/ingest.js userXYZ charts
```

`ingest.js` now pulls files from the `charts` branch from the `userXYZ/netdata` repository instead of the default.
