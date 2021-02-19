---
title: Netdata Cloud FAQ
custom_edit_url: null
sidebar_label: FAQ
---

Have questions for us that aren't answered here? Hop over to our [community](https://community.netdata.cloud/) to ask
your question or create an issue on [GitHub](https://github.com/netdata/netdata/issues/new/choose).

### How is Cloud different from the Netdata Agent?

The open source Agent monitors the system it's installed on, along with any applications we have a
[collector](/docs/agent/collectors) for. Cloud integrates many distributed Agents into one cloud-hosted web application
that you can use to see an entire infrastructure's real-time metrics.

### Do I have to use Netdata Cloud?

No. You can configure your Agent to [disable Cloud functionality](/docs/agent/aclk#disable-the-aclk) either at
installation or at runtime.

### How much does Netdata cost? How and why is it free?

The Netdata Agent will always remain free, open-source software. Netdata Cloud is closed source, with all basic features
provided free of charge. Paid features are in Netdata Cloud's future, but there is no timeline for these features yet.
Netdata does not and never will sell your personal data or data about your deployment.

### Is Netdata Cloud open source?

Netdata Cloud's frontend and backend code is all closed source.

### Is there an on-premises version available?

Not yet! Send us an email at [info@netdata.cloud](mailto:info@netdata.cloud) if you're interested. We'd love to learn
more about your requirements and use case.

### How do I see all the nodes in a parent-child streaming setup?

If you want to see both the parent node and its child nodes in Netdata Cloud, you must claim all of them via the
[claiming process](/docs/cloud/get-started#claim-a-node).

### Is there a dark mode in Netdata Cloud?

Yes. If it's not enabled by default on your system, you can now enable the new Dark or Blue themes. Click on your
profile icon in the bottom-right corner, then click the **Settings** tab, and choose your preferred theme.

### Can I create custom dashboards?

This is now possible! Use the [dashboards feature](https://learn.netdata.cloud/docs/cloud/visualize/dashboards) to build
new dashboards tailored specifically to your infrastructure.

### My Agent cannot connect to Netdata Cloud. How do I fix that?

[The Agent-Cloud Link (ACLK)](/docs/agent/aclk) establishes an outbound connection from your node to `app.netdata.cloud`
on port 443. If you believe this is not a firewall issue, consult the [troubleshooting
guide](/docs/agent/claim/#troubleshooting).

### How do I add a node to an existing Space?

Click on the **Claim Nodes** button in the [Space](/docs/cloud/spaces) management area.

![The Spaces management
area](https://user-images.githubusercontent.com/1153921/108531119-94f86d80-7293-11eb-8988-12894c55e462.png)

Copy the claiming script to your node and run it. See the [claiming doc](/docs/agent/claim) for details.

### How do I rename a node?

A node's name cannot be changed from within Netdata Cloud. 

To change the name that appears in Netdata Cloud, you can either [change the node's
hostname](https://www.tecmint.com/set-hostname-permanently-in-linux/), or you can [edit that node's `netdata.conf`
file](/docs/configure/nodes) and change the [`hostname` setting](/docs/agent/daemon/config#global-section-options).

Once finished, restart the node with `sudo systemctl netdata restart`, or the appropriate method for your system, to see
the changed name reflected in Netdata Cloud.

### How do I remove a node from a War Room?

Click on the name of the War Room in the top navigation, then **List Nodes**. Click on the **🗑** icon next to the node
you want to remove. Removing a node from a War Room does not remove it from your Space.

### How do I move a node to another War Room?

A node can belong to multiple War Rooms.

First, switch to the War Room you want to move the node to. Click on the name of the War Room in the top bar, then **Add
Nodes**. Click the checkbox next to the node in question, then click **+ Add** at the top of the modal.

Next, switch back to the War Room original War Room and [remove the node](#how-do-i-remove-a-node-from-a-war-room).

See the [War Room reference](/docs/cloud/war-rooms#manage-war-rooms) for additional details.

### How do I reclaim a node?

Follow the [reclaiming guide](/docs/agent/claim/#remove-and-reclaim-a-node). Don't forget to restart your Agent with
`sudo service netdata restart` or the appropriate equivalent for your system!

### How do I move a node to another Space?

You can only claim any given node in a single Space. To claim a node in a different Space, you will have to [reclaim the
node](/docs/agent/claim/#remove-and-reclaim-a-node).

### How do I rename a Space?

You can add a description to a Space, but a Space's name is a unique identifier that cannot be modified.

### How do I delete a Space?

In the Space management area, click the **Manage Space** link. Click the **Delete** button and confirm you want to
delete your Space.

### How do I rename a War Room?

You cannot rename a War Room at this time.

### How do I delete a War Room?

The _General_ War Room cannot be deleted. For other rooms, click the name of the War Room in the top bar, then **Manage
War Room**. In the modal, click the **Delete** button. Confirm that you want to delete your War Room.

### How do I change my email?

It is not possible to change the email address associated with your Netdata Cloud account.

You can always create a new account with a different email and [reclaim](/docs/agent/claim/#remove-and-reclaim-a-node)
nodes into the new Space.

If you want to maintain your Space, send an [invitation](/docs/cloud/manage/invite-your-team) to the email address you
want to use, and make that user an administrator for your Space. Accept the invitation on your new email and sign in.
Confirm that you have full administrative access to the Space and associated War Rooms. Finally, you can sign in with
your initial email and leave the Space.
