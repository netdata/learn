---
title: Spaces
description: Organize your infrastructure monitoring on Netdata Cloud by creating Spaces, then grouping your Agent-monitored nodes.
custom_edit_url: https://github.com/netdata/learn/blob/master/docs/cloud/spaces.md
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

## Add Spaces

Click on the green **+** button to add a new Space. Enter the name of the Space and click **Save**.

![Switch between
Spaces](https://user-images.githubusercontent.com/1153921/108741861-60372100-74f4-11eb-9580-8ebd5ca97003.png)


## Switch between Spaces

Click on any of the boxes to switch between available Spaces.

Netdata Cloud abbreviates each Space to the first letter of the name, or the first two letters if the name is two words
or more. Hover over each icon to see the full name in a tooltip.

## Manage Spaces

Manage your spaces in the left-hand navigation, which shows the name of the current Space, followed by common management
actions. Finally, the panel lists every [War Room](/docs/cloud/war-rooms) in the Space.

![The Space management
area](https://user-images.githubusercontent.com/1153921/108742003-83fa6700-74f4-11eb-9d9b-8e74ce5ef540.png)

To _connect nodes to a Space_, click on **Connect Nodes**. Copy the claiming script to your node and run it. See the
[connect to Cloud doc](/docs/agent/claim) for details.

To _invite users to a Space_, click on **Invite Users**. The [invitation doc](/docs/cloud/manage/invite-your-team)
details the invitation process.

Click the **More** link to see additional options, such as managing the [War Rooms](/docs/cloud/war-rooms) within a
Space, managing users, or managing bookmarks.

## Obsoleting offline nodes from a Space
Netdata admin users now have the ability to remove obsolete nodes from a space.

- Only admin users have the ability to obsolete nodes
- Only offline nodes can be marked obsolete (Live nodes and stale nodes cannot be obsoleted)
- Node obsoletion works across the entire space, so the obsoleted node will be removed from all rooms belonging to the space
- If the obsoleted nodes eventually become live or online once more they will be automatically re-added to the space

![Obsoleting an offline node](https://user-images.githubusercontent.com/24860547/173087202-70abfd2d-f0eb-4959-bd0f-74aeee2a2a5a.gif)

## What's next?

Once you configured your Spaces, it's time to set up your [War Rooms](/docs/cloud/war-rooms).
