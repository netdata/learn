---
title: "Configure your nodes"
sidebar_label: "Configure your nodes"
description: ""
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/configure/nodes.md
---


You will find most
configuration options in the `netdata.conf` file, which is typically at `/etc/netdata/netdata.conf`.

> Some operating systems will place your `netdata.conf` at `/opt/netdata/etc/netdata/netdata.conf`, so check there if
> you find nothing at `/etc/netdata/netdata.conf`.

The best way to edit 


The netdata.conf file is broken up into various sections, such as `[global]`, `[web]`, `, and more. By default, most options are commented, so you'll have to uncomment them (remove the #) for Netdata to recognize your change.

After learning configuration basics, you investigate [add security to your node](/docs/configure/secure-nodes) using one
of a few possible methods based on your needs.




## Start, stop, and restart the Netdata Agent

When you install Netdata, it's configured to start at boot, and stop and restart/shutdown. You shouldn't need to start
or stop Netdata manually, but you will probably need to restart Netdata at some point.

-   To **start** Netdata, open a terminal and run `service netdata start`.
-   To **stop** Netdata, run `service netdata stop`.
-   To **restart** Netdata, run `service netdata restart`.

The `service` command is a wrapper script that tries to use your system's preferred method of starting or stopping
Netdata based on your system. But, if either of those commands fails, try using the equivalent commands for `systemd`
and `init.d`:

-   **systemd**: `systemctl start netdata`, `systemctl stop netdata`, `systemctl restart netdata`
-   **init.d**: `/etc/init.d/netdata start`, `/etc/init.d/netdata stop`, `/etc/init.d/netdata restart`
