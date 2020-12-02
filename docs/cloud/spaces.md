---
title: Spaces
description: Organize your infrastructure monitoring on Netdata Cloud by creating Spaces, then grouping your Agent-monitored nodes.
custom_edit_url: null
---

Spaces are high-level containers to help you organize your team members and the nodes they're able to view in each
War Room.

If you aren't invited to Netdata Cloud by another user, you'll create your first Space and War Room during the
onboarding process that starts just after signing in. If you're invited by someone else on your team, you'll be able to
create new Spaces of your own, and, with the correct privileges, create and configure War Rooms within existing Spaces.

Let's talk through some strategies for creating the most intuitive Cloud experience for your team.

## How to organize your Netdata Cloud

You can use any number of Spaces you want, but as you organize your Cloud experience, keep in mind that _you can only
add any given node to a single Space_. This 1:1 relationship between node and Space may dictate whether you use one
encompassing Space for your entire team and separate them by War Rooms, or use different Spaces for teams monitoring
discrete parts of your infrastructure.

The other consideration for the number of Spaces you use to organize your Netdata Cloud experience is the size and
complexity of your organization.

For startups, small- or mid-size businesses, or focused independent teams, we recommend sticking to a single Space so
that you can keep all your nodes and their respective metrics in one place. You can then use multiple [War
Rooms](/docs/cloud/war-rooms) to further organize your infrastructure monitoring.

Enterprises may want to create multiple Spaces for each of their larger teams, particularly if those teams have
different responsibilities or parts of the overall infrastructure to monitor. For example, you might have one SRE team
for your user-facing SaaS application and a second team for infrastructure tooling. If they don't need to monitor the
same nodes, you can create separate Spaces for each team.

## Manage Spaces

You manage your spaces in the left-hand panel.

The panel first shows the name of the Space, then some common actions

![The Spaces management
area](https://user-images.githubusercontent.com/1153921/100896143-8d3ae100-347b-11eb-9657-745831afc140.png)

### Add Spaces

You can add new Spaces by clicking on the green plus icon `+` in the Spaces menu, which appears on the far left of the
Cloud interface. A panel slides in and prompts you for the name of this new Space.

While you can't change the name of an existing Space, you can always create additional Spaces and delete the ones you
don't want any more.

### Claim nodes to a Space

Click on the **Claim Nodes** link to show the script that you use to [claim](/docs/agent/claim) a node running the
Netdata Agent to Netdata Cloud.

### Manage Spaces

If you're an administrator of a Space, you can change its settings. Click on **Invite Users** or **Manage Space** for
the most common settings.

Click the **More** link to see additional options, such as managing the [War Rooms](/docs/cloud/war-rooms) within a
Space, managing users, or managing bookmarks.

## What's next?

Once you configured your Spaces, it's time to set up your [War Rooms](/docs/cloud/war-rooms).
