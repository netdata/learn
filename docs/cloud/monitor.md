---
title: Monitor
description: Add metrics to Cloud, search your infrastructure, view alarm status, and deep-dive to find more real-time metrics.
---

Netdata Cloud gives you the ability to monitor the health and performance of an entire infrastructure in real time, all
in one place. Teams can use two Cloud interfaces, **Nodes** and **active alarms**, in parallel to track anomalies,
outages, and alarms across any number of nodes.

## Monitor at a glance with Nodes

The Nodes view lets you see and customize key metrics from any number of Agent-monitored nodes and seamlessly navigate
to any node's dashboard for granular performance troubleshooting.

![The Nodes interface in Netdata Cloud](/img/docs/cloud/list-view.png)

Each War Room's Nodes view is populated based on the nodes you added to that specific War Room. Each node occupies a
single row, first featuring that node's alarm status (yellow for warnings, red for critical alarms) and operating
system, some essential information about the node, followed by columns of user-defined key metrics represented in
real-time charts.

### Add and customize metrics columns

Add more metrics columns by clicking the **+ Add metric** button in Node's final column. Choose the context you'd like
to add, give it a relevant name, and select whether you want to see all dimensions (the default), or only the specific
dimensions your team is interested in.

You can also click the gear icon to customize the pre-configured metrics columns that come with every new War Room. You
can change the context, its title, add or remove dimensions, or delete the column altogether.

These customizations appear for anyone else with access to that War Room.

### Troubleshoot with node dashboards

Click on the name of any node to seamlessly navigate to that node's dashboard. This is the same dashboard that comes
pre-configured with every installation of the Netdata Agent, so it features thousands of metrics and hundreds of
interactive charts without needing to waste time setting it up.

With all of the Agent's real-time data at your fingertips, you can first identify health or performance anomalies with
Netdata Cloud, and then engage your team to perform root-cause analysis using the Agent's granular metrics.

### Filter and group your infrastructure

Use the filter input next to the **Nodes** heading to filter your nodes based on your queries. You can enter a text
query that filters by hostname, or use the dropdown that appears as you begin typing to filter by operating system or
the service(s) that node provides.

Use the **Group by** dropdown to choose between no grouping, grouping by the node's alarm status (`critical`, `warning`,
and `clear`), and grouping by the service each node provides.

See what services Netdata Cloud can filter by with [supported collectors list](/docs/agent/collectors/collectors/).

## Monitor active alarms

You can see active alarms in two ways: by clicking on the bell icon in the top navigation, or clicking on the first
column of any node's row in Nodes. This column's color changes based on the node's health status—gray is `clear`, yellow
is `warning`, and red is `critical`.

![The active alarms panel in Netdata Cloud](/img/docs/cloud/active-alarms.png)

The Alarms panel lists all active alarms for nodes within that War Room, and tells you which chart triggered the alarm,
what that chart's current value is, the alarm that triggered it, and when the alarm status first began.

### Troubleshoot with active alarm information and context

Click on the 3-dot icon (`⋮`) to view active alarm information or navigate directly to the offending chart in that
node's Cloud-enabled dashboard with the **Go to chart** button.

The active alarm information gives you in-depth information about the alarm that's been triggered. You can see the
alarm's configuration, how it calculates warning or critical alarms, and which configuration file you could edit on that
node if you want to tweak or disable the alarm to better suit your needs.

When you click on the **Go to chart** button, the Cloud interface switches to that node's dashboard and auto-scrolls to
the relevant chart. You can then use the real-time metrics in that chart, and the node's hundreds of other charts, to
begin the process of troubleshooting the root cause and determining the best fix.

## Monitor more metrics and health alarms

Like the open source Agent, Netdata Cloud tries to minimize the time you spend on configuration by auto-detecting your
nodes' operating system, hardware, and important services, and begins showing real-time charts as soon as you finish
claiming that node

If you want to see different metrics or health alarms, you should configure those Agents as needed. We have a wealth of [Agent documentation](/docs/agent/) for every configuration tweak and intricate infrastructure, but here are a few key areas to get you started:

-   [Store more historical metrics](/docs/agent/tutorials/longer-metrics-storage) using the Agent's highly-efficient
    database. Also, see our [calculator](/dbengine-calc/) for finding the disk and RAM you need to store metrics for a
    certain period of time.
-   [Gather more metrics](/docs/agent/collectors/quickstart/) using dozens of pre-installed collectors capable of
    auto-detecting your services and applications.
-   [Tweak or create new alarms](/docs/agent/health/quickstart/) to ensure Cloud's health monitoring features deliver
    warnings and critical alerts most relevant to the needs of your infrastructure.
-   [Get notified](/docs/agent/health/notifications/) about new alarms through your favorite apps, like Discord, Slack,
    PagerDuty, and more.

## What's next?

With monitoring and troubleshooting fundamentals out of the way, it's time to set up your Spaces and War Rooms for
[collaboration](/docs/cloud/collaboration/).
