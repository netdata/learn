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

Add more metrics columns by clicking the **+ Add metric** button in Node's final column. Choose the context you'd like
to add, give it a relevant name, and select whether you want to see all dimensions (the default), or only the specific
dimensions your team is interested in.

You can also click the gear icon to customize the pre-configured metrics columns that come with every new War Room. You
can change the context, its title, add or remove dimensions, or delete the column altogether.

These customizations appear for anyone else with access to that War Room.

## Troubleshoot with node dashboards

Click on the name of any node to seamlessly navigate to that node's dashboard. This is the same dashboard that comes
pre-configured with every installation of the Netdata Agent, so it features thousands of metrics and hundreds of
interactive charts without needing to waste time setting it up.

With all of the Agent's real-time data at your fingertips, you can first identify health or performance anomalies with
Netdata Cloud, and then engage your team to perform root-cause analysis using the Agent's granular metrics.

## Filter and group your infrastructure

Use the filter input next to the **Nodes** heading to filter your nodes based on your queries. You can enter a text
query that filters by hostname, or use the dropdown that appears as you begin typing to filter by operating system or
the service(s) that node provides.

Use the **Group by** dropdown to choose between no grouping, grouping by the node's alarm status (`critical`, `warning`,
and `clear`), and grouping by the service each node provides.

See what services Netdata Cloud can filter by with [supported collectors list](/docs/agent/collectors/collectors).

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
