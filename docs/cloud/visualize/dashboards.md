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

In the War Room you want to monitor with this dashboard, click on your War Room's dropdown, then click on the green **+
Add** button next to **Dashboards**. In the panel, give your new dashboard a name, and click **+ Add**.

Click the **Add Chart** button to add your first chart card. From the dropdown, select the node you want to add the
chart from, then the context. Netdata Cloud shows you a preview of the chart before you finish adding it. The **Add
Text** button creates a new card with user-defined text, which you can use to describe or document a particular
dashboard's meaning and purpose.

Be sure to click the **Save** button any time you make changes to your dashboard.

![An example multi-node dashboard for system CPU
metrics](https://user-images.githubusercontent.com/1153921/93399129-c1661480-f831-11ea-9570-a5bd401f54db.png)

## Using your dashboard

Dashboards are designed to be interactive and flexible so you can design them to your exact needs. Dashboards are made
of any number of **cards**, which can contain charts or text.

### Chart cards

Click the **Add Chart** button to add your first chart card. From the dropdown, select the node you want to add the
chart from, then the context. Netdata Cloud shows you a preview of the chart before you finish adding it.

The charts you add to any dashboard are fully interactive, just like the charts in an Agent dashboard or a single node's
dashboard in Cloud. Zoom in and out, highlight timeframes, and more. See our [Agent dashboard
docs](https://learn.netdata.cloud/docs/agent/web#using-charts) for all the shortcuts.

Charts also synchronize as you interact with them, even across contexts _or_ nodes.

<video controls="controls">
  <source type="video/mp4" src="/video/cloud/visualize/dashboards/interact-charts.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

### Text cards

The **Add Text** button creates a new card with user-defined text. When you create a new text card or edit an existing
one, select/highlight characters or words to open a modal to make them **bold**, _italic_, or <ins>underlined</ins>. You
can also create a link.

### Move cards

To move any card, click and hold on the top of the card, then drag it to a new location. A red placeholder indicates the
new location. Once you release your mouse, other charts re-sort to the grid system automatically.

### Resize cards

To resize any card on a dashboard, click on the bottom-right corner and drag to the card's new size. Other cards re-sort
to the grid system automatically.

## Investigate and troubleshoot by jumping to single node dashboards

While dashboards help you associate essential charts from distributed nodes on a single pane of glass, you might need
more detail when troubleshooting an issue.

Quickly jump to any node's dashboard by clicking the 3-dot icon in the corner of any card to open a menu. Hit the **Go
to Chart** item.

![Animated GIF of moving to a chart from a
dashboard](https://user-images.githubusercontent.com/1153921/87608819-ba961680-c6b5-11ea-99a0-f90d72953f7c.gif)

You'll land directly on that chart of interest, but you can now scroll up and down to correlate your findings with other
charts. Of course, you can continue to zoom, highlight, and pan through time just as you're used to with Agent
dashboards.

## Pin dashboards

Click on the **Pin** button in any dashboard to put those charts into a separate panel at the bottom of the screen. You
can now navigate through Netdata Cloud freely, individual Cloud dashboards, the Nodes view, different War Rooms, or even
different Spaces, and have those valuable metrics follow you.

Pinning dashboards helps you correlate potentially related charts across your infrastructure, no matter how you
organized your Spaces and War Rooms, and helps you discover root causes faster.

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

Click on the 3-dot icon in the corner of any card to open a menu. Click the **Remove Card** item to remove the card.

### Delete a dashboard

Delete any dashboard by navigating to it and clicking the **Delete** button. This will remove this entry from the
dropdown for every member of this War Room.

### Minimum browser viewport

Because of the visual complexity of individual charts, dashboards require a minimum browser viewport of 800px.

## What's next?

Once you've designed a dashboard or two, make sure to [invite your team](/docs/cloud/collaborate/invite-your-team) if
you haven't already. You can add these new users to the same War Room to let them see the same dashboards without any
effort.
