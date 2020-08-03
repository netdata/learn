---
title: FAQ and glossary
custom_edit_url: null
---

## FAQ

Have questions for us that aren't answered here? Send us an email at [info@netdata.cloud](mailto:info@netdata.cloud) or
create an issue on [GitHub](https://github.com/netdata/netdata/issues/new/choose).

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

### Can I create custom dashboards?

This is now possible! [Learn how](https://learn.netdata.cloud/docs/cloud/visualize/dashboards).

### My Agent cannot connect to Netdata Cloud. How do I fix that?

[The Agent-Cloud Link (ACLK)](/docs/agent/aclk) establishes an outbound connection from your node to `app.netdata.cloud`
on port 443. If you believe this is not a firewall issue, consult the [troubleshooting
guide](/docs/agent/claim/#troubleshooting).

### How do I add a node to an existing Space?

You must be the Space owner to claim a new node to an existing Space. Find the "Manage Space" option from the drop-down menu.

Select **Manage Space**.

![Manage Space](/img/docs/cloud/manage-space.png)

Select ***Nodes*.

![Nodes Tab](/img/docs/cloud/claim-node-script.png)

Select any War Rooms relevant for the new node, then use the claim script command provided.

### How do I rename a node?

A node's name cannot be changed from within Netdata Cloud. You must [reclaim](#how-do-i-re-claim-a-node?) it with a
different hostname. The hostname can be changed either by changing the machine's hostname or by editing a setting in
[`netdata.conf`](/docs/agent/step-by-step/step-04#edit-your-netdataconf-file).

### How do I delete a node?

You can delete a node from your War Room by selecting **Manage War Room** in your War Room options.

![Manage War Room](/img/docs/cloud/manage-war-room.png)

Then you can select the node to remove from the War Room.

![Delete Node from War Room](/img/docs/cloud/remove-node-from-war-room.png)

It is also possible to [remove and reclaim a node](/docs/agent/claim/#remove-and-reclaim-a-node).

### How do I re-claim a node?

Follow the [reclaiming guide](/docs/agent/claim/#remove-and-reclaim-a-node). Don't forget to restart your Agent with
`sudo service netdata restart` or the appropriate equivalent for your system!

### How do I move a node to another Space?

You can only claim any given node in a single Space. To claim a node in a different Space, you will have to [reclaim the
node](#how-do-i-re-claim-a-node).

### How do I move a node to another War Room?

A node can belong to multiple War Rooms. To move the node, you would have to [remove it](#how-do-i-delete-a-node) from
any war room you don't want it in and add it to any War Rooms you want.

### How do I rename a Space?

You can add a description to a Space, but a Space's name is a unique identifier that cannot be modified.

### How do I rename a War Room?

You cannot rename a War Room at this time.

### How do I delete a space?

Select **Manage Space**.

![Manage Space](/img/docs/cloud/manage-space.png)

Select **Delete**.

![Delete Space](/img/docs/cloud/delete-space.png)

### How do I delete a war room?

The _General_ War Room cannot be deleted. For other rooms, select **Manage War Room**.

![Manage War Room](/img/docs/cloud/manage-extra-war-room.png)

Select **Delete Room**.

![Delete War Room](/img/docs/cloud/delete-war-room.png)

### How do I change my email?

It is not really possible to change your email at this time, but there is a workaround. Invite the email address you want to use and make that new account an administrator. After accepting the invitation on the second account and joining all your War Rooms from it, you can sign in again with the original account and leave the Space.

## Glossary of Cloud terms

| Term                      | Definition                                                                                                                                                                                                                                                                                                                                                 |
|:------------------------- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Netdata Cloud (Cloud)** | The web application hosted at [https://app.netdata.cloud](https://app.netdata.cloud) that helps you monitor an entire infrastructure of distributed systems in real-time.                                                                                                                                                                                  |
| **Netdata Agent (Agent)** | The free and open source [monitoring agent](/docs/agent) that you can install on all of your distributed systems, whether they're physical, virtual, containerized, ephemeral, and more. The Agent monitors systems running Linux, Docker, Kubernetes, macOS, FreeBSD, and more, and collects metrics from hundreds of popular services and applications. |
| **node**                  | Used to refer to a system on which an Agent is installed. The system can be physical, virtual, in a Docker container, and more. Depending on your infrastructure, you may have one, dozens, or hundreds of nodes. Some nodes are _ephemeral_, in that they're created/destroyed automatically by a orchestrator service.                                   |
| **Space**                 | The highest level container within Netdata Cloud for a user to organize their team members and nodes within their infrastructure. A Space likely represents an entire organization or a very large team.                                                                                                                                                   |
| **War Room**              | A smaller grouping of nodes where users can view key metrics in real-time and monitor the health of many nodes with their alarm status. War Rooms can be used to organize nodes in any way that makes sense for your infrastructure, such as by a service, purpose, physical location, and more.                                                           |
| **claimed node**          | A node that you've proved ownership of by completing the [claiming process](/docs/cloud/get-started#claim-a-node). The claimed node will then appear in your Space and any War Rooms you added it to.                                                                                                                                                      |
| **visited node**          | A node which has had its Agent dashboard directly visited by a user. A list of these is maintained on a per-user basis.                                                                                                                                                                                                                                    |
| **offline node**          | A claimed node with a disrupted [Agent-Cloud link](/docs/agent/aclk). **Offline** could mean the node no longer exists or is experiencing network connectivity issues with Cloud.                                                                                                                                                                         |
