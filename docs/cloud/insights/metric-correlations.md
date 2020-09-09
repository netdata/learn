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

## Enable Metric Correlations

To use Metric Correlations feature, you need to be viewing a single-node dashboard in Netdata Cloud. From the [Nodes
view](/docs/cloud/visualize/nodes), click on the hostname of the node you're interested in.

Next, click on the **Insights** dropdown in the top navigation, and then **Metric Correlations**. A new menu opens up at
the top of the dashboard, replacing the time selector and War Room dropdown. You'll use this menu to start metric
correlation and tweak your results.

## Find correlated metrics

![An animated GIF of using the Metric Correlation
feature](https://user-images.githubusercontent.com/1153921/92631155-d10bb900-f285-11ea-9d03-1345a5b1ce4b.gif)

Hold the `Alt` key and click-and-drag a selection of metrics on a single chart. The selected timeframe needs to be
between 15 and 180 seconds for Metric Correlation to work best.

The Metric Correlation menu then displays information about the selected area and reference baseline, which are used in
together to discover which additional metrics are most closely connected to the selected metrics.

Press the **Find Correlations** button to start up the correlations service, which scores all available metrics on your
node and returns a filtered version of the Netdata dashboard. Now, you'll see only those metrics that have changed the
most between a baseline window and the highlighted window you have selected.

These charts are fully interactive, and whenever possible will only show the _dimensions_ related to the anomaly you
selected.

You can interact with all the scored metrics via the slider, which can be used to **show less** results (i.e. just the
more significant metrics), or **show more** to show more charts and "loosen" the threshold to explore other charts that
may have changed too, but in a less significant manner.

If you find something else interesting in the results, you can select another window and press **Find Correlations**
again to kick the process off again.

## What's next?

If you aren't yet familiar with the power of Netdata Cloud's visualization features, check out the [Nodes
view](/docs/cloud/visualize/nodes) and learn how to [build new dashboards](/docs/cloud/visualize/dashboards).
