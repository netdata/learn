---
title: Enable alarm notifications
description: Configure Cloud to send notifications to your team whenever any node on your infrastructure triggers an alarm.
custom_edit_url: null
---

Netdata Cloud can send notifications to your team whenever a node triggers one of its alarms. By enabling notifications,
you ensure no alarm, on any node in your infrastructure, goes unnoticed by you or your team.

## Enable alarm notifications for a Space

To enable notifications for a Space, click on the Space's name in the top menu, then **Manage your Space**. In the panel
that appears, click on the **Notifications** tab. 

Click on the toggle for which notification methods you want to enable. Netdata Cloud currently supports email
notifications and integrations with external services, like Zapier and Integromat, via webhooks.

After enabling notifications, you and other users in your Space should configure their [personal notification
settings](#manage-personal-notification-settings). These settings, in your user profile, allow you to choose what types
of alarms trigger notifications, which Spaces and War Rooms you want to receive notifications from, and more.

### Email

Any users of a Space can get notifications to the email address associated with their Netdata Cloud account.

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

Here's an example email notification for the `ram_available` chart, which is in a critical state:

![Screenshot of an alarm notification email from Netdata
Cloud](https://user-images.githubusercontent.com/1153921/87461878-e933c480-c5c3-11ea-870b-affdb0801854.png)

### Integrations via webhooks

You can send alarm notification details to any number of integration/automation services like Zapier and Integromat by
setting up new integrations via [webhooks](/docs/cloud/monitor/notifications/webhooks). Once you supply Netdata Cloud
with a webhook URL, it will send a JSON payload with alarm notification details to that service. You can then create
automations or send notifications to other endpoints, based on the capabilities of that service.

For example, you could use Zapier to create a new issue on Jira or send a Slack message, when your nodes trigger alerts
and create alarms.

To add a new integration, you should first set up your integration service with a new webhook-based action. You should
have an incoming webhook URL available.

Next, click the **Add integration** button. In the **URL** field, enter the incoming webhook URL from your integration
service. Click the **Test** button to see whether the service receives the JSON payload from Netdata Cloud.

Read about the JSON payload and see some examples in the [webhooks doc](/docs/cloud/monitor/notifications/webhooks). You
can use this information to customize how your integration service procesesses the incoming alarm information.

## Manage personal notification settings

Users can manage alarm notifications based on their personal needs and preferences. To change these settings, click on
your profile icon at the top-right of the Cloud UI, then **Profile** in the dropdown. Click on the **Notifications** tab
in the panel that appears.

You can enable or disable a notification method entirely by clicking the toggle switch.

Below, you can configure alarm notifications on the Space and War Room level. Click on a Space's name to expand/collapse
the list of War Rooms. In the dropdown next to any War Room, you can choose which type of alarms you want to receive
notifications for. You have the following options:

-   All alarms and unreachable
-   All alarms
-   Critical only
-   No notifications

Unreachable nodes are those that Netdata Cloud can't communicate with via the [Agent-Cloud Link](/docs/agent/aclk). A
node can be unreachable for a number of reasons, including being shut down entirely.

## What's next?

Netdata Cloud's alarm notifications feature leverages the alarms configuration on each node in your infrastructure. If
you'd like to tweak any of these alarms, or even add new ones based on your needs, read our [health
quickstart](/docs/agent/health/quickstart).

You can also enable [other notification methods](/docs/agent/health/notifications) on a per-node basis, but this
requires more configuration than using Cloud's dispatch of alarm notifications feature.

For even more focused ways to keep track of your infrastructure, why not try [designing new
dashboards](/docs/cloud/visualize/dashboards)?
