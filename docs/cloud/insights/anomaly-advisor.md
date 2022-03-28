---
title: Anomaly Advisor
description: Quickly find anomalous metrics and charts anywhere in your infrastructure.
custom_edit_url: https://github.com/netdata/learn/blob/master/docs/cloud/insights/anomaly-advisor.md
---

The Anomaly Advisor feature lets you quickly surface potentialy anomalous metrics and charts related to a particular window of
interest.

## Using Anomaly Advisor

To use the Anomaly Advisor go to the "anomalies" tab, once you highlight a particular time frame of interest a selection of the most anomalous dimensions will appear. The aim here is to surface the most anomalous metrics in the space or room for the highlighted window to try and cut down on the amount of manual searching required to get to the root cause of your issues.

![image](https://user-images.githubusercontent.com/2178292/160402639-751cf50c-aa2f-4525-9a91-cdd34db48039.png)

The "Anomalous Metrics" chart shows the overall count of anomalous dimensions over time per node.

![image](https://user-images.githubusercontent.com/2178292/160403682-c24f0ecf-cd41-46fe-a1c1-3c341c6656ac.png)

The "Anomaly Rate" chart shows the percentage of anomalous metrics over time per node.

![image](https://user-images.githubusercontent.com/2178292/160403976-6bd7bda7-b7c9-4581-999e-8d89859510bb.png)

The "Anomaly Events Detected" chart shows if the anomaly rate per node was sufficiently elevated to trigger a node level anomaly. 

![image](https://user-images.githubusercontent.com/2178292/160404025-ee8a93e9-e7c8-48b1-9e00-5cd585e9e345.png)

Once you have highlighted a window of interest you should see a ordered list of anomaly rate sparklines in the "Anomaly rates of related metrics" section like below.

![image](https://user-images.githubusercontent.com/2178292/160403151-b1d144c6-53b0-403e-8c41-fb0878fdde49.png)

You can expand any sparkline chart to see the underlying raw data to see how it relates to the corresponding anomaly rate.

![image](https://user-images.githubusercontent.com/2178292/160403496-868f06fc-0551-4a97-810e-873bdb655e9b.png)

You can read more detail on how anomaly detection in the netdata agent works in our [agent docs](https://github.com/netdata/netdata/blob/master/ml/README.md).
