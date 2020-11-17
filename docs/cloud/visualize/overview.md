---
title: Overview
description: The Overview uses composite charts to display real-time aggregated metrics from all the nodes in a given War Room.
custom_edit_url: null
---

The Overview is one way to monitor infrastructure using Netdata Cloud. While the interface might look similar to local
dashboards served by an Agent, or even the single-node dashboards in Netdata Cloud, Overview uses **composite charts**.
These charts display real-time aggregated metrics from all the nodes (or a filtered selection) in a given War Room.

With Overview's composite charts, you can see your infrastructure from a single pane of glass, discover trends or
anomalies, then drill down by grouping metrics by node and jumping to single-node dashboards for root cause analysis.

![The War Room
Overview](https://user-images.githubusercontent.com/1153921/95637683-31d60f00-0a47-11eb-9808-9f591ba8eb3a.png)

## Before you get started

Only nodes with v1.25.0-127 or later of the [Netdata Agent](https://github.com/netdata/netdata) can contribute to
composite charts. If your node(s) use an earlier, incompatible version of the Netdata Agent, you will see them marked as
**needs upgrade** in the tooltip that appears when hovering over **X Issues**. 

![Tooltip showing nodes that need to be
upgraded](https://user-images.githubusercontent.com/1153921/95638372-3c91a380-0a49-11eb-946d-42bfc1f04da7.png)

See our [update docs](/docs/agent/packaging/installer/update) for the preferred update method based on how you installed
the Agent.

## Utility bar

At the top of the Overview is the utility bar. This bar contains a dropdown for navigating between the different War
Room views, an input field for filtering the nodes that contribute to a particular view, and a time-picker for
visualizing specific timeframes of metrics.

See the [War Room docs](/docs/cloud/war-rooms) for details about [filtering](/docs/cloud/war-rooms#node-filter) and the
[time picker](/docs/cloud/war-rooms#time-picker).

## Definition bar

Each chart has a definition bar to provide information about the aggregate function, dimension, and nodes related to
that chart.

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

Click on the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> to jump to
that single-node dashboard in Netdata Cloud.

### Nodes

Click on **X Nodes** to display a dropdown of nodes contributing to that composite chart. Each line displays a hostname
to help you identify which nodes contribute to a chart.

![The nodes dropdown in a composite
chart](https://user-images.githubusercontent.com/1153921/99305049-7c019b80-2810-11eb-942a-8ebfcf236b7f.png)

Click on the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> to jump to
that single-node dashboard in Netdata Cloud.

If one or more nodes can't contribute to a given chart, the definition bar shows a warning symbol plus the number of
affected nodes, then lists them in the dropdown along with the associated error. Nodes might return errors because of
networking issues, a stopped `netdata` service, or because that node does not have any metrics for that context.

### Group by dimension or node

Click on the **By dimension** dropdown to change how a composite chart groups metrics. The default is _by dimension_, so
that each line/area in the visualization is the aggregation of a single dimension.

![The group by
dropdown](https://user-images.githubusercontent.com/1153921/99305054-7d32c880-2810-11eb-8e95-dee2ec2ce5ff.png)

A composite chart grouped _by node_ visualizes a single metric across contributing nodes. If the composite chart has 5
contributing nodes, there will be 5 lines/areas, one for the most relevant dimension from each node. Grouping by nodes
allows you to quickly understand which nodes in your infrastructure are experiencing anomalous behavior.

Click on **X Nodes**, then the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> to quickly
jump to the single-node dashboard for that node to continue root cause analysis or run [Metric
Correlations](/docs/cloud/insights/metric-correlations).

## Interacting with composite charts: pan, zoom, and resize

You can interact with composite charts as you would with other Netdata charts. You can use the controls beneath each
chart to pan, zoom, or resize the chart, or use various combinations of the keyboard and mouse. See the [chart
interaction doc](/docs/visualize/interact-dashboards-charts#interact-with-charts) for details.

## Menu

The Overview uses a similar menu to local Agent dashboards and single-node dashboards in Netdata Cloud, with sections
and sub-menus aggregated from every contributing node. For example, even if only two nodes actively collect from and
monitor an Apache web server, the **Apache** section still appears and displays composite charts from those two nodes.

![A menu in the Overview
screen](https://user-images.githubusercontent.com/1153921/95785094-fa0ad980-0c89-11eb-8328-2ff11ac630b4.png)

One difference between the Overview's menu and those found in single-node dashboards or local Agent dashboards is that
the Overview condenses multiple services, families, or instances into single sectiosn, sub-menus, and associated charts.

For services, let's say you have two concurrent jobs with the [web_log
collector](https://learn.netdata.cloud/docs/agent/collectors/go.d.plugin/modules/weblog), one for Apache and another for
Nginx. A single-node or local dashboard shows two section, **web_log apache** and **web_log nginx**, whereas the
Overview condenses these into a single **web_log** section containing composite charts from both jobs.

The Overview also consdenses multiple families or multiple instances into a single **all** sub-menu and associated
charts. For example, if Node A has 5 disks, and Node B has 3, each disk contributes to a single `disk.io` composite
chart. The utility bar should show that there are 8 charts from 2 nodes contributing to that chart.

This action applies to disks, network devices, and other metric types that involve multiple instances of a piece of
hardware or software. The Overview currently does not display metrics from filesystems. Read more about families and
instances in our [web server docs](/docs/agent/web).

## Persistence of composite chart settings

When you change a composite chart via its definition bar, Netdata Cloud persists these settings in a query string
attached to the URL in your browser. You can "save" these settings by bookmarking this particular URL, or share it with
colleagues by having them copy-paste it into their browser.

## What's next?

For another way to view an infrastructure from a high level, see the [Nodes view](/docs/cloud/visualize/nodes).

If you need a refresher on how Netdata's charts work, see our doc on [interacting with
charts](/docs/visualize/interact-dashboards-charts).

Or, get more granular with configuring how you monitor your infrastructure by [building new
dashboards](/docs/visualize/create-dashboards).
