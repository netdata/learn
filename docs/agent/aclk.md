---
title: "Agent-Cloud link (ACLK)"
description: "The Agent-Cloud link (ACLK) is the mechanism responsible for connecting a Netdata agent to Netdata Cloud."
date: 2020-04-15
custom_edit_url: https://github.com/netdata/netdata/edit/master/aclk/README.md
---



The Agent-Cloud link (ACLK) is the mechanism responsible for connecting a Netdata Agent to Netdata Cloud. The ACLK uses
[MQTT](https://en.wikipedia.org/wiki/MQTT) over secure websockets to first create, persist, encrypt the connection, and
then enable the features found in Netdata Cloud. _No data is exchanged with Netdata Cloud until you claim a node._

Read our [claiming documentation](/docs/agent/claim) for a guide for claiming a node using the ACLK and additional
troubleshooting and reference information.

## Enable and configure the ACLK

The ACLK is enabled by default and automatically configured if the prerequisites installed correctly. You can see this
in the `[cloud]` section of `netdata.conf`.

```conf
[cloud]
    cloud base url = https://app.netdata.cloud
```

If your Agent needs to use a proxy to access the internet, you must [set up a proxy for
claiming](/docs/agent/claim#claiming-through-a-proxy).

## Disable the ACLK

You have two options if you prefer to disable the ACLK and not use Netdata Cloud:

1.  Pass `--disable-cloud` to `netdata-installer.sh` during installation. When you pass this parameter, the installer
    does not download or compile any extra libraries, and the Agent behaves as though the ACLK, and thus Netdata Cloud,
    does not exist. ACLK functionality is available in the Agent but remains fully inactive.

2.  Change a runtime setting in your `netdata.conf` file. This setting only stops the Agent from attempting any
    connection via the ACLK, but does not prevent the installer from downloading and compiling the ACLK's dependencies.

```conf
[global]
    netdata cloud = disable
```


