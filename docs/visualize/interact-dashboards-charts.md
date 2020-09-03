---
title: "Interact with dashboards and charts"
sidebar_label: "Interact with dashboards and charts"
description: ""
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/visualize/interact-dashboards-charts.md
---



t/k

### Navigate the dashboard

Moving around either dashboard is exactly the same. Netdata groups like metrics together, so you can simply scroll up or
down to quickly learn about the health and performance of your node. You can also use the menu to navigate between different sections of metrics. That's where you'll see 

### Interact with charts

Charts are interactive so that you can find exactly the right information at exactly the right moment in time. You can
show or hide dimensions and resize each chart to see more your node's metrics in more detail.

To investigate historical metrics, you can click and drag to scrub through time or zoom in and out using `SHIFT` plus
your scroll wheel. Hold `ALT` and drag a selection of time to highlight it, which makes it more pronounced when
investigating potentially correlated changes in your node's metrics.

In Netdata Cloud, you can click on the **add to dashboard** icon <img
src="https://user-images.githubusercontent.com/1153921/87587846-827fdb00-c697-11ea-9f31-aed0b8c6afba.png" alt="Dashboard
icon" class="image-inline" /> to begin creating a new dashboard for grouping and correlating like metrics from your
single node.

<video controls="controls">
  <source type="video/mp4" src="/video/cloud/visualize/dashboards/flow.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

Learn more about using charts in the [interaction guide](/docs/visualize/interact-dashboard-charts).