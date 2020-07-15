---
title: Add custom dashboards
description: Build custom dashboards that target your infrastructure's unique needs and share them with your team for targeted visual anomaly detection or incident response.
custom_edit_url: null
---

With Netdata Cloud, you can build new dashboards that target your infrastructure's unique needs. Put key metrics from
any number of distributed systems in one place for a bird's eye view of your infrastructure.

## Why build dashboards?

Every infrastructure is unique. While the [Nodes view](/docs/cloud/visualize/nodes) might be helpful to view section
cross-sections of nodes, you might want more control over which charts you see and in what format.

With dashboards, you can aggregate any charts, from any number of nodes, in a single view. Want to see system load from
node A next to Nginx response types from node B? Dashboards can do that.

Charts in dashboards are also fully interactive. You can show/hide dimensions, pan through time, zoom, highlight
specific timeframes, and more, just like you do with charts on your Agent dashboards.

Dashboards are shared between all members of a War Room to encourage collaboration on anomalies and during
troubleshooting. All members of a War Room will be able to access any new dashboard as soon as it's created.

You can use dashboards for several uses:

-   Tailored overviews: Mix and match any chart from any node on your infrastructure to see _the most relevant_ metrics
    on a single UI.
-   Incident response: Quickly navigate through multiple nodes and add relevant charts to a new dashboard for easier
    correlation and troubleshooting when every second counts.
-   SLA monitoring: Put uptime charts from all your services in one place.

## Add a new dashboard

There are two ways to create a new dashboard.

1. Click the Nodes dropdown, then the green **+ Add** button alongside the **Dashboards** option. Enter the dashboard's
   name and click **+ Add**. You can now [add new cards](#working-with-cards).

   ![Animated GIF of adding a new
   dashboard](https://user-images.githubusercontent.com/1153921/87587662-40ef3000-c697-11ea-8989-2f313e963822.gif)

2. When viewing a single node's dashboard in Cloud, click on the dashboard icon <img
   src="https://user-images.githubusercontent.com/1153921/87587846-827fdb00-c697-11ea-9f31-aed0b8c6afba.png"
   alt="Dashboard icon" class="image-inline" />. In the panel, under the **Create new dashboard and...** header, type in
   your new dashboard's name and click **New dashboard**.

   ![Animated GIF of adding a new dashboard from a
   node](https://user-images.githubusercontent.com/1153921/87608714-799e0200-c6b5-11ea-9789-febf0aaf0508.gif)

To see dashboards you've created, click on the dropdown menu for the current War Room. You'll see the names of all the
dashboards you created within that War Room. Click on any of their names to jump to the dashboard.

## Working with cards

Dashboards are made of **cards**. For now, you can add chart cards, but in the future you'll be able to add other types
of cards as well.

There are two ways to add a chart card.

1.  To add a new card to an existing dashboard, click the **Add Chart** button. Select which node you want a chart from,
    then the context. Click the **Add chart** button.

2.  When viewing a single node's dashboard in Cloud, click on the dashboard icon <img
    src="https://user-images.githubusercontent.com/1153921/87587846-827fdb00-c697-11ea-9f31-aed0b8c6afba.png"
    alt="Dashboard icon" class="image-inline" />. In the panel, find the dashboard you want to add this chart to, and
    click the green **+** button.

    ![Animated GIF of adding a chart to an existing
    dashboard](https://user-images.githubusercontent.com/1153921/87587703-4d738880-c697-11ea-89da-c3f62ecc4024.gif)

### Move cards

To move any card, click and hold on the top of the card, then drag it to a new location. A red placeholder indicates the
new location. Once you release your mouse, other charts will re-sort accordingly.

You can't resize cards quite yet, but we're working on it.

### Jump from a card to a single node dashboard

If you want to investigate a single node further based on a chart in your dashboard, you can quickly jump to a single
node dashboard to see all its metrics. Click the 6-dot icon in the corner of any card to open a menu. Click the **Go to
Chart** item to navigate to that chart inside of that node's dashboard.

![Animated GIF of moving to a chart from a
dashboard](https://user-images.githubusercontent.com/1153921/87608819-ba961680-c6b5-11ea-99a0-f90d72953f7c.gif)

## Manage dashboards

We've included a few ways to manage dashboards you've already created.

### Update/save a dashboard

If you've made changes to a dashboard, such as adding or moving cards, the **Save** button is enabled. Click it to save
your most recent changes.

Any other members of the War Room will be able to see these changes the next time they load this dashboard.

### Remove an individual card

Click on the 6-dot icon in the corner of any card to open a menu. Click the **Remove Card** item to remove the card.

### Delete a dashboard

Delete any dashboard by navigating to it and clicking the **Delete** button. This will remove this entry from the
dropdown for every member of this War Room.

## What's next?

Once you've designed a dashboard or two, make sure to [invite your team](/docs/cloud/collaborate/invite-your-team) if
you haven't already. You can add these new users to the same War Room to let them see the same dashboards without any
effort.

Then, ensure your team never misses a warning or critical alarm by enabling
[alarm notifications](/docs/cloud/monitor/notifications).
