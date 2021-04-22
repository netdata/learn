---
title: "Single-node monitoring with Netdata"
sidebar_label: "Single-node monitoring"
description: "Learn dashboard basics, configuring your nodes, and collecting metrics from applications to create a powerful single-node monitoring tool."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/quickstart/single-node.md
---



Because it's free, open-source, and requires only 1% CPU utilization to collect thousands of metrics every second,
Netdata is a superb single-node monitoring tool.

In this quickstart guide, you'll learn how to access your single node's metrics through dashboards, configure your node
to your liking, and make sure the Netdata Agent is collecting metrics from the applications or containers you're running
on your node.

> This quickstart assumes you have installed the Netdata Agent on your node. If you haven't yet, see the [_Get Netdata_
> doc](/docs/agent/get) for details on installation. In addition, this quickstart mentions features available only
> through Netdata Cloud, which requires you to [claim your node](/docs/agent/get#claim-your-node-on-netdata-cloud).

## See your node's metrics

To see your node's real-time metrics, you need to access its dashboard. You can either view the local dashboard, which
runs on the node itself, or see the dashboard through Netdata Cloud. Both methods feature real-time, interactive, and
synchronized charts, with the same metrics, and use the same UI.

The primary difference is that Netdata Cloud also has a few extra features, like creating new dashboards using a
drag-and-drop editor, that enhance your monitoring and troubleshooting experience.

To see your node's local dashboard, open up your web browser of choice and navigate to `http://NODE:19999`, replacing
`NODE` with the IP address or hostname of your Agent. Hit `Enter`. 

![Animated GIF of navigating to the
dashboard](https://user-images.githubusercontent.com/1153921/80825153-abaec600-8b94-11ea-8b17-1b770a2abaa9.gif)

To see a node's dashboard in Netdata Cloud, [sign in](https://app.netdata.cloud). From the **Nodes** view in your
**General** War Room, click on the hostname of your node to access its dashboard through Netdata Cloud.

![Screenshot of an embedded node
dashboard](https://user-images.githubusercontent.com/1153921/87457036-9b678e00-c5bc-11ea-977d-ad561a73beef.png)

Once you've decided which dashboard you prefer, learn about [interacting with dashboards and
charts](/docs/visualize/interact-dashboards-charts) to get the most from Netdata's real-time metrics.

## Configure your node

The Netdata Agent is highly configurable so that you can match its behavior to your node. You will find most
configuration options in the `netdata.conf` file, which is typically at `/etc/netdata/netdata.conf`. The best way to
edit this file is using the `edit-config` script, which ensures updates to the Netdata Agent do not overwrite your
changes. For example:

```bash
cd /etc/netdata
sudo ./edit-config netdata.conf
```

Our [configuration basics doc](/docs/configure/nodes) contains more information about `netdata.conf`, `edit-config`,
along with simple examples to get you familiar with editing your node's configuration.

After you've learned the basics, you should [secure your node](/docs/configure/secure-nodes) using one of our
recommended methods. These security best practices ensure no untrusted parties gain access to your dashboard or its
metrics.

## Collect metrics from your system and applications

Netdata has [300+ pre-installed collectors](/docs/agent/collectors/collectors) that gather thousands of metrics with zero
configuration. Collectors search your node in default locations and ports to find running applications and gather as
many metrics as possible without you having to configure them individually.

These metrics enrich both the local and Netdata Cloud dashboards.

Most collectors work without configuration, but you should read up on [how collectors
work](/docs/collect/how-collectors-work) and [how to enable/configure](/docs/collect/enable-configure) them.

In addition, find detailed information about which [system](/docs/collect/system-metrics),
[container](/docs/collect/container-metrics), and [application](/docs/collect/application-metrics) metrics you can
collect from across your infrastructure with Netdata.

## What's next?

Netdata has many features that help you monitor the health of your node and troubleshoot complex performance problems.
Once you understand configuration, and are certain Netdata is collecting all the important metrics from your node, try
out some of Netdata's other visualization and health monitoring features:

-   [Build new dashboards](/docs/visualize/create-dashboards) to put disparate but relevant metrics onto a single
    interface.
-   [Create new alarms](/docs/monitor/configure-alarms), or tweak some of the pre-configured alarms, to stay on top
    of anomalies.
-   [Enable notifications](/docs/monitor/enable-notifications) to Slack, PagerDuty, email, and 30+ other services.
-   [Change how long your node stores metrics](/docs/store/change-metrics-storage) based on how many metrics it
    collects, your preferred retention period, and the resources you want to dedicate toward long-term metrics
    retention.
-   [Export metrics](/docs/export/external-databases) to an external time-series database to use Netdata alongside
    other monitoring and troubleshooting tools.


