---
title: "Install Netdata with kickstart.sh"
custom_edit_url: https://github.com/netdata/netdata/edit/master/packaging/installer/methods/kickstart.md
---



![](https://registry.my-netdata.io/api/v1/badge.svg?chart=web_log_nginx.requests_per_url&options=unaligned&dimensions=kickstart&group=sum&after=-3600&label=last+hour&units=installations&value_color=orange&precision=0) ![](https://registry.my-netdata.io/api/v1/badge.svg?chart=web_log_nginx.requests_per_url&options=unaligned&dimensions=kickstart&group=sum&after=-86400&label=today&units=installations&precision=0)

This page covers detailed instructions on using and configuring the automatic one-line installation script named
`kickstart.sh`.

This method is fully automatic on all Linux distributions. To install Netdata from source and get _automatic nightly
updates_, run the following as your normal user:

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

> See our [installation guide](/docs/agent/packaging/installer/methods/..) for details about [automatic updates](/docs/agent/packaging/installer/methods/..#automatic-updates) or
> [nightly vs. stable releases](/docs/agent/packaging/installer/methods/..#nightly-vs-stable-releases).

## What does `kickstart.sh` do?

The `kickstart.sh` script does the following after being downloaded and run using `bash`:

-   Detects the Linux distribution and **installs the required system packages** for building Netdata. Unless you added
    the `--dont-wait` option, it will ask for your permission first.
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
-   `--local-files`: Used for [offline installations](/docs/agent/packaging/installer/methods/offline). Pass four file paths: the Netdata
    tarball, the checksum file, the go.d plugin tarball, and the go.d plugin config tarball, to force kickstart run the
    process using those files. This option conflicts with the `--stable-channel` option. If you set this _and_
    `--stable-channel`, Netdata will use the local files.

## Verify script integrity

To use `md5sum` to verify the intregity of the `kickstart.sh` script you will download using the one-line command above,
run the following:

```bash
[ "2057599f8b11ce56f85aa7f26ce7b15b" = "$(curl -Ss https://my-netdata.io/kickstart.sh | md5sum | cut -d ' ' -f 1)" ] && echo "OK, VALID" || echo "FAILED, INVALID"
```

If the script is valid, this command will return `OK, VALID`.

## What's next?

When you finish installing Netdata, be sure to visit our [step-by-step guide](/docs/agent/guides/step-by-step/step-00) for
a fully-guided tour into Netdata's capabilities and how to configure it according to your needs. 

Or, if you're a monitoring and system administration pro, skip ahead to our [getting started
guide](/docs/agent/getting-started) for a quick overview.
