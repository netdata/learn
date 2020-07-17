---
title: Build new dashboards
description: Design new dashboards that target your infrastructure's unique needs and share them with your team for targeted visual anomaly detection or incident response.
custom_edit_url: null
---

With Netdata Cloud, you can build new dashboards that target your infrastructure's unique needs. Put key metrics from
any number of distributed systems in one place for a bird's eye view of your infrastructure.

## Why build dashboards?

Every infrastructure is unique. While the [Nodes view](/docs/cloud/visualize/nodes) might be helpful to view section
cross-sections of nodes, you might want more control over which charts you see and in what format.

With dashboards, you can aggregate any charts, from any number of nodes, in a single view. Want to see system load from
node A next to Nginx response types from node B? Dashboards can do that.

Charts in dashboards are also fully interactive and synchronized. You can pan through time, zoom, highlight specific
timeframes, and more, just like you do with charts on your Agent dashboards.

Dashboards are shared between all members of a War Room to encourage collaboration on anomalies and during
troubleshooting. All members of a War Room will be able to access any new dashboard as soon as it's created.

You can use dashboards in many ways. A few examples:

-   Tailored overviews: Mix and match any chart from any node on your infrastructure to see _the most relevant_ metrics
    on a single UI.
-   Incident response: Quickly navigate through multiple nodes and add relevant charts to a new dashboard for easier
    correlation and troubleshooting when every second counts.
-   Internal status page: Use [HTTP endpoint monitoring](/docs/agent/collectors/go.d.plugin/modules/httpcheck) or
    `system.uptime` charts from every node to track the health of your infrastructure from one view.

## Create your first dashboard

The best way to both create a new dashboard and add charts to an existing dashboard is through a single node's dashboard
in Cloud.

First, navigate to the War Room you want to associate with this dashboard. Dashboards are specific to War Rooms, which
means you can add charts from any node in that War Room. Any users you invite to that War Room can also see your new
dashboard once you're finished.

Click on any node from the Nodes view to reveal that node's dashboard. Look for any chart you'd like to add to a new
dashboard, and find the **add to dashboard** icon <img
src="https://user-images.githubusercontent.com/1153921/87587846-827fdb00-c697-11ea-9f31-aed0b8c6afba.png" alt="Dashboard
icon" class="image-inline" />. 

In the panel, under the **Create new dashboard and...** header, type in your new dashboard's name and click **New
dashboard**.

![Animated GIF of adding a new dashboard from a
node](https://user-images.githubusercontent.com/1153921/87608714-799e0200-c6b5-11ea-9789-febf0aaf0508.gif)

Continue adding charts if you'd like. To see your new dashboard, go back to your War Room. Click on the dropdown menu
for the current War Room to find your new dashboard under the **Dashboards** heading. Click your new dashboard's name,
and you'll see your new dashboard with the chart(s) you added.

You're probably eager to add additional charts to this freshly-minted dashboard. Time to interact and design.

## Using your dashboard

Dashboards are designed to be interactive and flexible so you can design them to your exact needs.

The charts you add to any dashboard are fully interactive, just like the charts in an Agent dashboard or a single node's
dashboard in Cloud. Zoom in and out, highlight timeframes, and more. See our [Agent dashboard
docs](https://learn.netdata.cloud/docs/agent/web#using-charts) for all the shortcuts.

Charts also synchronize as you interact with them, even across contexts _or_ nodes.

The only thing you can't do yet is resize charts, but we're working on that.

### Add more cards (charts)

Dashboards are made of **cards**. For now, you can add chart cards, but in the future you'll be able to add other types
of cards as well.

The best way to add chart cards is through the same process as creating a new dashboard. Go to a single node, find the
chart you're interested in, and add it to your existing dashboard. You can also click the **Add Chart** button. Select
which node you want a chart from, then the context. Click the **Add chart** button.

### Move cards

To move any card, click and hold on the top of the card, then drag it to a new location. A red placeholder indicates the
new location. Once you release your mouse, other charts will re-sort accordingly.

## Investigate and troubleshoot by jumping to single node dashboards

While dashboards help you associate essential charts from distributed nodes on a single pane of glass, you might need
more detail when troubleshooting an issue.

Quickly jump to any node's dashboard by clicking the 6-dot icon in the corner of any card to open a menu. Hit the **Go
to Chart** item.

![Animated GIF of moving to a chart from a
dashboard](https://user-images.githubusercontent.com/1153921/87608819-ba961680-c6b5-11ea-99a0-f90d72953f7c.gif)

You'll land directly on that chart of interest, but you can now scroll up and down to correlate your findings with other
charts. Of course, you can continue to zoom, highlight, and pan through time just as you're used to with Agent
dashboards.

## Manage your dashboards

We've included a few ways to manage dashboards you've already created.

To see dashboards you've created, click on the dropdown menu for the current War Room. You'll see the names of all the
dashboards you created within that War Room. Click on any of their names to jump to the dashboard.

### Update/save a dashboard

If you've made changes to a dashboard, such as adding or moving cards, the **Save** button is enabled. Click it to save
your most recent changes. Any other members of the War Room will be able to see these changes the next time they load
this dashboard.

If multiple users attempt to make concurrent changes to the same dashboard, the second user who hits Save will be
prompted to either overwrite the dashboard or reload to see the most recent changes.

### Remove an individual card

Click on the 6-dot icon in the corner of any card to open a menu. Click the **Remove Card** item to remove the card.

### Delete a dashboard

Delete any dashboard by navigating to it and clicking the **Delete** button. This will remove this entry from the
dropdown for every member of this War Room.

### Minimum browser viewport

Because of the visual complexity of individual charts, dashboards require a minimum browser viewport of 800px.

## What's next?

Once you've designed a dashboard or two, make sure to [invite your team](/docs/cloud/collaborate/invite-your-team) if
you haven't already. You can add these new users to the same War Room to let them see the same dashboards without any
effort.

Then, ensure your team never misses a warning or critical alarm by enabling
[alarm notifications](/docs/cloud/monitor/notifications).
