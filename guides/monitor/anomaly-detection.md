---
title: "Machine learning (ML) powered anomaly detection"
description: "Detect anomalies in any system, container, or application in your infrastructure with machine learning and the open-source Netdata Agent."
image: /img/seo/guides/monitor/anomaly-detection.png
author: "Andrew Maguire"
author_title: "Analytics & ML Lead"
author_img: "/img/authors/andy-maguire.jpg"
custom_edit_url: https://github.com/netdata/learn/blob/master/guides/monitor/anomaly-detection.md
---



# Overview

As of [`v1.32.0`](https://github.com/netdata/netdata/releases/tag/v1.32.0), Netdata comes with some ML powered [anomaly detection](https://en.wikipedia.org/wiki/Anomaly_detection) capabilities built into it and available to use out of the box, with zero configuration required (ML was enabled by default in `v1.35.0-29-nightly` in [this PR](https://github.com/netdata/netdata/pull/13158), previously it required a one line config change).

This means that in addition to collecting raw value metrics, the Netdata agent will also produce an [`anomaly-bit`](https://learn.netdata.cloud/docs/agent/ml#anomaly-bit---100--anomalous-0--normal) every second which will be `100` when recent raw metric values are considered anomalous by Netdata and `0` when they look normal. Once we aggregate beyond one second intervals this aggregated `anomaly-bit` becomes an ["anomaly rate"](https://learn.netdata.cloud/docs/agent/ml#anomaly-rate---averageanomaly-bit).

To be as concrete as possible, the below api call shows how to access the raw anomaly bit of the `system.cpu` chart from the [london.my-netdata.io](https://london.my-netdata.io) Netdata demo server. Passing `options=anomaly-bit` returns the anomay bit instead of the raw metric value.

```
https://london.my-netdata.io/api/v1/data?chart=system.cpu&options=anomaly-bit
```

If we aggregate the above to just 1 point by adding `points=1` we get an "[Anomaly Rate](https://learn.netdata.cloud/docs/agent/ml#anomaly-rate---averageanomaly-bit)":

```
https://london.my-netdata.io/api/v1/data?chart=system.cpu&options=anomaly-bit&points=1
```

The fundamentals of Netdata's anomaly detection approach and implmentation are covered in lots more detail in the [agent ML documentation](https://learn.netdata.cloud/docs/agent/ml). 

This guide will explain how to get started using these ML based anomaly detection capabilities within Netdata.

# Netdata Anomaly Advisor

The [Anomaly Advisor](https://learn.netdata.cloud/docs/cloud/insights/anomaly-advisor) is the flagship anomaly detection feature within Netdata. In the "Anomalies" tab of Netdata you will see an overall "Anomaly Rate" chart that aggregates node level anomaly rate for all nodes in a space. The aim of this chart if to make it easy to quickly spot periods of time where the overall "[node anomaly rate](https://learn.netdata.cloud/docs/agent/ml#node-anomaly-rate)" is evelated in some unusual way and for what node or nodes this relates to.