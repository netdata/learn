---
title: Metric Correlations
description: Quickly find metrics and charts closely related to an anomaly anywhere in your infrastructure to discover the root cause faster.
custom_edit_url: null
---

The Metric Correlations feature lets you quickly find metrics and charts related to an anomaly or particular window of
interest that you want to explore further. By displaying the standard Netdata dashboard, having filtered out charts that
are not relevant to an anomaly or performance issue, you can more quickly traverse your node's metrics and discover the
root cause.

Because Metric Correlations uses every available metric from that node, with as high as 1-second granularity, you get
the most accurate insights using every possible metric.

## Using Metric Correlations

To use Metric Correlations feature, you need to be viewing a **single-node dashboard** in Netdata Cloud. From the [Nodes
view](/docs/cloud/visualize/nodes), click on the hostname of the node you're interested in. From the
[Overview](/docs/cloud/visualize/overview), click on **X Charts** or **X Nodes** to reveal a dropdown, then click on
the link icon <img class="img__inline img__inline--link"
src="https://user-images.githubusercontent.com/1153921/95762109-1d219300-0c62-11eb-8daa-9ba509a8e71c.png" /> to jump to
that node's dashboard in Netdata Cloud.

When viewing the single-node dashboard, the **Metric Correlations** button appears in top right corner of the page.

![The Metric Correlations button in a single-node
dashboard](https://user-images.githubusercontent.com/82235632/126153864-5dad7c59-09d3-4a9a-9b42-dc9e82598859.png)

To start correlating metrics, click the **Metric Correlations** button, then hold the `Alt` key (or `⌘` on macOS) and
click-and-drag a selection of metrics on a single chart. The selected timeframe needs to be at least 15 seconds
for Metric Correlation to work best. 

![An animated GIF of using the Metric Correlation
feature](https://user-images.githubusercontent.com/82235632/126774050-74cc0f-22e6-4edc-b42c-1196bac28622.gif)

The menu then displays information about the selected area and reference baseline. Metric Correlations uses the
reference baseline to discover which additional metrics are most closely connected to the selected metrics.

Press the **Find Correlations** button to start up the correlations service, the button is only enabled when a valid timeframe is selected (at least 15 seconds). Once pressed, the service will score all available metrics on your
node and returns a filtered version of the Netdata dashboard. Now, you'll see only those metrics that have changed the
most between a baseline window and the highlighted window you have selected.

These charts are fully interactive, and whenever possible, will only show the _dimensions_ related to the anomaly you
selected.

You can interact with all the scored metrics via the slider. Slide toward **show less** for more nuanced and significant
results, or toward **show more** to "loosen" the threshold to explore other charts that may have changed too, but in a
less significant manner.

If you find something else interesting in the results, you can select another window and press **Find Correlations**
again to kick the process off again.

## What's next?

If you aren't yet familiar with the power of Netdata Cloud's visualization features, check out the [Nodes
view](/docs/cloud/visualize/nodes) and learn how to [build new dashboards](/docs/cloud/visualize/dashboards).
