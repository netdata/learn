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

**Take the next steps with health monitoring:**

<DocsSteps>

[<FiPlay /> Quickstart](/docs/agent/health/quickstart)

[<FiCode /> Configuration reference](/docs/agent/health/reference)

[<FiBook /> Tutorials](#tutorials)

</DocsSteps>

## Tutorials

Every infrastructure is different, so we're not interested in mandating how you should configure Netdata's health
monitoring features. Instead, these tutorials should give you the details you need to tweak alarms to your heart's
content.

<DocsTutorials>
<div>

### Health entities

[Stopping notifications for individual alarms](/guides/stop-notifications-alarms)

[Use dimension templates to create dynamic alarms](/guides/dimension-templates)

</div>
</DocsTutorials>

## Related features

**[Health notifications](/docs/agent/health/notifications)**: Get notified about Netdata's alarms via your favorite
platform(s).


