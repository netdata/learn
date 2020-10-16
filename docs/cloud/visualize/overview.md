---
title: Overview
description: The Overview uses composite charts to display real-time aggregated metrics from all the nodes in a given War Room.
custom_edit_url: null
---

The Overview is one way to monitoring infrastructure using Netdata Cloud. While the interface might look similar to
local dashboards served by an Agent, or even the single-node dashboards in Netdata Cloud, Overview uses **composite
charts**. These charts display real-time aggregated metrics from all the nodes (or a filtered selection) in a given War
Room.

With Overview's composite charts, you can see your infrastructure from a single pane of glass, discover trends or
anomalies, then drill down with filtering or single-node dashboards to see more. 

![The War Room
Overview](https://user-images.githubusercontent.com/1153921/95637683-31d60f00-0a47-11eb-9808-9f591ba8eb3a.png)

You can also use the [Nodes view](/docs/cloud/visualize/nodes) to visualize a War Room's nodes. To switch between them,
use the dropdown in your War Room's utility bar.

## Before you get started

Only nodes with v1.26.0 or later of the [Netdata Agent](https://github.com/netdata/netdata) can contribute to composite
charts. If your node(s) use an earlier, incompatible version of the Netdata Agent, you will see them marked as **needs
upgrade** in the tooltip that appears when hovering over **X Issues**. 

![Tooltip showing nodes that need to be
upgraded](https://user-images.githubusercontent.com/1153921/95638372-3c91a380-0a49-11eb-946d-42bfc1f04da7.png)

See our [update docs](/docs/agent/packaging/installer/update) for the preferred update method based on how you installed
the Agent.

## Using the Overview

The Overview shares much of the same UI as local dashboards or single-node dashboards in Netdata Cloud, but there are a
few key differences and additional features to be aware of.

The Overview consists of three key areas: 

-   A **utility bar** to help you navigate and customize your War Room.
-   The **dashboard of composite charts** for analyzing real-time metrics from across your infrastructure.
-   A **menu** of sections based on the metrics collected on your nodes to help you find relevant charts.

## Utility bar

At the top of the Overview is the utility bar. This bar contains a dropdown for navigating between the different War
Room views, an input field for filtering the nodes that contribute to a particular view, and a time-picker for
visualizing specific timeframes of metrics.

See the [War Room docs](/docs/cloud/war-rooms) for details about [filtering](/docs/cloud/war-room#node-filter) and the
[time picker](/docs/cloud/war-rooms#time-picker).

## Dashboard of composite charts

The Overview's dashboard is similar to local dashboards or single-node dashboards in Netdata Cloud, with a few key UI
differences. We'll cover the differences in the sections below.

### Definition bar

Each chart has a definition bar to provide information about the aggregate function, dimension, and nodes related to
that chart.

Below is an example definition bar for the `system.load` chart, which displays I/O on all disks. This definition bar
informs you that the chart is using the **sum** aggregate function on **all dimensions**, with **6 contributing
charts** from **6 contributing nodes**, and **1 error**.

![The definition bar for the system.load
chart](https://user-images.githubusercontent.com/1153921/96297386-9e9c5c80-0fa5-11eb-8c5a-b2e78e2c11b7.png)

#### Aggregate functions

Each chart uses an opinionated-but-valuable default aggregate function. For example, the `system.cpu` chart shows the
average of all dimensions, while the `system.load` chart shows the sum of all dimensions.

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

#### Dimensions

Select which dimensions to display on the composite chart. You can choose **All dimensions**, a single dimension, or any
number of dimensions available on that context.

#### Charts

Click on **X Charts** to display a dropdown of contexts and nodes contributing to that composite chart. Each line in the
dropdown displays a context and the associated node's hostname.

![The charts dropdown in a composite
chart](https://user-images.githubusercontent.com/1153921/96297515-cf7c9180-0fa5-11eb-9880-43c0434ac386.png)

Click on the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> to quickly
_jump to the same chart in that node's Cloud dashboard_.

#### Nodes

Click on **X Nodes** to display a dropdown of nodes contributing to that composite chart. Each line displays a hostname
to help you identify which nodes contribute to a chart.

![The nodes dropdown in a composite
chart](https://user-images.githubusercontent.com/1153921/96297517-d0152800-0fa5-11eb-8a83-b6610fedc215.png)

Click on the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> to quickly
_jump to the top of that node's Cloud dashboard_.

If one or more nodes can't contribute to a given chart, the definition bar shows a warning symbol plus the number of
affected nodes, then lists them in the dropdown along with the associated error. Nodes might return errors because of
networking issues, a stopped `netdata` service, or because that node does not have any metrics for that context.

### Pan, zoom, and resize

You can interact with composite charts as you would with other Netdata charts. You can use the controls beneath each
chart to pan, zoom, or resize the chart, or use various combinations of the keyboard and mouse. See the [chart
interaction doc](/docs/visualize/interact-dashboards-charts#interact-with-charts) for details.

### Dimensions

Composite charts display dimensions below the chart rather than beside it.

![Dimensions beneath a composite
chart](https://user-images.githubusercontent.com/1153921/96297655-09e62e80-0fa6-11eb-8066-b07d28e11981.png)

You can still click on any one dimension to filter the chart and show only its values, or use `SHIFT + click` to hide or show dimensions one at a time.

### Menu

The Overview uses a similar menu to local Agent dashboards and single-node dashboards in Netdata Cloud, with sections
and sub-menus aggregated from every contributing node. For example, even if only two nodes actively collect from and
monitor an Apache web server, the *Apache** section still appears and displays composite charts from those two nodes.

![A menu in the Overview
screen](https://user-images.githubusercontent.com/1153921/95785094-fa0ad980-0c89-11eb-8328-2ff11ac630b4.png)

One difference between the Overview's menu and those found elsewhere is that the Overview condenses multiple families
into a single **all** sub-menu and associated charts. For example, if Node A has 5 disks, and Node B has 3, each disk
contributes to a single `disk.io` composite chart. The utility bar should show that there are 8 charts from 2 nodes
contributing to that chart.

This aggregation applies to disks, network devices, and other metric types that involve multiple instances of a piece of
hardware or software. The Overview currently does not display metrics from filesystems. Read more about families in our
[web server docs](/docs/agent/web).

## What's next?

For another way to view an infrastructure from a high level, see the [Nodes view](/docs/cloud/visualize/nodes).

If you need a refresher on how Netdata's charts work, see our doc on [interacting with
charts](/docs/visualize/interact-dashboards-charts).

Or, get more granular with configuring how you monitor your infrastructure by [building new
dashboards](/docs/visualize/create-dashboards).
