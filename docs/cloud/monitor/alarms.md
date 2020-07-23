---
title: Audit active alarms
description: Track the health of your infrastructure in one place by taking advantage of the powerful health monitoring watchdog running on every node.
custom_edit_url: null
---

Netdata Cloud receives information about active alarms on individual nodes in your infrastructure and updates the Cloud
UI based those status changes.

You can see active alarms from any node in your infrastructure in two ways: Click on the bell icon in the top
navigation, or click on the first column of any node's row in Nodes. This column's color changes based on the node's
health status: gray is `clear`, yellow is `warning`, and red is `critical`.

![The active alarms panel in Netdata Cloud](/img/docs/cloud/active-alarms.png)

The Alarms panel lists all active alarms for nodes within that War Room, and tells you which chart triggered the alarm,
what that chart's current value is, the alarm that triggered it, and when the alarm status first began.

## Troubleshoot with active alarm information and context

Click on the 3-dot icon (`⋮`) to view active alarm information or navigate directly to the offending chart in that
node's Cloud-enabled dashboard with the **Go to chart** button.

The active alarm information gives you in-depth information about the alarm that's been triggered. You can see the
alarm's configuration, how it calculates warning or critical alarms, and which configuration file you could edit on that
node if you want to tweak or disable the alarm to better suit your needs.

When you click on the **Go to chart** button, the Cloud interface switches to that node's dashboard and auto-scrolls to
the relevant chart. You can then use the real-time metrics in that chart, and the node's hundreds of other charts, to
begin the process of troubleshooting the root cause and determining the best fix.

## Configure alarm types, triggers, and values

Netdata Cloud uses each node's health and alarm configuration to enrich the Alarms panel and change states. Every node
comes with hundreds of pre-configured alarms that have been tested by Netdata's community of DevOps engineers and SREs,
but you may want to customize existing alarms or create new ones entirely.

Read our [health monitoring quickstart](/docs/agent/health/quickstart) to learn how to tweak existing alarms or create
new triggers based on the specific needs of your infrastructure. By taking charge of alarm configuration, you'll ensure
Netdata Cloud always delivers the most relevant alarms about the well-being of your nodes.

## What's next?

If you're through with setting up alarms, it might be time to [invite your
team](/docs/cloud/collaborate/invite-your-team).

And if you haven't already put some thought into how you organize your Spaces and War Rooms, check out some of our
[recommendations](/docs/cloud/organize#war-rooms).
