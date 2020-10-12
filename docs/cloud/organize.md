---
title: Spaces and War Rooms
description: Organize your infrastructure monitoring on Netdata Cloud by creating Spaces and War Rooms, then grouping your Agent-monitored nodes.
custom_edit_url: null
---

Netdata Cloud uses Spaces and War Rooms to help you organize your real-time infrastructure monitoring. They're both
flexible containers that let you customize how your team uses Netdata Cloud to monitor your infrastructure.

If you aren't invited to Netdata Cloud by another user, you'll create your first Space and War Room during the
onboarding process that starts just after signing in. If you're invited by someone else on your team, you'll be able to
create new Spaces of your own, and, with the correct privileges, create and configure War Rooms within existing Spaces.

Let's talk through some strategies for creating the most intuitive Cloud experience for your team.

## How to organize your Netdata Cloud

### Spaces

Spaces are high-level containers to help you organize your team members and the nodes they're able to view in each
War Room.

You can use any number of Spaces you want, but as you organize your Cloud experience, keep in mind that _you can only
add any given node to a single Space_. This 1:1 relationship between node and Space may dictate whether you use one
encompassing Space for your entire team and separate them by War Rooms, or use different Spaces for teams monitoring
discrete parts of your infrastructure.

The other consideration for the number of Spaces you use to organize your Cloud is the size and complexity of your
organization.

For startups, small- or mid-size businesses, or focused independent teams, we recommend sticking to a single Space so
that you can keep all your nodes and their respective metrics in one place.

Enterprises may want to create multiple Spaces for each of their larger teams, particularly if those teams have
different responsibilities or parts of the overall infrastructure to monitor. For example, you might have one SRE team
for your user-facing SaaS application and a second team for infrastructure tooling. If they don't need to monitor the
same nodes, you can create separate Spaces for each team.

### War Rooms

War Rooms are where users can view key metrics in real-time and monitor the health of many nodes with their alarm
status. We can recommend a few strategies for organizing your War Rooms.

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

## Add and manage Spaces and War Rooms

We encourage you to experiment with different configurations of Spaces and War Rooms until you find the organizational
structure that works best for your team and the infrastructure you need to monitor. You can create as many Spaces and
War Rooms you need, delete them, and manage access.

### Add Spaces

You can add new Spaces by clicking on the green plus icon `+` in the Spaces menu, which appears on the far left of the
Cloud interface. A panel slides in and prompts you for the name of this new Space.

While you can't change the name of an existing Space, you can always create additional Spaces and delete the ones you
don't want any more.

### Add War Rooms

You can add new War Rooms to any Space by clicking on the green plus icon `+` after the **Rooms** heading. A new panel
slides in and prompts you to name the new War Room, give it a description, and choose whether it's public or private.
Anyone in your Space can join public War Rooms, but can only join private War Rooms with an invitation.

### Manage Spaces and War Rooms

If you're an administrator of a Space or War Room, you can change their settings. You can add new members, change who is
allowed to join and what privileges they have, tweak War Rooms, add Nodes to specific War Rooms, delete Spaces or War
Rooms, and more.

Use the top navigation to click on either the Space's or War Room's name, then **Manage Space** or **Manage War Room**
to open the configuration panel.

## What's next?

Once you've figured out an organizational structure that works for your team, learn more about how you can use Netdata
Cloud to [monitor any number of distributed nodes](/docs/cloud/monitor) in real time.
