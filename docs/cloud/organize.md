---
title: Organize
description: Organize your infrastructure monitoring on Netdata Cloud by creating Spaces and War Rooms, then grouping your Agent-monitored nodes.
---

Netdata Cloud uses Spaces and War Rooms to help you organize your real-time infrastructure monitoring. They're both
flexible containers that let you customize how your team uses Netdata Cloud to monitor your infrastructure.

If you aren't invited to Netdata Cloud by another user, you'll create your first Space and War Room during the
onboarding process that starts just after signing in. If you're invited by someone else on your team, you'll be able to
create new Spaces of your own, and, with the correct privileges, create and configure War Rooms within existing Spaces.

Let's talk through some strategies for creating the most intuitive Cloud experience for your team.

## How to organize your Netdata Cloud

**Spaces** are high-level containers to help you organize your team members and the nodes they're able to view in each
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

**War Rooms** are where users can view key metrics in real-time and monitor the health of many nodes with their alarm
status. You can create as many War Rooms as you'd like and add your claimed nodes 

We recommend that you establish some convention for how many War Rooms you create and which nodes they monitor, such as
by service (`nginx`), purpose (`webservers`), or physical location (`IAD`). Your strategy for this depends on how many
Spaces you created, the size of your team, and the number and types of nodes you need to monitor.

## Add Spaces

You can add new Spaces by clicking on the green plus icon `+` in the Spaces menu, which appears on the far left of the
Cloud interface. A panel slides in and prompts you for the name of this new Space.

While you can't change the name of an existing Space, you can always create additional Spaces and delete the ones you
don't want any more.

## Add War Rooms

You can add new War Rooms to any Space by clicking on the green plus icon `+` after the **Rooms** heading. A new panel
slides in and prompts you to name the new War Room, give it a description, and choose whether it's public or private.
Anyone in your Space can join public War Rooms, can only join private War Rooms with an invitation.

## Manage existing Spaces and War Rooms

If you're an administrator of a Space or War Room, you can change their settings. You can add new members, change who is
allowed to join and what privileges they have, tweak War Rooms, add Nodes to specific War Rooms, delete Spaces or War
Rooms, and more.

Use the top navigation to click on either the Space's or War Room's name, then **Manage Space** or **Manage War Room**
to open the configuration panel.

## What's next?

Once you've figured out an organizational structure that works for your team, learn more about how you can use Netdata
Cloud to [monitor any number of distributed nodes](/docs/cloud/monitor/) in real time.
