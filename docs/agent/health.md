---
title: "Health monitoring"
custom_edit_url: https://github.com/netdata/netdata/edit/master/health/README.md
---



With Netdata, you can monitor the health and performance of your systems and applications. You start with hundreds of
alarms that have been pre-configured by the Netdata community, but you can write new alarms, tune existing ones, or
silence any that you're not interested in. 

Netdata creates charts dynamically, and runs an independent thread to constantly evaluate them, which means Netdata
operates like a health watchdog for your services and applications.

You can even run statistical algorithms against the metrics you've collected to power complex lookups. Your imagination,
and the needs of your infrastructure, are your only limits.

[Quickstart](/docs/agent/health/quickstart)

[Configuration reference](/docs/agent/health/reference)

## Guides

Every infrastructure is different, so we're not interested in mandating how you should configure Netdata's health
monitoring features. Instead, these guides should give you the details you need to tweak alarms to your heart's
content.

[Stopping notifications for individual alarms](/docs/agent/guides/monitor/stop-notifications-alarms)

[Use dimension templates to create dynamic alarms](/docs/agent/guides/monitor/dimension-templates)

## Related features

**[Health notifications](/docs/agent/health/notifications)**: Get notified about Netdata's alarms via your favorite
platform(s).


