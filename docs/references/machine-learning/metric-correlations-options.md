<!--
title: "Metric Correlation Options"
sidebar_label: "Metric Correlation Options"
custom_edit_url: "https://github.com/netdata/learn/blob/master/docs/references/machine-learning/metric-correlation-options.md"
learn_status: "Published"
learn_topic_type: "Concepts"
learn_rel_path: "netdata-hub"
learn_docs_purpose: "Present the options that help users apply metric correlations to their troubleshooting scenario."
learn_repo_doc: "True"
-->


**********************************************************************

Netdata's Metric Correlations (MC) feature enables a few input parameters that users can define to iteratively explore their data in different ways. 
As is usually the case in Machine Learning (ML), there is no "one size fits all" algorithm. What approach works best will typically depend on the type of 
data (which can be very different from one metric to the next) and even the nature of the event or incident you might be exploring in Netdata.

So by when you first run MC,it will use the most sensible and general defaults. But you can also then vary any of the following options to explore further what MC can do for your troubleshooting scenario.

## Method

There are two algorithms available that aim to score metrics based on how much they have changed between the baseline and highlight windows.

- `KS2` - A statistical test ([Two-sample Kolmogorov Smirnov](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test#Two-sample_Kolmogorov%E2%80%93Smirnov_test))
comparing the distribution of the highlighted window to the baseline to try and quantify which metrics have most evidence of a significant change. 
You can explore our implementation [here](https://github.com/netdata/netdata/blob/d917f9831c0a1638ef4a56580f321eb6c9a88037/database/metric_correlations.c#L212).
- `Volume` -  A heuristic measure based on the percentage change in averages between highlighted window and baseline, with various edge cases sensibly controlled for. 
You can explore our implementation [here](https://github.com/netdata/netdata/blob/d917f9831c0a1638ef4a56580f321eb6c9a88037/database/metric_correlations.c#L516).

> **Notes:** 
> - Use the `Volume` algorithm for metrics with a lot of gaps (e.g. request latency when there are few requests)> In most other cases, Netdata recommends you stick with `KS2`.
> - By default, Netdata uses the `KS2` algorithm which is a tried and tested method for change detection in a lot of domains. 
This [Wikipedia](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test) article gives a good overview of how this works. 
Basically, the KS2 method compares each metrics cumulative distribution in the highlight window with its cumulative distribution in the baseline window. 
The statistical test then seeks to quantify the extent to which we can say these two distributions look similar enough to be considered the same or not. 
The `Volume` algorithm is a bit more simple than `KS2`, in that it compares (with some edge cases sensibly handled) the average value of the metric across 
baseline and highlight and looks at the percentage change. Often, both `KS2` and `Volume` will have significant agreement and return similar metrics.
> - `Volume` might favour picking up more sparse metrics that were relatively flat and then came to life with some spikes (or vice versa). 
This is because for such metrics that just don't have that many different values in them, it is impossible to construct cumulative distribution's that can then be 
compared. So `Volume` might be useful in spotting examples of metrics turning on or off. 
![example where volume captured network traffic turning on](https://user-images.githubusercontent.com/2178292/182336924-d02fd3d3-7f09-41da-9cfc-809d01396d9d.png)
> - `KS2` since it relies on the full distribution might be better at highlighting more complex changes that `Volume` is unable to capture. 
For example a change in the variation of a metric might be picked up easily by `KS2` but missed (or just much lower scored) by `Volume` since the 
averages might remain not all that different between baseline and highlight even if their variance has changed a lot. 
![example where KS2 captured a change in entropy distribution that volume alone might not have picked up](https://user-images.githubusercontent.com/2178292/182338289-59b61e6b-089d-431c-bc8e-bd19ba6ad5a5.png)
## Aggregation

Behind the scenes, Netdata will aggregate the raw data as needed such that arbitrary window lengths can be selected for MC. By default, Netdata will just `Average` 
raw data when needed as part of pre-processing. However other aggregations like `Median`, `Min`, `Max`, `Stddev` are also possible.

## Data

Netdata is different than typical observability agents since, in addition to just collecting raw metric values, it will by default also assign 
an "[Anomaly Bit](/docs/agent/ml#anomaly-bit)" related to each collected metric each second. This bit will be 0 for "normal" and 1 for "anomalous". This means 
that each metric also natively has an "[Anomaly Rate](/docs/agent/ml#anomaly-rate)" associated with it and, as such, MC can be run against the raw metric values or 
their corresponding anomaly rates.

**Note**: Read more [here](https://learn.netdata.cloud/guides/monitor/anomaly-detection) to learn more about the native anomaly detection features within netdata.

- `Metrics` - Run MC on the raw metric values.
- `Anomaly Rate` - Run MC on the corresponding anomaly rate for each metric.

> **Note:** - You can use the `Volume` method type with `Anomaly Rate` to ask what metrics have turned most anomalous from baseline to highlighted window. 
You can expand the embedded anomaly rate chart once you have results to see this more clearly. 
![example where Volume and Anomaly Rate together help show what dimensions where most anomalous](https://user-images.githubusercontent.com/2178292/182338666-6d19fa92-89d3-4d61-804c-8f10982114f5.png)

## Metric Correlations on the agent

As of `v1.35.0` Netdata is able to run the Metric Correlations algoritihim 
([Two Sample Kolmogorov-Smirnov test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test#Two-sample_Kolmogorov%E2%80%93Smirnov_test)) on the agent itself. 
This avoids sending the underlying raw data to the original Netdata Cloud based microservice and so typically will be much much faster as no data moves around 
and the computation happens instead on the agent.

When a Metric Correlations request is made to Netdata Cloud, if any node instances have MC enabled then the request will be routed to the 
node instance with the highest hops (e.g. a parent node if one is found or the node itself if not). If no node instances have MC enabled then the request will be 
routed to the original Netdata Cloud based service which will request input data from the nodes and run the computation within the Netdata Cloud backend.

### Enabling/Disabling Metric Correlations on the agent

As of `v1.35.0-22-nightly` metric correlations has been enabled by default on all agents. After further optimizations to the implementation, the impact of running the metric correlations algorithim on the agent was less than the impact of preparing all the data to send to cloud for MC to run in the cloud, as such running MC on the agent is less impactful on local resources than running via cloud.

Should you still want to, disabling nodes for Metric Corrleation on the agent is a simple one line config change. Just set `enable metric correlations = no` in the `[global]` section of `netdata.conf`

## Related Documents 
