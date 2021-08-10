---
title: "Install Netdata with kickstart.sh"
description: "The kickstart.sh script installs Netdata from source, including all dependencies required to connect to Netdata Cloud, with a single command."
custom_edit_url: https://github.com/netdata/netdata/edit/master/packaging/installer/methods/kickstart.md
---



![](https://registry.my-netdata.io/api/v1/badge.svg?chart=web_log_nginx.requests_per_url&options=unaligned&dimensions=kickstart&group=sum&after=-3600&label=last+hour&units=installations&value_color=orange&precision=0) ![](https://registry.my-netdata.io/api/v1/badge.svg?chart=web_log_nginx.requests_per_url&options=unaligned&dimensions=kickstart&group=sum&after=-86400&label=today&units=installations&precision=0)

This page covers detailed instructions on using and configuring the automatic one-line installation script named
`kickstart.sh`.

This method is fully automatic on all Linux distributions. To install Netdata from source, including all dependencies
required to connect to Netdata Cloud, and get _automatic nightly updates_, run the following as your normal user:

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

> See our [installation guide](/docs/agent/packaging/installer/methods/..) for details about [automatic updates](/docs/agent/packaging/installer/methods/..#automatic-updates) or
> [nightly vs. stable releases](/docs/agent/packaging/installer/methods/..#nightly-vs-stable-releases).

## What does `kickstart.sh` do?

The `kickstart.sh` script does the following after being downloaded and run using `bash`:

-   Detects the Linux distribution and **installs the required system packages** for building Netdata. Unless you added
    the `--dont-wait` option, it will ask for your permission first.
-   Checks for an existing installation, and if found updates that instead of creating a new install.
-   Downloads the latest Netdata source tree to `/usr/src/netdata.git`.
-   Installs Netdata by running `./netdata-installer.sh` from the source tree, using any [optional
    parameters](#optional-parameters-to-alter-your-installation) you have specified.
-   Installs `netdata-updater.sh` to `cron.daily`, so your Netdata installation will be updated with new nightly
    versions, unless you override that with an [optional parameter](#optional-parameters-to-alter-your-installation).
-   Prints a message whether installation succeeded or failed for QA purposes.

## Optional parameters to alter your installation

The `kickstart.sh` script passes all its parameters to `netdata-installer.sh`, which you can use to customize your
installation. Here are a few important parameters:

-   `--dont-wait`: Enable automated installs by not prompting for permission to install any required packages.
-   `--dont-start-it`: Prevent the installer from starting Netdata automatically.
-   `--stable-channel`: Automatically update only on the release of new major versions.
-   `--nightly-channel`: Automatically update on every new nightly build.
-   `--disable-telemetry`: Opt-out of [anonymous statistics](/docs/agent/anonymous-statistics) we use to make
    Netdata better.
-   `--no-updates`: Prevent automatic updates of any kind.
-   `--reinstall`: If an existing install is detected, reinstall instead of trying to update it. Note that this
    cannot be used to change installation types.
-   `--local-files`: Used for [offline installations](/docs/agent/packaging/installer/methods/offline). Pass four file paths: the Netdata
    tarball, the checksum file, the go.d plugin tarball, and the go.d plugin config tarball, to force kickstart run the
    process using those files. This option conflicts with the `--stable-channel` option. If you set this _and_
    `--stable-channel`, Netdata will use the local files.

### Connect node to Netdata Cloud during installation

The `kickstart.sh` script accepts additional parameters to automatically [connect](/docs/agent/claim) your node to Netdata
Cloud immediately after installation. Find the `token` and `rooms` strings by [signing in to Netdata
Cloud](https://app.netdata.cloud/sign-in?cloudRoute=/spaces), then clicking on **Connect Nodes** in the [Spaces management
area](/docs/cloud/spaces#manage-spaces).

- `--claim-token`: The unique token associated with your Space in Netdata Cloud.
- `--claim-rooms`: A comma-separated list of tokens for each War Room this node should appear in.
- `--claim-proxy`: Should take the form of `socks5[h]://[user:pass@]host:ip` for a SOCKS5 proxy, or
  `http://[user:pass@]host:ip` for an HTTP(S) proxy.See [connecting through a
  proxy](/docs/agent/claim#connect-through-a-proxy) for details.
- `--claim-url`: Defaults to `https://app.netdata.cloud`.

For example:

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --claim-token=TOKEN --claim-rooms=ROOM1,ROOM2
```

## Verify script integrity

To use `md5sum` to verify the integrity of the `kickstart.sh` script you will download using the one-line command above,
run the following:

```bash
[ "836190944d062c712296846c45b68c94" = "$(curl -Ss https://my-netdata.io/kickstart.sh | md5sum | cut -d ' ' -f 1)" ] && echo "OK, VALID" || echo "FAILED, INVALID"
```

If the script is valid, this command will return `OK, VALID`.

## What's next?

When you're finished with installation, check out our [single-node](/docs/quickstart/single-node) or
[infrastructure](/docs/quickstart/infrastructure) monitoring quickstart guides based on your use case.

Or, skip straight to [configuring the Netdata Agent](/docs/configure/nodes).

Read through Netdata's [documentation](/docs), which is structured based on actions and
solutions, to enable features like health monitoring, alarm notifications, long-term metrics storage, exporting to
external databases, and more.


