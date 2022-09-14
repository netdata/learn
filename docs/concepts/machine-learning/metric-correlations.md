<!--
title: "Metric Correlations"
sidebar_label: "Metric Correlations"
custom_edit_url: "https://github.com/netdata/learn/blob/master/docs/concepts/machine-learning/metric-correlations.md"
learn_status: "Published"
learn_topic_type: "Concepts"
learn_rel_path: "netdata-hub"
learn_docs_purpose: "Present the concept of metric correlations, their purpose and use cases"
learn_repo_doc: "True"
-->


**********************************************************************

The Metric Correlations (MC) feature lets you quickly find metrics and charts related to a particular window of interest that you want to explore further. By displaying the standard Netdata dashboard, filtered to show only charts that are relevant to the window of interest, you can get to the root cause sooner.

Because Metric Correlations uses every available metric from that node, with as high as 1-second granularity, you get the most accurate insights using every possible metric.

## Using Metric Correlations

When viewing the single-node dashboard, the **Metric Correlations** button appears in top right corner of the page.

![The Metric Correlations button in a single-node dashboard](https://user-images.githubusercontent.com/2178292/181750606-4dd5f216-ec83-46c9-92f8-b307264bfd9a.png)

To start correlating metrics, click the **Metric Correlations** button, then hold the `Alt` key (or `⌘` on macOS) and click-and-drag a selection of metrics on a single chart. The selected timeframe needs to be at least 15 seconds for Metric Correlation to work. 

The menu then displays information about the selected area and reference baseline. Metric Correlations uses the reference baseline to discover which additional metrics are most closely connected to the selected metrics. The reference baseline is based upon the period immediately preceding the highlighted window and is the length of 4 times the highlighted window. This is to ensure that the reference baseline is always immediately before the highlighted window of interest and a bit longer so as to ensure its a more representative short term baseline.

Press the **Find Correlations** button to start up the correlations process, the button is only enabled when a valid timeframe is selected (at least 15 seconds). Once pressed, the process will score all available metrics on your node and returns a filtered version of the Netdata dashboard. Now, you'll see only those metrics that have changed the most between a baseline window and the highlighted window you have selected.

![Metric Correlations results](https://user-images.githubusercontent.com/2178292/181751182-25e0890d-a5f4-4799-9936-1523603cf97d.png)

These charts are fully interactive, and whenever possible, will only show the _dimensions_ related to the timeline you selected.

You can interact with all the scored metrics via the slider. Slide toward **show less** for more nuanced and significant results, or toward **show more** to "loosen" the threshold to explore other charts that may have changed too, but in a less significant manner.

If you find something else interesting in the results, you can select another window and press **Find Correlations** again to kick the process off again.


## Metric Correlations on the agent

As of `v1.35.0` Netdata is able to run the Metric Correlations algoritihim ([Two Sample Kolmogorov-Smirnov test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test#Two-sample_Kolmogorov%E2%80%93Smirnov_test)) on the agent itself. This avoids sending the underlying raw data to the original Netdata Cloud based microservice and so typically will be much much faster as no data moves around and the computation happens instead on the agent.

When a Metric Correlations request is made to Netdata Cloud, if any node instances have MC enabled then the request will be routed to the node instance with the highest hops (e.g. a parent node if one is found or the node itself if not). If no node instances have MC enabled then the request will be routed to the original Netdata Cloud based service which will request input data from the nodes and run the computation within the Netdata Cloud backend.

#### Enabling/Disabling Metric Correlations on the agent

As of `v1.35.0-22-nightly` metric correlations has been enabled by default on all agents. After further optimizations to the implementation, the impact of running the metric correlations algorithim on the agent was less than the impact of preparing all the data to send to cloud for MC to run in the cloud, as such running MC on the agent is less impactful on local resources than running via cloud.

Should you still want to, disabling nodes for Metric Corrleation on the agent is a simple one line config change. Just set `enable metric correlations = no` in the `[global]` section of `netdata.conf`

## Usage tips!

- Use the `Volume` algorithm for metrics with a lot of gaps (e.g. request latency when there are few requests), otherwise stick with `KS2`
  - By default, Netdata uses the `KS2` algorithm which is a tried and tested method for change detection in a lot of domains. The [Wikipedia](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test) article gives a good overview of how this works. Basically, it is comparing, for each metric, its cumulative distribution in the highlight window with its cumulative distribution in the baseline window. The statistical test then seeks to quantify the extent to which we can say these two distributions look similar enough to be considered the same or not. The `Volume` algorithm is a bit more simple than `KS2` in that it basically compares (with some edge cases sensibly handled) the average value of the metric across baseline and highlight and looks at the percentage change. Often both `KS2` and `Volume` will have significant agreement and return similar metrics.
  - `Volume` might favour picking up more sparse metrics that were relatively flat and then came to life with some spikes (or vice versa). This is because for such metrics that just don't have that many different values in them, it is impossible to construct cumulative distribution's that can then be compared. So `Volume` might be useful in spotting examples of metrics turning on or off. ![example where volume captured network traffic turning on](https://user-images.githubusercontent.com/2178292/182336924-d02fd3d3-7f09-41da-9cfc-809d01396d9d.png)
  - `KS2` since it relies on the full distribution might be better at highlighting more complex changes that `Volume` is unable to capture. For example a change in the variation of a metric might be picked up easily by `KS2` but missed (or just much lower scored) by `Volume` since the averages might remain not all that different between baseline and highlight even if their variance has changed a lot. ![example where KS2 captured a change in entropy distribution that volume alone might not have picked up](https://user-images.githubusercontent.com/2178292/182338289-59b61e6b-089d-431c-bc8e-bd19ba6ad5a5.png)
- Use `Volume` and `Anomaly Rate` together to ask what metrics have turned most anomalous from baseline to highlighted window. You can expand the embedded anomaly rate chart once you have results to see this more clearly. ![example where Volume and Anomaly Rate together help show what dimensions where most anomalous](https://user-images.githubusercontent.com/2178292/182338666-6d19fa92-89d3-4d61-804c-8f10982114f5.png)

## What's next?

You can read more about all the ML powered capabilities of Netdata [here](https://learn.netdata.cloud/guides/monitor/anomaly-detection). If you aren't yet familiar with the power of Netdata Cloud's visualization features, check out the [Nodes view](/docs/cloud/visualize/nodes) and learn how to [build new dashboards](/docs/cloud/visualize/dashboards).
