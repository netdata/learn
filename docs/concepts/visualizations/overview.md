<!--
title: "Overview"
sidebar_label: "Overview"
custom_edit_url: "https://github.com/netdata/learn/blob/master/docs/concepts/visualizations/overview.md"
sidebar_position: 1
learn_status: "Published"
learn_topic_type: "Concepts"
learn_rel_path: "visualizations"
learn_docs_purpose: "Introductions to visualizations and what we will cover to this sections"
learn_repo_doc: "True"
-->


**********************************************************************


Ready to get real-time visibility into your entire infrastructure with Netdata Cloud using our cutting edge visualization features? Before we discuss the tool in detail, there's a few things we need to make sure of first.

## Before you start

Before you get started with Netdata Cloud, you should have the open-source Netdata monitoring agent installed. See our
[installation guide](/docs/get-started) for details.

If you already have the Netdata agent running on your node(s), make sure to update it to v1.32 or higher. Read the
[updating documentation](/docs/agent/packaging/installer/update/) for information on how to update based on the method
you used to install Netdata on that node.

## Onboarding with a War Room and Space

As you have likely heard us repeat hundreds of times, getting started with Netdata is as easy as signing in. 
Read the [sign in](/docs/cloud/manage/sign-in) doc for details on the authentication methods we use.

<Link to="https://app.netdata.cloud" className="group">
    <button className="relative text-text bg-gray-200 px-4 py-2 rounded">
        <span className="z-10 relative font-semibold group-hover:text-gray-100">Sign in to Netdata</span>
        <div className="opacity-0 group-hover:opacity-100 transition absolute z-0 inset-0 bg-gradient-to-r from-green to-green-lighter rounded"></div>
    </button>
</Link>

Once signed in with your preferred method, a General [War Room](/docs/cloud/war-rooms) and a [Space](/docs/cloud/spaces) 
named for your login email are automatically created. You can configure more Spaces and War Rooms to help you you organize your team 
and the many systems that make up your infrastructure. For example, you can put product and infrastructure SRE teams in separate 
Spaces, and then use War Rooms to group nodes by their service (`nginx`), purpose (`webservers`), or physical location (`IAD`).

Don't worry! You can always add more Spaces and War Rooms later if you decide to reorganize how you use Netdata Cloud.

## Connect your nodes

From within the created War Rooms, Netdata Cloud prompts you to [connect](/docs/agent/claim) your nodes to Netdata Cloud. Non-admin 
users can users can select from existing nodes already connected to the space or select an admin from a provided list to connect node. 
You can connect any node running Netdata, whether it's a physical or virtual machine, a Docker container, IoT device, and more. 

The connection process securely connects any node to Netdata Cloud using the [Agent-Cloud link](/docs/agent/aclk). By
connecting a node, you prove you have write and administrative access to that node. Connecting to Cloud also prevents any third party
from connecting a node that you control. Keep in mind:

- _You can only connect any given node in a single Space_. You can, however, add that connected node to multiple War Rooms
  within that one Space.
- You must repeat the connection process on every node you want to add to Netdata Cloud.

<Callout type="notice">

**Netdata Cloud ensures your data privacy by not storing metrics data from your nodes**. See our statement on Netdata
Cloud [data privacy](/docs/agent/aclk/#data-privacy) for details on the data that's streamed from your nodes and the
[connecting to cloud](/docs/agent/claim) doc for details about why we implemented the connection process and the encryption methods
we use to secure your data in transit. 

</Callout>

To connect a node, select which War Rooms you want to add this node to with the dropdown, then copy the script given by
Netdata Cloud into your node's terminal.

Hit **Enter**. The script should return `Agent was successfully claimed.`. If the claiming script returns errors, or if
you don't see the node in your Space after 60 seconds, see the [troubleshooting
information](/docs/agent/claim#troubleshooting).

Repeat this process with every node you want to add to Netdata Cloud during onboarding. You can also add more nodes once
you've finished onboarding by clicking the **Connect Nodes** button in the [Space management
area](/docs/cloud/spaces/#manage-spaces).


### Alternatives and other operating systems

**Docker**: You can execute the claiming script Netdata running as a Docker container, or attach the claiming script
when creating the container for the first time, such as when you're spinning up ephemeral containers. See the [connect an agent running in Docker](/docs/agent/claim#connect-an-agent-running-in-docker) documentation for details.

**Without root privileges**: If you want to connect an agent without using root privileges, see our [connect
documentation](/docs/agent/claim#connect-an-agent-without-root-privileges).

**With a proxy**: If your node uses a proxy to connect to the internet, you need to configure the node's proxy settings.
See our [connect through a proxy](/docs/agent/claim#connect-through-a-proxy) doc for details.

## Add bookmarks to essential resources

When an anomaly or outage strikes, your team needs to access other essential resources quickly. You can use Netdata
Cloud's bookmarks to put these tools in one accessible place. Bookmarks are shared between all War Rooms in a Space, so
any users in your Space will be able to see and use them.

Bookmarks can link to both internal and external resources. You can bookmark your app's status page for quick updates
during an outage, a messaging system on your organization's intranet, or other tools your team uses to respond to
changes in your infrastructure.

To add a new bookmark, click on the **Add bookmark** link. In the panel, name the bookmark, include its URL, and write a
short description for your team's reference.

## Interactive composite charts

:::note ⚠️ This version of charts is currently **only** available on Netdata Cloud. We didn't want to keep this valuable
> feature from you, so after we get this into your hands on the Cloud, we will collect and implement your feedback. Together, we will be able to provide the best possible version of charts on the Netdata Agent dashboard, as quickly as possible.:::

Netdata excels in collecting, storing, and organizing metrics in out-of-the-box dashboards. 
To make sense of all the metrics, Netdata offers an enhanced version of charts that update every second. 

These charts provide a lot of useful information, so that you can:

-   Enjoy the high-resolution, granular metrics collected by Netdata
-   Explore visualization with more options such as _line_, _stacked_ and _area_ types (other types like _bar_, _pie_ and _gauges_ are to be added shortly)
-   Examine all the metrics by hovering over them with your cursor
-   Use intuitive tooling and shortcuts to pan, zoom or highlight your charts
-   On highlight, ease access to [Metric Correlations](/docs/cloud/insights/metric-correlations) to see other metrics with similar patterns
-   Have the dimensions sorted based on name or value
-   View information about the chart, its plugin, context, and type
-   Get the chart status and possible errors. On top, reload functionality

These charts will available on [Overview tab](/docs/cloud/visualize/overview), Single Node view, and on your [Custom Dashboards](/docs/cloud/visualize/dashboards). 

Have a look at the can see the overall look and feel of the charts for both with a composite chart from the [Overview tab](/docs/cloud/visualize/overview) and a simple chart from the single node view:

![NRve6zr325.gif](https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/5ecaf5ec-1229-480e-b122-62f63e9df227)

With a quick glance you have immediate information available at your disposal:

-   Chart title and units
-   Action bars
-   Chart area
-   Legend with dimensions

The following sections explain how you can interact with these composite charts in greater detail.

## Play, Pause and Reset

Your charts are controlled using the available [Time controls](/docs/dashboard/visualization-date-and-time-controls#time-controls). Besides these, when interacting with the chart you can also activate these controls by:

-   hovering over any chart to temporarily pause it - this momentarily switches time control to Pause, so that you can hover over a specific timeframe. When moving out of the chart time control will go back to Play (if it was it's previous state)
-   clicking on the chart to lock it - this enables the Pause option on the time controls, to the current timeframe. This is if you want to jump to a different chart to look for possible correlations. 
-   double clicking to release a previously locked chart - move the time control back to Play

    ![23CHKCPnnJ.gif](https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/0b1e111e-df44-4d92-b2e3-be5cfd9db8df)

| Interaction       | Keyboard/mouse | Touchpad/touchscreen | Time control          |
| :---------------- | :------------- | :------------------- | :-------------------- |
| **Pause** a chart | `hover`        | `n/a`                | Temporarily **Pause** |
| **Stop** a chart  | `click`        | `tap`                | **Pause**             |
| **Reset** a chart | `double click` | `n/a`                | **Play**              |

Note: These interactions are available when the default "Pan" action is used. Other actions are accessible via the [Exploration action bar](#exploration-action-bar).

## Title and chart action bar

When you start interacting with a chart, you'll notice valuable information on the top bar. You will see information from the chart title to a chart action bar.

The elements that you can find on this top bar are:

-   Netdata icon: this indicates that data is continuously being updated, this happens if [Time controls](/docs/dashboard/visualization-date-and-time-controls#time-controls) are in Play or Force Play mode
-   Chart status icon: indicates the status of the chart. Possible values are: Loading, Timeout, Error or No data
-   Chart title: on the chart title you can see the title together with the metric being displayed, as well as the unit of measurement
-   Chart action bar: here you'll have access to chart info, change chart types, enables fullscreen mode, and the ability to add the chart to a custom dashboard

![image.png](https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/c8f5f0bd-5f84-4812-970b-0e4340f4773b)

### Chart action bar

On this bar you have access to immediate actions over the chart, the available actions are:

-   Chart info: you will be able to get more information relevant to the chart you are interacting with
-   Chart type: change the chart type from _line_, _stacked_ or _area_
-   Enter fullscreen mode: allows you expand the current chart to the full size of your screen
-   Add chart to dashboard: This allows you to add the chart to an existing custom dashboard or directly create a new one that includes the chart.

<img src="https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/65ac4fc8-3d8d-4617-8234-dbb9b31b4264" width="40%" height="40%" />

## Exploration action bar

When exploring the chart you will see a second action bar. This action bar is there to support you on this task. The available actions that you can see are:

-   Pan
-   Highlight
-   Horizontal and Vertical zooms
-   In-context zoom in and out

<img src="https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/0417ad66-fcf6-42d5-9a24-e9392ec51f87" width="40%" height="40%" />

### Pan

Drag your mouse/finger to the right to pan backward through time, or drag to the left to pan forward in time. Think of it like pushing the current timeframe off the screen to see what came before or after.

| Interaction | Keyboard | Mouse          | Touchpad/touchscreen |
| :---------- | :------- | :------------- | :------------------- |
| **Pan**     | `n/a`    | `click + drag` | `touch drag`         |

### Highlight

Selecting timeframes is useful when you see an interesting spike or change in a chart and want to investigate further, from looking at the same period of time on other charts/sections or triggering actions to help you troubleshoot with an in-context action bar to help you troubleshoot (currently only available on
 Single Node view). The available actions:

-   run [Metric Correlations](/docs/cloud/insights/metric-correlations)
-   zoom in on the selected timeframe

[Metric Correlations](/docs/cloud/insights/metric-correlations) will only be available if you respect the timeframe selection limitations. The selected duration pill together with the button state helps visualize this.

<img src="https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/2ffc157d-0f0f-402e-80bb-5ffa8a2091d5" width="50%" height="50%" />

<p/>

| Interaction                        | Keyboard/mouse                                           | Touchpad/touchscreen |
| :--------------------------------- | :------------------------------------------------------- | :------------------- |
| **Highlight** a specific timeframe | `Alt + mouse selection` or `⌘ + mouse selection` (macOS) | `n/a`                |

### Zoom

Zooming in helps you see metrics with maximum granularity, which is useful when you're trying to diagnose the root cause
of an anomaly or outage. Zooming out lets you see metrics within the larger context, such as the last hour, day, or
week, which is useful in understanding what "normal" looks like, or to identify long-term trends, like a slow creep in
memory usage.

The actions above are _normal_ vertical zoom actions. We also provide an horizontal zoom action that helps you focus on a 
specific Y-axis area to further investigate a spike or dive on your charts.

![Y5IESOjD3s.gif](https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/f8722ee8-e69b-426c-8bcb-6cb79897c177)

| Interaction                                | Keyboard/mouse                       | Touchpad/touchscreen                                 |
| :----------------------------------------- | :----------------------------------- | :--------------------------------------------------- |
| **Zoom** in or out                         | `Shift + mouse scrollwheel`          | `two-finger pinch` <br />`Shift + two-finger scroll` |
| **Zoom** to a specific timeframe           | `Shift + mouse vertical selection`   | `n/a`                                                |
| **Horizontal Zoom** a specific Y-axis area | `Shift + mouse horizontal selection` | `n/a`                                                |

You also have two direct action buttons on the exploration action bar for in-context `Zoom in` and `Zoom out`.

## Other interactions

### Order dimensions legend

The bottom legend of the chart where you can see the dimensions of the chart can now be ordered by:

-   Dimension name (Ascending or Descending)
-   Dimension value (Ascending or Descending)

<img src="https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/d3031c35-37bc-46c1-bcf9-be29dea0b476" width="50%" height="50%" />

### Show and hide dimensions

Hiding dimensions simplifies the chart and can help you better discover exactly which aspect of your system might be
behaving strangely.

| Interaction                            | Keyboard/mouse  | Touchpad/touchscreen |
| :------------------------------------- | :-------------- | :------------------- |
| **Show one** dimension and hide others | `click`         | `tap`                |
| **Toggle (show/hide)** one dimension   | `Shift + click` | `n/a`                |

### Resize

To resize the chart, click-and-drag the icon on the bottom-right corner of any chart. To restore the chart to its original height,
double-click the same icon.

![AjqnkIHB9H.gif](https://images.zenhubusercontent.com/60b4ebb03f4163193ec31819/1bcc6a0a-a58e-457b-8a0c-e5d361a3083c)

*******************************************************************************
