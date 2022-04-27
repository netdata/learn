---
title: Anomaly Advisor
description: Quickly find anomalous metrics anywhere in your infrastructure.
custom_edit_url: https://github.com/netdata/learn/blob/master/docs/cloud/insights/anomaly-advisor.md
---

The Anomaly Advisor feature lets you quickly surface potentially anomalous metrics and charts related to a particular highlight window of
interest.

🚧 **Note**: This functionality is still under active development and considered experimental. Changes might cause the feature to break. We dogfood it internally and among early adopters within the Netdata community to build the feature. If you would like to get involved and help us with some feedback, email us at analytics-ml-team@netdata.cloud, comment on the [beta launch post](https://community.netdata.cloud/t/anomaly-advisor-beta-launch/2717) in the Netdata community or come join us in the [🤖-ml-powered-monitoring](https://discord.gg/4eRSEUpJnc) channel of the Netdata discord.

## Getting Started

To enable the Anomaly Advisor you must first enable ML on your nodes via a small config change in `netdata.conf`. Once the anomaly detection models have trained on the agent (with default settings this takes a couple of hours until enough data has been seen to train the models) you will then be able to enable the Anomaly Advisor feature in Netdata Cloud. 

### Enable ML on Netdata Agent

To enable ML on your Netdata Agent you just need to edit the `[ml]` section in your `netdata.conf` to look something like below.

```bash
[ml]
    enabled = yes
```

At a minimum you just need to set `enabled = yes` to enable ML with default params. More details about configuration can be found in the [Netdata Agent ML docs](https://learn.netdata.cloud/docs/agent/ml#configuration).

**Note**: Follow [this guide](https://learn.netdata.cloud/guides/step-by-step/step-04) if you are unfamiliar with making configuration changes in Netdata.

When you have finished your configuration, restart Netdata with a command like `sudo systemctl restart netdata` for the config changes to take effect. You can find more info on restarting Netdata [here](https://learn.netdata.cloud/docs/configure/start-stop-restart).

After a while you should see the number of `trained` dimensions start to increase on the "dimensions" chart of the "Anomaly Detection" menu on the Overview page. By default the `minimum num samples to train = 3600` parameter means at least 1 hour of data is required to train initial models, but you could set this to be `900` if you want to train initial models quicker but on less data, over time then they will retrain on up to `maximum num samples to train = 14400` (4 hours by default) but you could increase this is you wanted to train on more data.

![image](https://user-images.githubusercontent.com/2178292/164433258-ee7252be-c9b0-48be-9d68-a5addd4ba84d.png)

Once this line flattens out all configured metrics should have models trained and predicting anomaly scores each second, ready to be used by the new "anomalies" tab of the Anomaly Advisor.

## Using Anomaly Advisor

To use the Anomaly Advisor go to the "anomalies" tab, once you highlight a particular time frame of interest a selection of the most anomalous dimensions will appear below. 

The aim here is to surface the most anomalous metrics in the space or room for the highlighted window to try and cut down on the amount of manual searching required to get to the root cause of your issues.

![image](https://user-images.githubusercontent.com/2178292/164427337-a40820d2-8d36-4a94-8dfb-cfd3194941e0.png)

The "Anomaly Rate" chart shows the percentage of anomalous metrics over time per node. For example in the image below 3.21% of the metrics on the "ml-demo-ml-disabled" node were considered anomalous. This elevated anomaly rate could be a sign of something worth investigating.

**Note**: in this example the anomaly rates for this node are actually being calculated on the parent it streams to, you can run ml on the agent itselt or on a parent the agent stream to. Read more about the various configuration options in the [agent docs](https://github.com/netdata/netdata/blob/master/ml/README.md).

![image](https://user-images.githubusercontent.com/2178292/164428307-6a86989a-611d-47f8-a673-911d509cd954.png)

The "Count of Anomalous Metrics" chart (collapsed by default) shows raw counts of anomalous metrics per node so may often be similar to the anomaly rate chart, apart from where nodes may have different numbers of metrics.

The "Anomaly Events Detected" chart (collapsed by default) shows if the anomaly rate per node was sufficiently elevated to trigger a node level anomaly. Anomaly events will appear slightly after the anomaly rate starts to increase in the timeline, this is because a significant number of metrics in the node need to be anomalous before an anomaly event is triggered.

Once you have highlighted a window of interest you should see an ordered list of anomaly rate sparklines in the "Anomalous metrics" section like below.

![image](https://user-images.githubusercontent.com/2178292/164427592-ab1d0eb1-57e2-4a05-aaeb-da4437a019b1.png)

You can expand any sparkline chart to see the underlying raw data to see how it relates to the corresponding anomaly rate.

![image](https://user-images.githubusercontent.com/2178292/164430105-f747d1e0-f3cb-4495-a5f7-b7bbb71039ae.png)

On the upper right hand side of the page you can select which nodes to filter on if you wish to do so. The ML training status of each node is also displayed. 

On the lower right hand side of the page an index of anomaly rates is displayed for the highlighted timeline of interest. The index is sorted from most anomalous metric (highest anomaly rate) to least (lowest anomaly rate). Clicking on an entry in the index will scroll the rest of the page to the corresponding anomaly rate sparkline for that metric.

You can read more detail on how anomaly detection in the netdata agent works in our [agent docs](https://github.com/netdata/netdata/blob/master/ml/README.md).
