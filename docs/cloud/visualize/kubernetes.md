---
title: Kubernetes (open beta)
description: Netdata Cloud now features a open beta of enhanced visualizations for the resource utilization of Kubernetes (k8s) clusters, embedded in the default Overview dashboard.
custom_edit_url: null
---

Netdata Cloud now features a _open beta_ of enhanced visualizations for the resource utilization of Kubernetes (k8s)
clusters, embedded in the default [Overview](/docs/cloud/visualize/overview/) dashboard.

These visualizations include a map for viewing the status of k8s pods/containers, in addition to composite charts
for viewing per-second CPU, memory, disk, and networking metrics from k8s nodes.

## Before you begin

In order to use the Kubernetes visualizations in Netdata Cloud, you need:

- A Kubernetes cluster running Kubernetes v1.9 or newer.
- A Netdata deployment using the latest version of the [Helm chart](https://github.com/netdata/helmchart), which
  installs [v1.29.0](https://github.com/netdata/netdata/releases) or newer of the Netdata Agent.
- To claim your Kubernetes cluster to Netdata Cloud.
- To enable the feature flag described below.

See our [Kubernetes installation instructions](/docs/agent/packaging/installer/methods/kubernetes/) for details on
installation and claiming to Netdata Cloud.

### Enable the feature flag

Once you have the prerequisites, you can enable the Kubernetes visualizations by enabling the feature flag in your
browser's developer console:

```js
localStorage.setItem('k8s', true)
```

> ❗ This feature flag applies only to a single browser, and is not connected to your Netdata Cloud account, War Room(s),
> or Spaces. If you use multiple browsers/devices, enable the feature flag on each one. If you invited a team to work
> with you, and want them to see the same Kubernetes charts, they need to enable the feature flag on their own browsers.

## Map

The map places each container or pod as a single box, then varies the intensity of its color to visualize the resource
utilization of specific k8s pods/containers.

![The Kubernetes map in Netdata
Cloud](https://user-images.githubusercontent.com/1153921/106964367-39f54100-66ff-11eb-888c-5a04f8abb3d0.png)

Change the map's coloring, grouping, and displayed nodes to customize your experience and learn more about the
status of your k8s cluster.

### Color by

Color the map by choosing an aggregate function to apply to a specific metric, then whether you want to see
container or pods. The default is the _average, of CPU within the established limit, organized by container_.

The following metrics are available for visualizing on the map:

- cpu_limit
- cpu
- cpu_per_core
- mem_usage_limit
- mem_usage
- mem
- writeback
- mem_activity
- pgfaults
- throttle_io
- throttle_serviced_ops
- net.net
- net.packets

### Group by

Group the map by the `k8s_cluster_id`, `k8s_controller_kind`, `k8s_controller_name`, `k8s_kind`, `k8s_namespace`,
and `k8s_node_name`. The default is `k8s_controller_name`.

### Filtering

Filtering behaves identically to the [node filter in War Rooms](/docs/cloud/war-rooms#node-filter), with the ability to
filter pods/containers by `container_id` and `namespace`.

### Detailed information

Hover over any of the pods/containers in the map to display a modal window, which contains contextual information
and real-time metrics from that resource.

![The modal containing additional information about a k8s
resource](https://user-images.githubusercontent.com/1153921/106964369-3a8dd780-66ff-11eb-8a8a-a5c8f0d5711f.png)

The **context** tab provides the following details about a container or pod:

- Cluster ID
- Node
- Controller Kind
- Controller Name
- Pod Name
- Container
- Kind
- Pod UID

This information helps orient you as to where the container/pod operates inside your cluster.

The **Metrics** tab contains charts visualizing the last 15 minutes of the same metrics available in the [color by
option](#color-by). Use these metrics along with the context, to identify which containers or pods are experiencing
problematic behavior to investigate further, troubleshoot, and remediate with `kubectl` or another tool.

## Composite charts

The Kubernetes composite charts show real-time and historical resource utilization metrics from _nodes_ within your
cluster.

These composite charts behave identically to those on the rest of the [Overview](/docs/cloud/visualize/overview). One
notably exception is that you can group Kubernetes composite charts by more than _by dimension_ and _by node_, including
all of the grouping options available in the [map](#map).

![Composite charts of Kubernetes metrics in Netdata
Cloud](https://user-images.githubusercontent.com/1153921/106964370-3a8dd780-66ff-11eb-8858-05b2253b25c6.png)

## Caveats

There are some caveats and known issues with the beta version of Kubernetes.

- **No historical metrics for containers or pods**. Hovering over the map shows a modal with _live_ CPU, memory, disk,
  and networking metrics, with no ability to see metrics from outside the available window. The composite charts beneath
  the map can display historical metrics, they only aggregate data from nodes, not containers or pods.
- **No application-specific metrics using Netdata's Kubernetes [service
  discovery](/guides/monitor/kubernetes-k8s-netdata#service-discovery-services-running-inside-of-pods)**. To see these
  metrics, you'll need to continue using the local Agent dashboard, which is accessible either with `kubectl
  port-forward netdata-parent-0 19999:19999 ` or the external IP, if you set up the Netdata Helm chart with
  `service.type=LoadBalancer`. See our [k8s installation
  instructions](/packaging/installer/methods/kubernetes#access-the-netdata-dashboard) for more details.
- **No way to remove any nodes** you might have
  [drained](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/) from your Kubernetes cluster. These
  drained nodes will be marked "unreachable" and will show up in War Room management screens/dropdowns.

## What's next?

For more information about monitoring a k8s cluster with Netdata, see our guide: [_Monitor a Kubernetes (k8s) cluster
with Netdata_](/guides/monitor/kubernetes-k8s-netdata/).

Because these Kubernetes visualizations are in an open beta state, we'd appreciate your feedback on their usability and
performance, in addition to any bugs you might encounter.
