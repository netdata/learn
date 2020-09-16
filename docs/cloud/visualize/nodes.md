---
title: View all nodes at a glance
description: See charts from all your nodes in one pane of glass, then dive in to embedded dashboards for granular troubleshooting of ongoing issues.
custom_edit_url: null
---

The Nodes view lets you see and customize key metrics from any number of Agent-monitored nodes and seamlessly navigate
to any node's dashboard for troubleshooting performance issues or anomalies using Netdata's highly-granular metrics.

![The Nodes interface in Netdata Cloud](/img/docs/cloud/list-view.png)

Each War Room's Nodes view is populated based on the nodes you added to that specific War Room. Each node occupies a
single row, first featuring that node's alarm status (yellow for warnings, red for critical alarms) and operating
system, some essential information about the node, followed by columns of user-defined key metrics represented in
real-time charts.

## Add and customize metrics columns

Add more metrics columns by clicking the gear icon in the Nodes view. Choose the context you'd like to add, give it a
relevant name, and select whether you want to see all dimensions (the default), or only the specific dimensions your
team is interested in.

![GIF showing how to add new metrics to the Nodes
view](https://user-images.githubusercontent.com/1153921/87456847-593e4c80-c5bc-11ea-8063-80c768d4cf6e.gif)

You can also click the gear icon and hover over any existing charts, then click the pencil icon. This opens a panel to
edit that chart. You can the context, its title, add or remove dimensions, or delete the chart altogether.

These customizations appear for anyone else with access to that War Room.

## Change the timeframe

By default, the Nodes view shows the last 5 minutes of metrics data on every chart. The value displayed above the chart
is the 5-minute average of those metrics.

You can change the timeframe, and also change both the charts and the average value, by clicking on any of the buttons
next to the **Last** label. **15m** will display the last 15 minutes of metrics for each chart, **30m** for 30 minutes,
and so on.

![GIF showing how to change the timeframe in
Nodes](https://user-images.githubusercontent.com/1153921/87457127-bf2ad400-c5bc-11ea-9f3b-9afa4e4f1855.gif)

## Filter and group your infrastructure

Use the filter input next to the **Nodes** heading to filter the nodes in a given War Room.

Use relational operators (==, !=, contains, and !contains) and logical operators (AND, OR), plus the name, OS, or
services running on your nodes to quickly turn any War Room into a focused troubleshooting interface. See what services
Netdata Cloud can filter by in the [supported collectors list](/docs/agent/collectors/collectors).

For example, `name == centos OR os == debian` filters any nodes by the exact name `centos` or has Debian as its
operating system.

You can also use parentheses around operators to create more sophisticated filters. `(name contains aws AND os contains
ubuntu) OR services == apache` shows only nodes that have `aws` in the hostname and are Ubuntu-based, or any nodes that
have an Apache webserver running on them.

If a filter is invalid or incomplete, Netdata Cloud shows a warning and will not run the filter until it's corrected.

## Troubleshoot with embedded node dashboards

Click on the name of any node to seamlessly navigate to that node's dashboard. This is the same dashboard that comes
pre-configured with every installation of the Netdata Agent, so it features thousands of metrics and hundreds of
interactive charts without needing to waste time setting it up.

![Screenshot of an embedded node
dashboard](https://user-images.githubusercontent.com/1153921/87457036-9b678e00-c5bc-11ea-977d-ad561a73beef.png)

With all of the Agent's real-time data at your fingertips, you can first identify health or performance anomalies with
Netdata Cloud, and then engage your team to perform root-cause analysis using the Agent's granular metrics.

## See more metrics in Netdata Cloud

If you want to add more metrics to your War Rooms and they don't show up when you add new metrics to Nodes, you likely
need to configure those nodes to collect from additional data sources. See our [collectors
quickstart](/docs/agent/collectors/quickstart) to learn how to use dozens of pre-installed collectors that can instantly
collect from your favorite services and applications.

If you want to see up to 30 days of historical metrics in Cloud (and more on individual node dashboards), read our guide
on [long-term storage of historical metrics](/guides/longer-metrics-storage). Also, see our
[calculator](/docs/agent/database/calculator) for finding the disk and RAM you need to store metrics for a certain
period of time.

## What's next?

Now that you know how to view your nodes at a glance, learn how to [track active alarms](/docs/cloud/monitor/alarms)
with the Alarms panel.

You can also set up your Spaces and War Rooms for [collaboration](/docs/cloud/collaborate).
