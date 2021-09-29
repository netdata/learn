---
title: Interact with new charts
description: "Learn how to get the most out of Netdata's new charts. These will help you make sense out of all the metrics at your disposal, helping you troubleshoot with real-time, per-second metric data"
type: how-to
custom_edit_url: null
---

> ⚠️ This new version of charts is currently **only** available on Netdata Cloud. We didn't want to keep this valuable
> feature from you, sso after we get this into your hands on the cloud, we will collect and implement your feedback to make sure we are providing the best possible version of the feature on the Netdata Agent dashboard as quickly as possible.

Netdata excels in collecting, storing, and organizing metrics in out-of-the-box dashboards. To transform all this data into a visualization tool effective in making sense out of all the available metrics, we introduce a new version of Netdata charts. These
will provide a lot of useful information and we invite you to further explore your data.

Built on top of charts, that update every second with new metrics, we aimed to bring the following to you:
* Enjoy the high resolution and granularity of metrics collected by Netdata
* Explore visualization with more options such as _line_, _stacked_ and _area_ types (other types like _bar_, _pie_ and _gauges_ are to be added shortly)
* Examine all the metrics where your cursor is with a tooltip
* Use intuitive tooling and shortcuts to pan, zoom or highlight your charts
* On highlight, ease access to [Metric Correlations](/docs/cloud/insights/metric-correlations) so you can see which other metrics have similar patterns
* Have the dimensions sorted based on name or value
* Full screen mode
* Read useful information about the chart, it’s plugin, context and type
* Get the chart status and possible errors. On top, reload functionality

These new charts will available on [Overview tab](/docs/cloud/visualize/overview), Single Node view and on your [Custom Dashboards](/docs/cloud/visualize/dashboards). 

## Overall

Here is the overall look and feel of the new charts for both: a composite chart, from [Overview tab](/docs/cloud/visualize/overview), and simple chart, from the Single Node view:

#TODO add images

With a quick glance you have immediate information available at your disposal:
* Chart title and units
* Action bars
* Chart area
* Legend with dimensions

## Play, Pause and Reset

Your charts are controlled using the available [Time controls](/docs/dashboard/visualization-date-and-time-controls#time-controls). Besides these, when interacting with the chart you can also activate these controls by:
* hovering over any chart to temporarily pause it - this momentarily switches time control to Pause, so that you can hover over a specific timeframe. When moving out of the chart time control will go back to Play (if it was it's previous state)
* clicking on the chart to lock it - this enables the Pause option on the time controls, to the current timeframe. This is if you want to jump to a different chart to look for possible correlations. 
* double clicking to release a previously locked chart - move the time control back to Play

 #TODO to put a GIF

| Interaction          | Keyboard/mouse | Touchpad/touchscreen | Time control           |
| :----------------    | :------------- | :------------------- | :----------------------|
| **Pause** a chart    | `hover`        | `n/a`                | Temporarily **Pause**  |
| **Stop** a chart     | `click`        | `tap`                | **Pause**              |
| **Reset** a chart    | `double click` | `n/a`                | **Play**               |

## Title and chart action bar

When you start interacting with a chart, you'll notice valuable information on the top bar. You will see information from the chart title to a chart action bar.

The elements that you can find on this top bar are:
* Netdata icon: this indicates that data is continuously being updated, this happens if [Time controls](/docs/dashboard/visualization-date-and-time-controls#time-controls) are in Play or Force Play mode
* Chart status icon: indicates the status of the chart. Possible values are: Loading, Timeout, Error or No data
* Chart title: on the chart title you can see the title together with the metric being displayed, as well as the unit of measurement
* Chart action bar: here you'll have access to chart info, change chart types, enable fullscreen mode and the ability to add the chart to a custom dashboard

#TODO add image

### Chart action bar

On this bar you have access to immediate actions over the chart, the available actions are:
* Chart info: you will be able to get more information relevant to the chart you are interacting with
* Chart type: change the chart type from _line_, _stacked_ or _area_
* Enter fullscreen mode: allows you expand the current chart to the fullsize of your screen
* Add chart to dashboard: you can easily add the chart to an existing custom dashboard or directly create a new one with that chart on it

#TODO add image

## Exploration action bar

When exploring the chart you will see a second action bar. This action bar is there to support you on this task. The available actions that you can see are:
* Pan
* Highlight
* Horizontal and Vertical zooms
* In-context zoom in and out

### Pan

Drag your mouse/finger to the right to pan backward through time, or drag to the left to pan forward in time. Think of it like pushing the current timeframe off the screen to see what came before or after.

| Interaction | Keyboard       | Mouse                | Touchpad/touchscreen |
| :---------- | :------------- | :------------------- | :------------------- |
| **Pan**     | `n/a`          | `click + drag`       | `touch drag`         |

### Highlight

Selecting timeframes is useful when you see an interesting spike or change in a chart and want to investigate further, from looking at the same period of time on other charts/sections or triggering actions to help you troubleshoot with an in-context action bar to help you troubleshoot (currently only available on
 Single Node view). The available actions:
* run [Metric Correlations](/docs/cloud/insights/metric-correlations)
* zoom in on the selected timeframe


[Metric Correlations](/docs/cloud/insights/metric-correlations) will only be available if you respect the timeframe selection limitations. The selected duration pill together with the button state helps visualize this.

#TODO add image

| Interaction                        | Keyboard/mouse                                            | Touchpad/touchscreen |
| :------------------------------    | :-------------------------------------------------------- | :------------------- |
| **Highlight** a specific timeframe | `Alt + mouse selection` or `⌘ + mouse selection` (macOS)  | `n/a`                |

### Zoom

Zooming in helps you see metrics with maximum granularity, which is useful when you're trying to diagnose the root cause
of an anomaly or outage. Zooming out lets you see metrics within the larger context, such as the last hour, day, or
week, which is useful in understanding what "normal" looks like, or to identify long-term trends, like a slow creep in
memory usage.

The above ones are _normal_ vertical zoom actions, we also provide an horizontal zoom action that helps you focus on a 
specific Y-axis area to further investigate a spike or dive on your charts.

#TODO add image

| Interaction                                | Keyboard/mouse                       | Touchpad/touchscreen                                 |
| :-------------------------------           | :--------------------------          | :--------------------------------------------------- |
| **Zoom** in or out                         | `Shift + mouse scrollwheel`          | `two-finger pinch` <br />`Shift + two-finger scroll` |
| **Zoom** to a specific timeframe           | `Shift + mouse vertical selection`   | `n/a`                                                |
| **Horizontal Zoom** a specific Y-axis area | `Shift + mouse horizontal selection` | `n/a`                                                |

You also have two direct action buttons on the exploration action bar for in-context `Zoom in` and `Zoom out`.

## Other interactions

### Order dimensions legend

The bottom legend of the chart where you can see the dimensions of the chart can now be ordered by:
* Dimension name (Ascending or Descending)
* Dimension value (Ascending or Descending)

#TODO add image

### Show and hide dimensions

Hiding dimensions simplifies the chart and can help you better discover exactly which aspect of your system might be
behaving strangely.

| Interaction                            | Keyboard/mouse  | Touchpad/touchscreen |
| :------------------------------------- | :-------------- | :------------------- |
| **Show one** dimension and hide others | `click`         | `tap`                |
| **Toggle (show/hide)** one dimension   | `Shift + click` | `n/a`                |


### Resize

Click-and-drag the icon on the bottom-right corner of any chart. To restore the chart to its original height,
double-click the same icon.

#TODO add GIF

## What's next?

We recommend you read up on the differences between [chart dimensions, contexts, and
families](/docs/dashboard/dimensions-contexts-families) to complete your understanding of how Netdata organizes its
dashboards. Another valuable way to interact with charts is to use the [date and time controls](/docs/dashboard/visualization-date-and-time-controls), which helps you visualize specific moments of historical metrics.

### Further reading & related information

- Dashboard
  - [How the dashboard works](/docs/dashboard/how-dashboard-works)
  - [Chart dimensions, contexts, and families](/docs/dashboard/dimensions-contexts-families)
  - [Date and Time controls](/docs/dashboard/visualization-date-and-time-controls)
  - [Customize the standard dashboard](/docs/dashboard/customize)
  - [Metric Correlations](/docs/cloud/insights/metric-correlations)