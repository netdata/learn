---
title: "View active health alarms"
description: "View active alarms and their rich data to discover and resolve anomalies and performance issues across your infrastructure."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/monitor/view-active-alarms.md
---



Every Netdata Agent comes with hundreds of pre-installed health alarms designed to notify you when an anomaly or
performance issue affects your node or the applications it runs.

As soon as you launch a Netdata Agent and [claim it](/docs/agent/get#claim-your-node-on-netdata-cloud), you can view
active alarms in both the local dashboard and Netdata Cloud.

## View active alarms in Netdata Cloud

You can see active alarms from any node in your infrastructure in two ways: Click on the bell 🔔 icon in the top
navigation, or click on the first column of any node's row in Nodes. This column's color changes based on the node's
health status: gray is `CLEAR`, yellow is `WARNING`, and red is `CRITICAL`.

![Screenshot from 2020-09-17
17-21-24](https://user-images.githubusercontent.com/1153921/93541137-70761f00-f90a-11ea-89ef-7948c6213200.png)

The Alarms panel lists all active alarms for nodes within that War Room, and tells you which chart triggered the alarm,
what that chart's current value is, the alarm that triggered it, and when the alarm status first began.

You can use the input field in the Alarms panel to filter active alarms. You can sort by the node's name, alarm, status,
chart that triggered the alarm, or the operating system. Read more about the [filtering
syntax](/docs/visualize/view-all-nodes#filter-and-group-your-infrastructure) to build valuable filters for your
infrastructure.

Click on the 3-dot icon (`⋮`) to view active alarm information or navigate directly to the offending chart in that
node's Cloud dashboard with the **Go to chart** button.

The active alarm information gives you in-depth information about the alarm that's been triggered. You can see the
alarm's configuration, how it calculates warning or critical alarms, and which configuration file you could edit on that
node if you want to tweak or disable the alarm to better suit your needs.

![Screenshot from 2020-09-17
17-21-29](https://user-images.githubusercontent.com/1153921/93541139-710eb580-f90a-11ea-809d-25afe1270108.png)

## View active alarms in the Netdata Agent

Find the bell 🔔 icon in the top navigation to bring up a modal that shows currently raised alarms, all running alarms,
and the alarms log. Here is an example of a raised `system.cpu` alarm, followed by the full list and alarm log:

![Animated GIF of looking at raised alarms and the alarm
log](https://user-images.githubusercontent.com/1153921/80842482-8c289500-8bb6-11ea-9791-600cfdbe82ce.gif)

And a static screenshot of the raised CPU alarm: 

![Screenshot of a raised system CPU
alarm](https://user-images.githubusercontent.com/1153921/80842330-2dfbb200-8bb6-11ea-8147-3cd366eb0f37.png)

The alarm itself is named **system - cpu**, and its context is `system.cpu`. Beneath that is an auto-updating badge that
shows the latest value of the chart that triggered the alarm.

With the three icons beneath that and the **role** designation, you can:

1.  Scroll to the chart associated with this raised alarm.
2.  Copy a link to the badge to your clipboard.
3.  Copy the code to embed the badge onto another web page using an `<embed>` element.

The table on the right-hand side displays information about the health entity that triggered the alarm, which you can
use as a reference to [configure alarms](/docs/monitor/configure-alarms).

## What's next?

With the information that appears on Netdata Cloud and the local dashboard about active alarms, you can [configure
alarms](/docs/monitor/configure-alarms) to match your infrastructure's needs or your team's goals.

If you're happy with the pre-configured alarms, skip ahead to [enable
notifications](/docs/monitor/enable-notifications) to instantly see alarms in email, Slack, PagerDuty, Twilio, and
many other platforms.


