---
title: War Rooms
description: Netdata Cloud uses War Rooms to group related nodes and create insightful composite dashboards based on their aggregate health and performance.
custom_edit_url: null
---

War Rooms are flexible containers for organizing nodes and viewing key metrics in real time. By adding many distributed
nodes to a War Room, you can use different views and dashboards to view your infrastructure on a single pane of glass.
Then, when an anomaly strikes, drill down into single-node dashboards for every granular detail you need for root cause
analysis.

The default view for any War Room is the [Nodes view](/docs/cloud/visualize/nodes), but you can also use the
[Overview](/docs/cloud/visualize/overview), or [create new dashboards](/docs/cloud/visualize/dashboards) from within War
Rooms.

![The default War Room
Overview](https://user-images.githubusercontent.com/1153921/95790534-6559a900-0c94-11eb-8002-3da831caee93.png)

## The utility bar

At the top of every War Room is its utility bar. This bar helps you navigate through the various views and dashboards
available for a given War Room. Each utility bar contains three items: the **View dropdown**, the **node filter**, and
the **time picker**.

### View dropdown

The View dropdown lets you choose between various dashboards for monitoring your infrastructure. You can currently
choose between the [Overview](/docs/cloud/visualize/overview), [Nodes view](/docs/cloud/visualize/nodes), and creating
[new dashboards](/docs/cloud/visualize/dashboards), along with any specific dashboards you might have created already.

![The view
dropdown](https://user-images.githubusercontent.com/1153921/95790189-c6cd4800-0c93-11eb-9abb-8855bf3bc1bf.png)

### Node filter

The node filter allows you to quickly filter the nodes visualized in a War Room's views. It appears on the Overview and
Nodes view, but not on single-node dashboards or new dashboards you might have created.

Use relational operators (==, !=, contains, and !contains) and logical operators (AND, OR), plus the name, OS, or
services running on your nodes to quickly turn any War Room into a focused troubleshooting interface. See what services
Netdata Cloud can filter by in the [supported collectors list](/docs/agent/collectors/collectors).

For example, `name == centos OR os == debian` filters any nodes by the exact name `centos` or has Debian as its
operating system.

You can also use parentheses around operators to create more sophisticated filters. `(name contains aws AND os contains
ubuntu) OR services == apache` shows only nodes that have `aws` in the hostname and are Ubuntu-based, or any nodes that
have an Apache webserver running on them.

If a filter is invalid or incomplete, Netdata Cloud shows a warning and will not run the filter until it's corrected.

### Time picker

By default, all visualizations in Netdata Cloud show the last 15 minutes of metrics data.

The time picker helps you select precise timeframes you want to investigate further. It appears in the Overview, Nodes
view, single-node dashboards, and new dashboards you might have created.

![The War Room time
picker](https://user-images.githubusercontent.com/1153921/95792666-d8fdb500-0c98-11eb-9fe8-23838d67b666.png)

Use the Quick Selector to show metrics from the last 5 minutes, 15 minutes, 30 minutes, 6 hours, 12 hours, or 7
days.

Beneath the Quick Selector is an input field and dropdown you use in combination to select a specific timeframe of
minutes, hours, days, or months. Enter a number and choose the appropriate unit of time.

Use the calendar to select multiple days. Click on a date to begin the timeframe selection, then an ending date.

Click **Apply** to re-render all visualizations with new metrics data streamed to your browser from each distributed
node. Click **Clear** to remove any changes and apply the default 15-minute timeframe.

The fields beneath the calendar display the beginning and ending timestamps of the timeframe selected.

## War Room organization

We recommend a few strategies for organizing your War Rooms.

**Service, purpose, location, etc.**: You can group War Rooms by a service (think Nginx, MySQL, Pulsar, and so on),
their purpose (webserver, database, application), their physical location, whether they're baremetal or a Docker
container, the PaaS/cloud provider it runs on, and much more. This allows you to see entire slices of your
infrastructure by moving from one War Room to another.

**End-to-end apps/services**: If you have a user-facing SaaS product, or an internal service that said product relies
on, you may want to monitor that entire stack in a single War Room. This might include Kubernetes clusters, Docker
containers, proxies, databases, web servers, brokers, and more. End-to-end War Rooms are valuable tools for ensuring the
health and performance of your organization's essential services.

**Incident response**: You can also create new War Rooms as one of the first steps in your incident response process.
For example, you have a user-facing web app that relies on Apache Pulsar for a message queue, and one of your nodes
using the [Pulsar collector](/docs/agent/collectors/go.d.plugin/modules/pulsar) begins reporting a suspiciously low
messages rate. You can create a War Room called `$year-$month-$day-pulsar-rate`, add all your Pulsar nodes in addition
to nodes they connect to, and begin diagnosing the root cause in a War Room optimized for getting to resolution as fast
as possible.

## Add War Rooms

You can add new War Rooms to any Space by clicking on the green plus icon **+** next the **War Rooms** heading.

![Add new War Room](https://user-images.githubusercontent.com/1153921/95792870-2da13000-0c99-11eb-93cf-aab666204920.png)

A new panel slides in and prompts you to name the new War Room, give it a description, and choose whether it's public or
private. Anyone in your Space can join public War Rooms, but can only join private War Rooms with an invitation.

### Manage War Rooms

If you're an administrator of War Room, you can change its settings. Use the top navigation to click on the War Room's
name, then **Manage War Room** to open the configuration panel.

In the **Nodes** tab, click the green plus icon **+** to add a claimed node to the War Room. Click on the 3-dot icon
**⋮** next to any claimed node to remove it from the War Room.

In the **Users** tab, see which users from your Space are allowed to view the War Room. Click the green plus icon **+**
and look under the **Space users eligible to join this war room** heading to find existing users you can add to the War
Room. If they don't appear in that list, you need to [invite them](/docs/cloud/collaborate/invite-your-team) first.

In the **War Rom** tab, change the War Room's name, description, or public/private status.

## What's next?

Once you've figured out an organizational structure that works for your team, learn more about how you can use Netdata
Cloud to monitor distributed nodes using [real-time composite charts](/docs/cloud/visualize/overview).
