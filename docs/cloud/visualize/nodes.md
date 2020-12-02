---
title: Nodes view
description: See charts from all your nodes in one pane of glass, then dive in to embedded dashboards for granular troubleshooting of ongoing issues.
custom_edit_url: null
---

The Nodes view lets you see and customize key metrics from any number of Agent-monitored nodes and seamlessly navigate
to any node's dashboard for troubleshooting performance issues or anomalies using Netdata's highly-granular metrics.

![The Nodes view in Netdata
Cloud](https://user-images.githubusercontent.com/1153921/95637682-313d7880-0a47-11eb-8d0b-4611a5dae431.png)

Each War Room's Nodes view is populated based on the nodes you added to that specific War Room. Each node occupies a
single row, first featuring that node's alarm status (yellow for warnings, red for critical alarms) and operating
system, some essential information about the node, followed by columns of user-defined key metrics represented in
real-time charts.

Use the [Overview](/docs/cloud/visualize/overview) for monitoring an infrastructure in real time using
composite charts and Netdata's familiar dashboard UI.

Check the [War Room docs](/docs/cloud/war-rooms) for details on the utility bar, which contains the [node
filter](/docs/cloud/war-rooms#node-filter) and the [time &amp; date picker](/docs/cloud/war-rooms#time--date-picker).

## Add and customize metrics columns

Add more metrics columns by clicking the gear icon in the Nodes view. Choose the context you'd like to add, give it a
relevant name, and select whether you want to see all dimensions (the default), or only the specific dimensions your
team is interested in.

![GIF showing how to add new metrics to the Nodes
view](https://user-images.githubusercontent.com/1153921/87456847-593e4c80-c5bc-11ea-8063-80c768d4cf6e.gif)

Click the gear icon and hover over any existing charts, then click the pencil icon. This opens a panel to
edit that chart. Edit the context, its title, add or remove dimensions, or delete the chart altogether.

These customizations appear for anyone else with access to that War Room.

## Jump to single-node dashboards

Click on the name of any node to seamlessly navigate to that node's dashboard. This is the same dashboard that comes
pre-configured with every installation of the Netdata Agent, so it features thousands of metrics and hundreds of
interactive charts without needing to waste time setting it up.

![Screenshot of an embedded node
dashboard](https://user-images.githubusercontent.com/1153921/87457036-9b678e00-c5bc-11ea-977d-ad561a73beef.png)

With all of the Agent's real-time data at your fingertips, you can first identify health or performance anomalies with
Netdata Cloud, and then engage your team to perform root-cause analysis using the Agent's granular metrics.

## See more metrics in Netdata Cloud

If you want to add more metrics to your War Rooms and they don't show up when you add new metrics to Nodes, you likely
need to configure those nodes to collect from additional data sources. See our [collectors doc](/docs/collect/enable-configure) 
to learn how to use dozens of pre-installed collectors that can instantly collect from your favorite services and applications.

If you want to see up to 30 days of historical metrics in Cloud (and more on individual node dashboards), read our guide
on [long-term storage of historical metrics](/guides/longer-metrics-storage). Also, see our
[calculator](/docs/store/change-metrics-storage#calculate-the-system-resources-RAM-disk-space-needed-to-store-metrics)
for finding the disk and RAM you need to store metrics for a certain period of time.

## What's next?

Now that you know how to view your nodes at a glance, learn how to [track active alarms](/docs/cloud/monitoring/alarms)
with the Alarms panel.
