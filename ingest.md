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
node ingest.js <options>
```


### Options

- For each repository you can change the user and the branch from which the ingest script will pull, with the following 
  keys (defaults are applied)  

  - `netdata/netdata`
  
    - netdata_user:_USER_ (_Default: netdata_)
    - netdata_branch:_BRANCH_ (_Default: master_)

  - `netdata/.github`

    - github_user:_USER_ (_Default: netdata_)
    - github_branch:_BRANCH_ (_Default: main_)
    
  - `netdata/go.d.plugin`

    - go_d_plugin_user:_USER_ (_Default: netdata_)
    - go_d_plugin_branch:_BRANCH_ (_Default: master_)

  - `netdata/agent-service-discovery`

    - agent_service_discovery_user:_USER_ (_Default: netdata_)
    - agent_service_discovery_branch:_BRANCH_ (_Default:master_)

> Always keep in mind, not to leave spaces between the <key>:<value> pairs.


#### Example 1: Override branch only

If you want to pull from a `mybranch` branch that exists on the `netdata/netdata` repository.

```
node ingest.js netdata_branch:mybranch
```

#### Example 2: Multiple ingest from multiple sources.

For example, let's say you have a fork of the `netdata/netdata` and the `netdata/go.d.plugin` repositories under a GitHub 
account named `userXYZ`. You also have a `charts` branch on each forked repository. You would run:

```
node ingest.js netdata_user:userXYZ netdata_branch:charts go_d_plugin_user:userXYZ go_d_plugin_branch:charts
```

`ingest.js` now pulls files from the `charts` branch from each repository (`userXYZ/netdata` and `userXYZ/go.d.plugin`) 
instead of the default. For the other repositories (`netdata/.github`, `netdata/agent-service-discovery`), it will 
ingest from the default settings. 

> In case you misspell the keys (netdata_user, go_d_plugin_user, etc), ingest script will run with the default parameters.
> If you misspell the branch name, or the user, your ingest will fail with response 404 and message "Branch not found".
