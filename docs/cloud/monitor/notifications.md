---
title: Enable alarm notifications
description: Configure Cloud to send notifications to your team whenever any node on your infrastructure triggers an alarm.
custom_edit_url: null
---

Netdata Cloud can send notifications to your team whenever a node triggers one of its alarms. By enabling notifications,
you ensure no change, on any node in your infrastructure, goes unnoticed by you or your team.

## Enable alarm notifications for a Space

To enable notifications for a Space, click on the Space's name in the top menu, then **Manage your Space**. In the panel
that appears, click on the **Notifications** tab. 

Click on the toggle for which notification methods you want to enable. Netdata Cloud currently supports email
notifications, but we're working on others.

Next, configure each War Room you'd like to receive notifications from, and instruct your users to set their
notification preferences at a user level.

## Manage alarm notifications per War Room

Any administrator of a War Room can change which types of notifications are enabled for all nodes in that War Room.

-   **All alarms**: Receive notifications for all changes in alarm status: critical, warning, and cleared.
-   **Critical alarms only**: Receive notifications only for critical alarms, represented by a red background in the
    Nodes view.
-   **No notifications**: Receive no notifications for nodes in this War Room.

This configuration applies to all users in that War Room.

## Manage alarm notifications per user

You, and other individual users in your Space, can also enable and disable notification methods.

Click on your profile icon at the top-right of the Cloud UI, then **Profile** in the dropdown. Click on the
**Notifications** tab in the panel that appears.

You can now choose to enable or disable any of the available and active notification methods.

## Anatomy of an alarm notification

Email alarm notifications show the following information:

-   The host's name
-   Alarm status: critical, warning, cleared
-   Previous alarm status
-   Time at which the alarm triggered
-   Chart context that triggered the alarm
-   Name and information about the triggered alarm
-   Alarm value
-   Total number of warning and critical alarms on that node
-   Threshold for triggering the given alarm state
-   Calculation or database lookups that Netdata uses to compute the value
-   Source of the alarm, including which file you can edit to configure this alarm on an individual node

Email notifications also feature a **Go to Node** button, which takes you directly to the offending chart for that node
within Cloud's embedded dashboards.

## What's next?

Netdata Cloud's alarm notifications feature leverages the alarms configuration on each node in your infrastructure. If
you'd like to tweak any of these alarms, or even add new ones based on your needs, read our [health
quickstart](/docs/agent/health/quickstart).

You can also enable [other notification methods](/docs/agent/health/notifications) on a per-node basis, but this
requires more configuration than using Cloud's dispatch of alarm notifications feature.
