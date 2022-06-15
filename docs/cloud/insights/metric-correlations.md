---
title: Metric Correlations
description: Quickly find metrics and charts closely related to a particular timeframe of interest anywhere in your infrastructure to discover the root cause faster.
custom_edit_url: https://github.com/netdata/learn/blob/master/docs/cloud/insights/metric-correlations.md
---

The Metric Correlations (MC) feature lets you quickly find metrics and charts related to a particular window of
interest that you want to explore further. By displaying the standard Netdata dashboard, filtered to show only charts that
are relevant to the window of interest, you can get to the root cause sooner.

Because Metric Correlations uses every available metric from that node, with as high as 1-second granularity, you get
the most accurate insights using every possible metric.

## Using Metric Correlations

When viewing the single-node dashboard, the **Metric Correlations** button appears in top right corner of the page.

![The Metric Correlations button in a single-node
dashboard](https://user-images.githubusercontent.com/82235632/126153864-5dad7c59-09d3-4a9a-9b42-dc9e82598859.png)

To start correlating metrics, click the **Metric Correlations** button, then hold the `Alt` key (or `⌘` on macOS) and
click-and-drag a selection of metrics on a single chart. The selected timeframe needs to be at least 15 seconds
for Metric Correlation to work best. 

The menu then displays information about the selected area and reference baseline. Metric Correlations uses the
reference baseline to discover which additional metrics are most closely connected to the selected metrics.

Press the **Find Correlations** button to start up the correlations service, the button is only enabled when a valid timeframe is selected (at least 15 seconds). Once pressed, the service will score all available metrics on your
node and returns a filtered version of the Netdata dashboard. Now, you'll see only those metrics that have changed the
most between a baseline window and the highlighted window you have selected.

These charts are fully interactive, and whenever possible, will only show the _dimensions_ related to the timeline you
selected.

You can interact with all the scored metrics via the slider. Slide toward **show less** for more nuanced and significant
results, or toward **show more** to "loosen" the threshold to explore other charts that may have changed too, but in a
less significant manner.

If you find something else interesting in the results, you can select another window and press **Find Correlations**
again to kick the process off again.

## Metric Correlations on the agent

As of `v1.35.0` Netdata is able to run the Metric Correlations algoritihim ([Two Sample Kolmogorov-Smirnov test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test#Two-sample_Kolmogorov%E2%80%93Smirnov_test)) on the agent itself. This avoids sending the underlying raw data to the original Netdata Cloud based microservice and so typically will be much much faster as no data moves around and the computation happens instead on the agent.

When a Metric Correlations request is made to Netdata Cloud, if any node instances have MC enabled then the request will be routed to the node instance with the highest hops (e.g. a parent node if one is found or the node itself if not). If no node instances have MC enabled then the request will be routed to the original Netdata Cloud based service which will request input data from the nodes and run the computation within the Netdata Cloud backend.

#### Enabling/Disabling Metric Correlations on the agent

As of `v1.35.0-22-nightly` metric correlations has been enabled by default on all agents. After further optimizations to the implementation, the impact of running the metric correlations algorithim on the agent was less than the impact of preparing all the data to send to cloud for MC to run in the cloud, as such running MC on the agent is less impactful on local resources than running via cloud.

Should you still want to, disabling nodes for Metric Corrleation on the agent is a simple one line config change. Just set `enable metric correlations = no` in the `[global]` section of `netdata.conf`

## What's next?

If you aren't yet familiar with the power of Netdata Cloud's visualization features, check out the [Nodes
view](/docs/cloud/visualize/nodes) and learn how to [build new dashboards](/docs/cloud/visualize/dashboards).
