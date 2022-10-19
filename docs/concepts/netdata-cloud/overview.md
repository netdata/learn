<!--
title: "Overview"
sidebar_label: "Overview"
custom_edit_url: "https://github.com/netdata/learn/blob/master/docs/concepts/netdata-cloud/overview.md"
sidebar_position: 1
learn_status: "Published"
learn_topic_type: "Concepts"
learn_rel_path: "netdata-cloud"
learn_docs_purpose: "Explain the Netdata cloud, operation, principals, purpose, and how Netdata runs it's SAAS Netdata cloud"
learn_repo_doc: "True"
-->


**********************************************************************
Netdata Cloud works in parallel with the open-source Netdata
monitoring agent to help you monitor your entire infrastructure [for free <RiExternalLinkLine className="inline-block"
/>](https://netdata.cloud/pricing/) in real time and troubleshoot problems that threaten the health of your
nodes before they occur.

Netdata Cloud requires the open-source [Netdata](/docs/) monitoring agent, which is the basis for the metrics,
visualizations, and alarms that you'll find in Netdata Cloud. Every time you view a node in Netdata Cloud, its metrics
and metadata are streamed to Netdata Cloud, then proxied to your browser, with an infrastructure that ensures [data
privacy <RiExternalLinkLine className="inline-block" />](https://netdata.cloud/privacy/).


Read [_What is Netdata?_](/docs/overview/what-is-netdata) for details about how Netdata and Netdata Cloud work together
and how they're different from other monitoring solutions, or the
[FAQ <RiExternalLinkLine className="inline-block" />](https://community.netdata.cloud/tags/c/general/29/faq) for answers to common questions.

<Grid columns="1" className="mb-16">
  <Box 
    to="/docs/cloud/get-started" 
    title="Get started with Netdata Cloud"
    cta="Go"
    image={true}>
    Ready to get real-time visibility into your entire infrastructure? This guide will help you get started on Netdata Cloud, from signing in for a free account to connecting your nodes.
  </Box>
</Grid>

## Learn about Netdata Cloud's basic features

<Grid columns="2">
  <Box
    title="Netdata Cloud Basics">
    <BoxList>
      <BoxListItem to="/docs/cloud/visualize/overview" title="Rooms" />
      <BoxListItem to="/docs/cloud/visualize/nodes" title="Views" />
      <BoxListItem to="/docs/cloud/visualize/kubernetes" title="spaces" />
    </BoxList>
  </Box>
</Grid>

*******************************************************************************
