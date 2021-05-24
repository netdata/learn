---
title: "Enable alarm notifications"
description: "Send Netdata alarms from a centralized place with Netdata Cloud, or configure nodes individually, to enable incident response and faster resolution."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/monitor/enable-notifications.md
---



Netdata offers two ways to receive alarm notifications on external platforms. These methods work independently _or_ in
parallel, which means you can enable both at the same time to send alarm notifications to any number of endpoints.

Both methods use a node's health alarms to generate the content of alarm notifications. Read the doc on [configuring
alarms](/docs/monitor/configure-alarms) to change the preconfigured thresholds or to create tailored alarms for your
infrastructure.

Netdata Cloud offers [centralized alarm notifications](#netdata-cloud) via email, which leverages the health status
information already streamed to Netdata Cloud from claimed nodes to send notifications to those who have enabled them.

The Netdata Agent has a [notification system](#netdata-agent) that supports more than a dozen services, such as email,
Slack, PagerDuty, Twilio, Amazon SNS, Discord, and much more.

For example, use centralized alarm notifications in Netdata Cloud for immediate, zero-configuration alarm notifications
for your team, then configure individual nodes send notifications to a PagerDuty endpoint for an automated incident
response process.

## Netdata Cloud

Netdata Cloud's [centralized alarm
notifications](/docs/cloud/alerts-notifications/notifications) is a zero-configuration way to
get notified when an anomaly or incident strikes any node or application in your infrastructure. The advantage of using
centralized alarm notifications from Netdata Cloud is that you don't have to worry about configuring each node in your
infrastructure.

To enable centralized alarm notifications for a Space, click on **Manage Space** in the left-hand menu, then click on
the **Notifications** tab. Click the toggle switch next to **E-mail** to enable this notification method.

Next, enable notifications on a user level by clicking on your profile icon, then **Profile** in the dropdown. The
**Notifications** tab reveals rich management settings, including the ability to enable/disable methods entirely or
choose what types of notifications to receive from each War Room.

![Enabling and configuring alarm notifications in Netdata
Cloud](https://user-images.githubusercontent.com/1153921/101936280-93c50900-3b9d-11eb-9ba0-d6927fa872b7.gif)

See the [centralized alarm notifications](/docs/cloud/alerts-notifications/notifications)
reference doc for further details about what information is conveyed in an email notification, flood protection, and
more.

## Netdata Agent

The Netdata Agent's [notification system](/docs/agent/health/notifications) runs on every node and dispatches
notifications based on configured endpoints and roles. You can enable multiple endpoints on any one node _and_ use Agent
notifications in parallel with centralized alarm notifications in Netdata Cloud.

> ❗ If you want to enable notifications from multiple nodes in your infrastructure, each running the Netdata Agent, you
> must configure each node individually.

Below, we'll use [Slack notifications](#enable-slack-notifications) as an example of the process of enabling any
notification platform.

### Supported notification endpoints

-   [**alerta.io**](/docs/agent/health/notifications/alerta)
-   [**Amazon SNS**](/docs/agent/health/notifications/awssns)
-   [**Custom endpoint**](/docs/agent/health/notifications/custom)
-   [**Discord**](/docs/agent/health/notifications/discord)
-   [**Dynatrace**](/docs/agent/health/notifications/dynatrace)
-   [**Email**](/docs/agent/health/notifications/email)
-   [**Flock**](/docs/agent/health/notifications/flock)
-   [**Google Hangouts**](/docs/agent/health/notifications/hangouts)
-   [**IRC**](/docs/agent/health/notifications/irc)
-   [**Kavenegar**](/docs/agent/health/notifications/kavenegar)
-   [**Matrix**](/docs/agent/health/notifications/matrix)
-   [**Messagebird**](/docs/agent/health/notifications/messagebird)
-   [**Netdata Agent dashboard**](/docs/agent/health/notifications/web)
-   [**Opsgenie**](/docs/agent/health/notifications/opsgenie)
-   [**PagerDuty**](/docs/agent/health/notifications/pagerduty)
-   [**Prowl**](/docs/agent/health/notifications/prowl)
-   [**PushBullet**](/docs/agent/health/notifications/pushbullet)
-   [**PushOver**](/docs/agent/health/notifications/pushover)
-   [**Rocket.Chat**](/docs/agent/health/notifications/rocketchat)
-   [**Slack**](/docs/agent/health/notifications/slack)
-   [**SMS Server Tools 3**](/docs/agent/health/notifications/smstools3)
-   [**StackPulse**](/docs/agent/health/notifications/stackpulse)
-   [**Syslog**](/docs/agent/health/notifications/syslog)
-   [**Telegram**](/docs/agent/health/notifications/telegram)
-   [**Twilio**](/docs/agent/health/notifications/twilio)

### Enable Slack notifications

First, [Add an incoming webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) in Slack for the channel where you
want to see alarm notifications from Netdata. Click the green **Add to Slack** button, choose the channel, and click the
**Add Incoming WebHooks Integration** button.

On the following page, you'll receive a **Webhook URL**. That's what you'll need to configure Netdata, so keep it handy.

Navigate to your [Netdata config directory](/docs/configure/nodes#netdata-config-directory) and use `edit-config` to
open the `health_alarm_notify.conf` file:

```bash
sudo ./edit-config health_alarm_notify.conf
```

Look for the `SLACK_WEBHOOK_URL="  "` line and add the incoming webhook URL you got from Slack:

```conf
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXX"
```

A few lines down, edit the `DEFAULT_RECIPIENT_SLACK` line to contain a single hash `#` character. This instructs Netdata
to send a notification to the channel you configured with the incoming webhook.

```conf
DEFAULT_RECIPIENT_SLACK="#"
```

To test Slack notifications, switch to the Netdata user.

```bash
sudo su -s /bin/bash netdata
```

Next, run the `alarm-notify` script using the `test` option.

```bash
/usr/libexec/netdata/plugins.d/alarm-notify.sh test
```

You should receive three notifications in your Slack channel for each health status change: `WARNING`, `CRITICAL`, and
`CLEAR`.

See the [Agent Slack notifications](/docs/agent/health/notifications/slack) doc for more options and information.

## What's next?

Now that you have health entities configured to your infrastructure's needs and notifications to inform you of anomalies
or incidents, your health monitoring setup is complete.

To make your dashboards most useful during root cause analysis, use Netdata's [distributed data
architecture](/docs/store/distributed-data-architecture) for the best-in-class performance and scalability.

### Related reference documentation

- [Netdata Cloud · Alarm notifications](/docs/cloud/alerts-notifications/notifications)
- [Netdata Agent · Notifications](/docs/agent/health/notifications)


