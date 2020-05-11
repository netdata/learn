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

### Is Netdata Cloud open source?

Netdata Cloud's frontend and backend code is all closed source.

### Is there an on-premises version available?

Not yet! Send us an email at [info@netdata.cloud](mailto:info@netdata.cloud) if you're interested. We'd love to learn
more about your requirements and use case.

### How do I see all the nodes in a master/slave streaming setup?

If you want to see both the master node and its slave nodes in Netdata Cloud, you must claim all of them via the
[claiming process](/docs/cloud/get-started#claim-a-node).

### Can I create custom dashboards?

Not yet, but we're working on it.

## Glossary of Cloud terms

| Term                      | Definition                                                                                                                                                                                                                                                                                                                                                 |
|:------------------------- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Netdata Cloud (Cloud)** | The web application hosted at [https://app.netdata.cloud](https://app.netdata.cloud) that helps you monitor an entire infrastructure of distributed systems in real-time.                                                                                                                                                                                  |
| **Netdata Agent (Agent)** | The free and open source [monitoring agent](/docs/agent/) that you can install on all of your distributed systems, whether they're physical, virtual, containerized, ephemeral, and more. The Agent monitors systems running Linux, Docker, Kubernetes, macOS, FreeBSD, and more, and collects metrics from hundreds of popular services and applications. |
| **node**                  | Used to refer to a system on which an Agent is installed. The system can be physical, virtual, in a Docker container, and more. Depending on your infrastructure, you may have one, dozens, or hundreds of nodes. Some nodes are _ephemeral_, in that they're created/destroyed automatically by a orchestrator service.                                   |
| **Space**                 | The highest level container within Netdata Cloud for a user to organize their team members and nodes within their infrastructure. A Space likely represents an entire organization or a very large team.                                                                                                                                                   |
| **War Room**              | A smaller grouping of nodes where users can view key metrics in real-time and monitor the health of many nodes with their alarm status. War Rooms can be used to organize nodes in any way that makes sense for your infrastructure, such as by a service, purpose, physical location, and more.                                                           |
| **claimed node**          | A node that you've proved ownership of by completing the [claiming process](/docs/cloud/get-started#claim-a-node). The claimed node will then appear in your Space and any War Rooms you added it to.                                                                                                                                                      |
| **visited node**          | A node which has had its Agent dashboard directly visited by a user. A list of these is maintained on a per-user basis.                                                                                                                                                                                                                                    |
| **offline node**          | A claimed node with a disrupted [Agent-Cloud link](/docs/agent/aclk/). **Offline** could mean the node no longer exists or is experiencing network connectivity issues with Cloud.                                                                                                                                                                         |
