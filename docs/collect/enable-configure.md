---
title: "Enable or configure a collector"
description: "Every collector is highly configurable, allowing them to collect metrics from any node and any infrastructure."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/collect/enable-configure.md
---



While collectors start collecting right away if they find exposed metrics on their default endpoint, not all
infrastructures use standard ports, paths, files, or naming conventions. You may need to enable or configure a collector
to gather all available metrics from your systems, containers, or applications.

## Enable a collector or its orchestrator

You can enable/disable collectors individually, or enable/disable entire orchestrators, using their configuration files.
For example, you can change the behavior of the Go orchestator, or any of its collectors, by editing `go.d.conf`.

Use `edit-config` from your [Netdata config directory](/docs/agent/configure/nodes#the-netdata-config-directory) to open
the orchestrator's primary configuration file:

```bash
cd /etc/netdata
sudo ./edit-config go.d.conf
```

Within this file, you can either disable the orchestrator entirely (`enabled: yes`), or find a specific collector and
enable/disable it with `yes` and `no` settings. Uncomment any line you change to ensure the Netdata deamon reads it on
start.

After you make your changes, restart the Agent with `service netdata restart`.

## Configure a collector

First, [find the collector](/docs/agent/collectors/collectors) you want to edit and open its documentation. Some software has
collectors written in multiple languages. In these cases, you should always pick the collector written in Go.

Use `edit-config` from your [Netdata config directory](/docs/agent/configure/nodes#the-netdata-config-directory) to open a
collector's configuration file. For example, edit the Nginx collector with the following:

```bash
./edit-config go.d/nginx.conf
```

Each configuration file describes every available option and offers examples to help you tweak Netdata's settings
according to your needs. In addition, every collector's documentation shows the exact command you need to run to
configure that collector. Uncomment any line you change to ensure the collector's orchestrator or the Netdata daemon
read it on start.

After you make your changes, restart the Agent with `service netdata restart`.

## What's next?

Read high-level overviews on how Netdata collects [system metrics](/docs/agent/collect/system-metrics), [container
metrics](/docs/agent/collect/container-metrics), and [application metrics](/docs/agent/collect/application-metrics).

If you're already collecting all metrics from your systems, containers, and applications, it's time to move into
Netdata's visualization features. [View all your nodes at a glance](/docs/agent/visualize/view-all-nodes) or learn how to
[interact with dashboards and charts](/docs/agent/visualize/interact-dashboards-charts).


