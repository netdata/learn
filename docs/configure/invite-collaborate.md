---
title: "Invite your team and collaborate"
description: "Invite your SRE, DevOPs, or ITOps teams to Netdata Cloud to give everyone insights into your infrastructure from a single pane of glass."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/configure/invite-collaborate.md
---



Netdata is designed to make an infrastructure's real-time metrics available and actionable to all organization members.
By inviting others, you can better synchronize with your team or colleagues to understand your infrastructure's
heartbeat. When something goes wrong, you'll be ready to collaboratively troubleshoot complex performance problems from
a single pane of glass.

## Invite new members

Invite new users by clicking on your Space's name in the top navigation, and then **Invite more users**, to open the
invitation pane. Admins manage user permissions and have control over who can access specific Spaces and War Rooms.

![Opening and navigating the invitation
panel](https://user-images.githubusercontent.com/1153921/92025596-a618e680-ed14-11ea-9c1f-a61fdcb8aa4e.png)

Enter their email address and name. They can change this name once they accept your invitation.

Choose which War Rooms you want to add this user to, then click the plus **+** button to add the invitation to the
**New invitations to be sent** queue. Repeat the process with everyone you want to invite to your Space.

When you're ready to send the new invitations you created, hit the **Send** button. Netdata Cloud sends these
invitations and moves them to the **Invitations awaiting response** category.

Your team will receive their email invitations momentarily with a prompt to sign in to join your Space.

## Collaboration with Netdata Cloud

Netdata Cloud gives teams a single interface to view real-time metrics across their entire infrastructure. Having all
the metrics, alarm statuses, dashboards, and people in one place is a powerful asset for any infrastructure monitoring
team.

Assets like dashboards and bookmarks are shared between members of a War Room. As soon as one member creates a
dashboard, for example, other members of the same War Room can see it in the War Room's dropdown and supplement it with
additional charts/text.

Let's say you get an alert from your nodes about an excess of 500-type errors in your Nginx logs. Your team can hop on a
Slack call to begin working together. While one engineer handles creating a new dashboard with a half-dozen relevant
Nginx log metrics, another can dive into the real-time node dashboard and investigate correlated charts in granular
detail.

## What's next?

If your team members have trouble signing in, direct them to the [Netdata Cloud sign in
doc](/docs/cloud/manage/sign-in). Or, find answers to other common questions about Netdata
Cloud in our [FAQ](/docs/cloud/faq-glossary).

Next, we recommend you learn the [basics of node configuration](/docs/configure/nodes). While the Netdata Agent is
proudly zero-configuration in most cases, you should understand how to tweak its settings to give you the best Netdata,
for example, to [increase metrics retention](/docs/store/change-metrics-storage) and [improve
security](/docs/configure/secure-nodes).


