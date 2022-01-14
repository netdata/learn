---
title: Overview
description: The Overview uses composite charts to display real-time aggregated metrics from all the nodes in a given War Room.
custom_edit_url: https://github.com/netdata/learn/blob/master/docs/cloud/visualize/overview.md
---

The Overview is one way to monitor infrastructure using Netdata Cloud. While the interface might look similar to local
dashboards served by an Agent, or even the single-node dashboards in Netdata Cloud, Overview uses **composite charts**.
These charts display real-time aggregated metrics from all the nodes (or a filtered selection) in a given War Room.

With Overview's composite charts, you can see your infrastructure from a single pane of glass, discover trends or
anomalies, then drill down by grouping metrics by node and jumping to single-node dashboards for root cause analysis.

![The War Room
Overview](https://user-images.githubusercontent.com/1153921/119035632-a0c40080-b964-11eb-8e69-d7fee04613a7.png)

## Before you get started

Only nodes with v1.25.0-127 or later of the the [open-source Netdata](https://github.com/netdata/netdata) monitoring
agent can contribute to composite charts. If your node(s) use an earlier version of Netdata, you will see them marked as
**needs upgrade** in various dropdowns.

See our [update docs](/docs/agent/packaging/installer/update) for the preferred update method based on how you installed
Netdata.

## Composite charts

The Overview uses composite charts, which aggregate metrics from all the nodes (or a filtered selection) in a given War
Room.

## Definition bar

Each composite chart has a definition bar to provide information about the aggregate function, dimension, and nodes
related to that chart.

Below is an example definition bar for the `system.cpu_pressure` chart, which visualizes situations where tasks are
stalled on CPU. This definition bar informs you that the chart is using the **average** aggregate function on **all
dimensions**, with **5 contributing charts** from **5 contributing nodes**, **0 errors**, and that the composite chart
is visualizing metrics **per dimension**.

![The definition bar for a composite
chart](https://user-images.githubusercontent.com/1153921/99305048-7c019b80-2810-11eb-82fa-02fac08d27be.png)

### Aggregate functions

Each chart uses an opinionated-but-valuable default aggregate function. For example, the `system.cpu` chart shows the
average for each dimension from every contributing chart, while the `net.net` chart shows the sum for each dimension
from every contributing chart, which can also come from multiple networking interfaces.

The following aggregate functions are available for each selected dimension:

-   **Average**: Displays the average value from contributing nodes. If a composite chart has 5 nodes with the following
    values for the `out` dimension&mdash;`-2.1`, `-5.5`, `-10.2`, `-15`, `-0.1`&mdash;the composite chart displays a
    value of `−6.58`.
-   **Sum**: Displays the sum of contributed values. Using the same nodes, dimension, and values as above, the composite
    chart displays a metric value of `-32.9`.
-   **Min**: Displays a minimum value. For dimensions with positive values, the min is the value closest to zero. For
    charts with negative values, the min is the value with the largest magnitude.
-   **Max**: Displays a maximum value. For dimensions with positive values, the max is the value with the largest
    magnitude. For charts with negative values, the max is the value closet to zero.

### Dimensions

Select which dimensions to display on the composite chart. You can choose **All dimensions**, a single dimension, or any
number of dimensions available on that context.

### Charts

Click on **X Charts** to display a dropdown of charts and nodes contributing to that composite chart. Each line in the
dropdown displays a chart name and the associated node's hostname.

![The charts dropdown in a composite
chart](https://user-images.githubusercontent.com/1153921/99305050-7c9a3200-2810-11eb-957f-f3f800c3c9b1.png)

### Nodes

Click on **X Nodes** to display a dropdown of nodes contributing to that composite chart. Each line displays a hostname
to help you identify which nodes contribute to a chart.

![The nodes dropdown in a composite
chart](https://user-images.githubusercontent.com/1153921/99305049-7c019b80-2810-11eb-942a-8ebfcf236b7f.png)

If one or more nodes can't contribute to a given chart, the definition bar shows a warning symbol plus the number of
affected nodes, then lists them in the dropdown along with the associated error. Nodes might return errors because of
networking issues, a stopped `netdata` service, or because that node does not have any metrics for that context.

### Group by dimension, node, or chart

Click on the **By dimension** dropdown to change how a composite chart groups metrics.

![The group by
dropdown](https://user-images.githubusercontent.com/1153921/114920803-afa41a00-9dde-11eb-8eaa-b9f0017425ac.png)

The default is _by dimension_, so that each line/area in the visualization is the aggregation of a single dimension.

![A chart grouped by
dimension](https://user-images.githubusercontent.com/1153921/114920565-6a7fe800-9dde-11eb-887d-02acfde837e1.png)

A composite chart grouped _by node_ visualizes a single metric across contributing nodes. If the composite chart has 5
contributing nodes, there will be 5 lines/areas, one for the most relevant dimension from each node. Grouping by nodes
allows you to quickly understand which nodes in your infrastructure are experiencing anomalous behavior.

![A chart grouped by
node](https://user-images.githubusercontent.com/1153921/114920568-6b187e80-9dde-11eb-9068-29831daba8e0.png)

A composite chart group _by chart_ visualizes each instance of a chart as a separate dimension. By grouping the
`disk.io` chart by chart, you can visualize the activity of each disk on each node that contributes to the composite
chart.

![A chart grouped by
chart](https://user-images.githubusercontent.com/1153921/114920564-69e75180-9dde-11eb-80b2-3ca5e5ac29de.png)

### Reset to defaults

Click on the 3-dot icon (**⋮**) on any chart, then **Reset to Defaults**, to reset the definition bar to its initial
state.

## Jump to single-node dashboards

Click on **X Charts**/**X Nodes** to display one of the two dropdowns that list the charts and nodes contributing to a
given composite chart. For example, the nodes dropdown.

![The nodes dropdown in a composite
chart](https://user-images.githubusercontent.com/1153921/99305049-7c019b80-2810-11eb-942a-8ebfcf236b7f.png)

To jump to a single-node dashboard, click on the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> next to the
node you're interested in.

The single-node dashboard opens in a new tab. From there, you can continue to troubleshoot or run [Metric
Correlations](/docs/cloud/insights/metric-correlations) for faster root cause analysis.

## Add composite charts to a dashboard

Click on the 3-dot icon (**⋮**) on any chart, then click on **Add to Dashboard**. Click the **+** button for any
dashboard you'd like to add this composite chart to, or create a new dashboard an initiate it with your chosen chart by
entering the name and clicking **New Dashboard**.

## Interacting with composite charts: pan, zoom, and resize

You can interact with composite charts as you would with other Netdata charts. You can use the controls beneath each
chart to pan, zoom, or resize the chart, or use various combinations of the keyboard and mouse. See the [chart
interaction doc](/docs/dashboard/interact-charts) for details.

## Menu

The Overview uses a similar menu to local Agent dashboards and single-node dashboards in Netdata Cloud, with sections
and sub-menus aggregated from every contributing node. For example, even if only two nodes actively collect from and
monitor an Apache web server, the **Apache** section still appears and displays composite charts from those two nodes.

![A menu in the Overview
screen](https://user-images.githubusercontent.com/1153921/95785094-fa0ad980-0c89-11eb-8328-2ff11ac630b4.png)

One difference between the Overview's menu and those found in single-node dashboards or local Agent dashboards is that
the Overview condenses multiple services, families, or instances into single sections, sub-menus, and associated charts.

For services, let's say you have two concurrent jobs with the [web_log
collector](/docs/agent/collectors/go.d.plugin/modules/weblog), one for Apache and another for Nginx. A single-node or
local dashboard shows two section, **web_log apache** and **web_log nginx**, whereas the Overview condenses these into a
single **web_log** section containing composite charts from both jobs.

The Overview also consdenses multiple families or multiple instances into a single **all** sub-menu and associated
charts. For example, if Node A has 5 disks, and Node B has 3, each disk contributes to a single `disk.io` composite
chart. The utility bar should show that there are 8 charts from 2 nodes contributing to that chart.

This action applies to disks, network devices, and other metric types that involve multiple instances of a piece of
hardware or software. The Overview currently does not display metrics from filesystems. Read more about [families and
instances](/docs/dashboard/dimensions-contexts-families)

## Persistence of composite chart settings

When you change a composite chart via its definition bar, Netdata Cloud persists these settings in a query string
attached to the URL in your browser. You can "save" these settings by bookmarking this particular URL, or share it with
colleagues by having them copy-paste it into their browser.

## What's next?

For another way to view an infrastructure from a high level, see the [Nodes view](/docs/cloud/visualize/nodes).

If you need a refresher on how Netdata's charts work, see our doc on [interacting with
charts](/docs/dashboard/interact-charts).

Or, get more granular with configuring how you monitor your infrastructure by [building new
dashboards](/docs/cloud/visualize/dashboards).
