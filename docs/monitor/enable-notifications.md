---
title: "Enable notifications"
description: "Send Netdata's alerts to platforms like email, Slack, PagerDuty, Twilio, and more to enable incident response and faster resolution."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/monitor/enable-notifications.md
---



Netdata comes with a notification system that supports more than a dozen services, such as email, Slack, PagerDuty,
Twilio, Amazon SNS, Discord, and much more. You can enable as many platforms as you want, and configure them to match
your organization's needs with features like role-based notifications.

To see all the supported platforms, visit our [notifications](/docs/agent/health/notifications) doc.

This doc covers enabling email and Slack notifications, but the same process applies to enabling any other notification
platform.

## Enable email notifications

To use email notifications, you need [`sendmail`](http://www.postfix.org/sendmail.1.html) or an equivalent installed on
your system.

Edit the `health_alarm_notify.conf` file, which resides in your Netdata [config
directory](/docs/configure/nodes#netdata-config-directory).

```bash
sudo ./edit-config health_alarm_notify.conf
```

Look for the following lines:

```conf
# if a role recipient is not configured, an email will be sent to:
DEFAULT_RECIPIENT_EMAIL="root"
# to receive only critical alarms, set it to "root|critical"
```

Change the value of `DEFAULT_RECIPIENT_EMAIL` to the email address at which you'd like to receive notifications.

```conf
# if a role recipient is not configured, an email will be sent to:
DEFAULT_RECIPIENT_EMAIL="me@example.com"
# to receive only critical alarms, set it to "root|critical"
```

Test email notifications system by first becoming the Netdata user and then asking Netdata to send a test alarm:

```bash
sudo su -s /bin/bash netdata
/usr/libexec/netdata/plugins.d/alarm-notify.sh test
```

You should see output similar to this:

```bash
# SENDING TEST WARNING ALARM TO ROLE: sysadmin
2019-10-17 18:23:38: alarm-notify.sh: INFO: sent email notification for: hostname test.chart.test_alarm is WARNING to 'me@example.com'
# OK

# SENDING TEST CRITICAL ALARM TO ROLE: sysadmin
2019-10-17 18:23:38: alarm-notify.sh: INFO: sent email notification for: hostname test.chart.test_alarm is CRITICAL to 'me@example.com'
# OK

# SENDING TEST CLEAR ALARM TO ROLE: sysadmin
2019-10-17 18:23:39: alarm-notify.sh: INFO: sent email notification for: hostname test.chart.test_alarm is CLEAR to 'me@example.com'
# OK
```

Check your email. You should receive three separate emails for each health status change: `WARNING`, `CRITICAL`, and
`CLEAR`.

See the [email notifications](/docs/agent/health/notifications/email) doc for more options and information.

## Enable Slack notifications

If you're one of the many who spend their workday getting pinged with GIFs by your colleagues, why not add Netdata
notifications to the mix? It's a great way to immediately see, collaborate around, and respond to anomalies in your
infrastructure.

To get Slack notifications working, you first need to add an [incoming
webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) to the channel of your choice. Click the green **Add to
Slack** button, choose the channel, and click the **Add Incoming WebHooks Integration** button.

On the following page, you'll receive a **Webhook URL**. That's what you'll need to configure Netdata, so keep it handy.

Time to dive back into your `health_alarm_notify.conf` file:

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

Time to test the notifications again:

```bash
sudo su -s /bin/bash netdata
/usr/libexec/netdata/plugins.d/alarm-notify.sh test
```

You should receive three notifications in your Slack channel for each health status change: `WARNING`, `CRITICAL`, and
`CLEAR`.

See the [Slack notifications](/docs/agent/health/notifications/slack) doc for more options and information.

## What's next?

Learn more about Netdata's notifications system in the [notifications](/docs/agent/health/notifications) docs.

Now that you have health entities configured to your infrastructure's needs, and notifications to inform you of
anomalies, you have the tools you need to start troubleshooting with [visual anomaly
detection](/docs/agent/troubleshoot/visual-anomaly-detection) and [Metric
Correlations](/docs/agent/troubleshoot/metrics-correlation).


