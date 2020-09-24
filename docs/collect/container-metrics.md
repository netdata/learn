---
title: "Collect container metrics with Netdata"
sidebar_label: "Container metrics"
description: "Use Netdata to collect per-second utilization and application-level metrics from Linux/Docker containers and Kubernetes clusters."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/collect/container-metrics.md
---



Thanks to close integration with Linux cgroups and the virtual files it maintains under `/sys/fs/cgroup`, Netdata can
monitor the health, status, and resource utilization of many different types of Linux containers.

Netdata uses [cgroups.plugin](/docs/agent/collectors/cgroups.plugin) to poll `/sys/fs/cgroup` and convert the raw data
into human-readable metrics and meaningful visualizations. Through cgroups, Netdata is compatible with **all Linux
containers**, such as Docker, LXC, LXD, Libvirt, systemd-nspawn, and more. Read more about [Docker-specific
monitoring](#collect-docker-metrics) below.

Netdata also has robust **Kubernetes monitoring** support thanks to a
[Helmchart](/docs/agent/packaging/installer/methods/kubernetes) to automate deployment, collectors for k8s agent services, and
robust [service discovery](https://github.com/netdata/agent-service-discovery/#service-discovery) to monitor the
services running inside of pods in your k8s cluster. Read more about [Kubernetes
monitoring](#collect-kubernetes-metrics) below.

A handful of additional collectors gather metrics from container-related services, such as
[dockerd](/docs/agent/collectors/python.d.plugin/dockerd) or [Docker
Engine](/docs/agent/collectors/go.d.plugin/modules/docker_engine/). You can find all
container collectors in our supported collectors list under the
[containers/VMs](/docs/agent/collectors/collectors#containers-and-vms) and
[Kubernetes](/docs/agent/collectors/collectors#containers-and-vms) headings.

## Collect Docker metrics

Netdata has robust Docker monitoring thanks to the aforementioned
[cgroups.plugin](/docs/agent/collectors/cgroups.plugin). By polling cgroups every second, Netdata can produce meaningful
visualizations about the CPU, memory, disk, and network utilization of all running containers on the host system with
zero configuration.

Netdata also collects metrics from applications running inside of Docker containers. For example, if you create a MySQL
database container using `docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag`, it exposes
metrics on port 3306. You can configure the [MySQL
collector](/docs/agent/collectors/go.d.plugin/modules/mysql) to look at `127.0.0.0:3306` for
MySQL metrics:

```yml
jobs:
  - name: local
    dsn: root:my-secret-pw@tcp(127.0.0.1:3306)/
```

Netdata then collects metrics from the container itself, but also dozens [MySQL-specific
metrics](/docs/agent/collectors/go.d.plugin/modules/mysql#charts) as well.

### Collect metrics from applications running in Docker containers

You could use this technique to monitor an entire infrastructure of Docker containers. The same [enable and
configure](/docs/collect/enable-configure) procedures apply whether an application runs on the host system or inside
a container. You may need to configure the target endpoint if it's not the application's default.

Netdata can even [run in a Docker container](/docs/agent/packaging/docker) itself, and then collect metrics about the
host system, its own container with cgroups, and any applications you want to monitor.

See our [application metrics doc](/docs/collect/application-metrics) for details about Netdata's application metrics
collection capabilities.

## Collect Kubernetes metrics

We already have a few complementary tools and collectors for monitoring the many layers of a Kubernetes cluster,
_entirely for free_. These methods work together to help you troubleshoot performance or availablility issues across
your k8s infrastructure.

-   A [Helm chart](https://github.com/netdata/helmchart), which bootstraps a Netdata Agent pod on every node in your
    cluster, plus an additional parent pod for storing metrics and managing alarm notifications.
-   A [service discovery plugin](https://github.com/netdata/agent-service-discovery), which discovers and immediately
    monitors 22 different services that might be running inside of your cluster's pods. Service discovery happens
    without manual intervention as pods are created, destroyed, or moved between nodes. [Compatible
    services](https://github.com/netdata/helmchart#service-discovery-and-supported-services) include Nginx, Apache,
    MySQL, CoreDNS, and much more.
-   A [Kubelet collector](/docs/agent/collectors/go.d.plugin/modules/k8s_kubelet), which runs
    on each node in a k8s cluster to monitor the number of pods/containers, the volume of operations on each container,
    and more.
-   A [kube-proxy collector](/docs/agent/collectors/go.d.plugin/modules/k8s_kubeproxy), which
    also runs on each node and monitors latency and the volume of HTTP requests to the proxy.
-   A [cgroups collector](/docs/agent/collectors/cgroups.plugin), which collects CPU, memory, and bandwidth metrics for
    each container running on your k8s cluster.

For a holistic view of Netdata's Kubernetes monitoring capabilities, see our guide: [_Monitor a Kubernetes (k8s) cluster
with Netdata_](/guides/monitor/kubernetes-k8s-netdata).

## What's next?

Netdata is capable of collecting metrics from hundreds of applications, such as web servers, databases, messaging
brokers, and more. See more in the [application metrics doc](/docs/collect/application-metrics).

If you already have all the information you need about collecting metrics, move into Netdata's meaningful visualizations
with [viewing all nodes at a glance](/docs/visualize/view-all-nodes).


