---
title: "What is Netdata?"
date: 2020-05-01
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/what-is-netdata.md
---



[![Code
Climate](https://codeclimate.com/github/netdata/netdata/badges/gpa.svg)](https://codeclimate.com/github/netdata/netdata)
[![Codacy
Badge](https://api.codacy.com/project/badge/Grade/a994873f30d045b9b4b83606c3eb3498)](https://www.codacy.com/app/netdata/netdata?utm_source=github.com&utm_medium=referral&utm_content=netdata/netdata&utm_campaign=Badge_Grade)
[![LGTM
C](https://img.shields.io/lgtm/grade/cpp/g/netdata/netdata.svg?logo=lgtm)](https://lgtm.com/projects/g/netdata/netdata/context:cpp)
[![LGTM
JS](https://img.shields.io/lgtm/grade/javascript/g/netdata/netdata.svg?logo=lgtm)](https://lgtm.com/projects/g/netdata/netdata/context:javascript)
[![LGTM
PYTHON](https://img.shields.io/lgtm/grade/python/g/netdata/netdata.svg?logo=lgtm)](https://lgtm.com/projects/g/netdata/netdata/context:python)

---

Netdata is **distributed, real-time performance and health monitoring** for systems and applications. It is a
highly-optimized monitoring agent you install on all your systems and containers.

Netdata provides **unparalleled insights**, in **real-time**, of everything happening on the systems it's running on
(including web servers, databases, applications), using **highly interactive web dashboards**. 

A highly-efficient database **stores long-term historical metrics for days, weeks, or months**, all at 1-second
granularity. Run this long-term storage autonomously, or integrate Netdata with your existing monitoring toolchains
(Prometheus, Graphite, OpenTSDB, Kafka, Grafana, and more).

Netdata is **fast** and **efficient**, designed to permanently run on all systems (**physical** and **virtual** servers,
**containers**, **IoT** devices), without disrupting their core function.

Netdata is **free, open-source software** and it currently runs on **Linux**, **FreeBSD**, and **macOS**, along with
other systems derived from them, such as **Kubernetes** and **Docker**.

Netdata is not hosted by the CNCF but is the fourth most starred open-source project in the [Cloud Native Computing
Foundation (CNCF) landscape](https://landscape.cncf.io/format=card-mode&grouping=no&sort=stars).

---

People get **addicted to Netdata**. Once you use it on your systems, **there is no going back**! _You've been warned..._

![image](https://user-images.githubusercontent.com/2662304/48305662-9de82980-e537-11e8-9f5b-aa1a60fbb82f.png)

[![Tweet about
Netdata!](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&label=Tweet%20about%20netdata)](https://twitter.com/intent/tweet?text=Netdata,%20real-time%20performance%20and%20health%20monitoring,%20done%20right!&url=https://my-netdata.io/&via=linuxnetdata&hashtags=netdata,monitoring)

## Contents

1.  [What does it look like?](#what-does-it-look-like) - Take a quick tour through the dashboard
2.  [Our userbase](#user-base) - Enterprises we help monitor and our userbase
3.  [Quickstart](#quickstart) - How to try it now on your systems
4.  [Why Netdata](#why-netdata) - Why people love Netdata and how it compares with other solutions
5.  [How Netdata works](#how-it-works) - A high-level diagram of how Netdata works
6.  [Infographic](#infographic) - Everything about Netdata in a single graphic
7.  [Features](#features) - How you'll use Netdata on your systems
8.  [Visualization](#visualization) - Learn about visual anomaly detection
9.  [What Netdata monitors](#what-netdata-monitors) - See which apps/services Netdata auto-detects
10. [Documentation](#documentation) - Read the documentation
11. [Community](#community) - Discuss Netdata with others and get support
12. [License](#license) - Check Netdata's licencing
13. [Is it any good?](#is-it-any-good) - Yes.
14. [Is it awesome?](#is-it-awesome) - Yes.

## What does it look like?

The following animated GIF shows the top part of a typical Netdata dashboard.

![The Netdata dashboard in
action](https://user-images.githubusercontent.com/1153921/80827388-b9fee100-8b98-11ea-8f60-0d7824667cd3.gif)

> A typical Netdata dashboard, in 1:1 timing. Charts can be panned by dragging them, zoomed in/out with `SHIFT` + `mouse
> wheel`, an area can be selected for zoom-in with `SHIFT` + `mouse selection`. Netdata is highly interactive,
> **real-time**, and optimized to get the work done!

Want to try Netdata before you install? See our [live
demo](https://london.my-netdata.io/default.html#menu_system_submenu_cpu;theme=slate;help=true).

## User base

Netdata is used by hundreds of thousands of users all over the world. Check our [GitHub watchers
list](https://github.com/netdata/netdata/watchers). You will find people working for **Amazon**, **Atos**, **Baidu**,
**Cisco Systems**, **Citrix**, **Deutsche Telekom**, **DigitalOcean**, **Elastic**, **EPAM Systems**, **Ericsson**,
**Google**, **Groupon**, **Hortonworks**, **HP**, **Huawei**, **IBM**, **Microsoft**, **NewRelic**, **Nvidia**, **Red
Hat**, **SAP**, **Selectel**, **TicketMaster**, **Vimeo**, and many more!

### Docker pulls

We provide Docker images for the most common architectures. These are statistics reported by Docker Hub:

[![netdata/netdata
(official)](https://img.shields.io/docker/pulls/netdata/netdata.svg?label=netdata/netdata+%28official%29)](https://hub.docker.com/r/netdata/netdata/)
[![firehol/netdata
(deprecated)](https://img.shields.io/docker/pulls/firehol/netdata.svg?label=firehol/netdata+%28deprecated%29)](https://hub.docker.com/r/firehol/netdata/)
[![titpetric/netdata
(donated)](https://img.shields.io/docker/pulls/titpetric/netdata.svg?label=titpetric/netdata+%28third+party%29)](https://hub.docker.com/r/titpetric/netdata/)

### Registry

When you install multiple Netdata, they are integrated into **one distributed application**, via a [Netdata
registry](/docs/agent/registry). This is a web browser feature and it allows us to count the number of unique users and
unique Netdata servers installed. The following information comes from the global public Netdata registry we run:

[![User
Base](https://registry.my-netdata.io/api/v1/badge.svg?chart=netdata.registry_entries&dimensions=persons&label=user%20base&units=M&value_color=blue&precision=2&divide=1000000&v43)](https://registry.my-netdata.io/#menu_netdata_submenu_registry)
[![Monitored
Servers](https://registry.my-netdata.io/api/v1/badge.svg?chart=netdata.registry_entries&dimensions=machines&label=servers%20monitored&units=k&divide=1000&value_color=orange&precision=2&v43)](https://registry.my-netdata.io/#menu_netdata_submenu_registry)
[![Sessions
Served](https://registry.my-netdata.io/api/v1/badge.svg?chart=netdata.registry_sessions&label=sessions%20served&units=M&value_color=yellowgreen&precision=2&divide=1000000&v43)](https://registry.my-netdata.io/#menu_netdata_submenu_registry)

_In the last 24 hours:_<br/> [![New Users
Today](https://registry.my-netdata.io/api/v1/badge.svg?chart=netdata.registry_entries&dimensions=persons&after=-86400&options=unaligned&group=incremental-sum&label=new%20users%20today&units=null&value_color=blue&precision=0&v42)](https://registry.my-netdata.io/#menu_netdata_submenu_registry)
[![New Machines
Today](https://registry.my-netdata.io/api/v1/badge.svg?chart=netdata.registry_entries&dimensions=machines&group=incremental-sum&after=-86400&options=unaligned&label=servers%20added%20today&units=null&value_color=orange&precision=0&v42)](https://registry.my-netdata.io/#menu_netdata_submenu_registry)
[![Sessions
Today](https://registry.my-netdata.io/api/v1/badge.svg?chart=netdata.registry_sessions&after=-86400&group=incremental-sum&options=unaligned&label=sessions%20served%20today&units=null&value_color=yellowgreen&precision=0&v42)](https://registry.my-netdata.io/#menu_netdata_submenu_registry)

## Quickstart

![](https://registry.my-netdata.io/api/v1/badge.svg?chart=web_log_nginx.requests_per_url&options=unaligned&dimensions=kickstart&group=sum&after=-3600&label=last+hour&units=installations&value_color=orange&precision=0)
![](https://registry.my-netdata.io/api/v1/badge.svg?chart=web_log_nginx.requests_per_url&options=unaligned&dimensions=kickstart&group=sum&after=-86400&label=today&units=installations&precision=0)

To install Netdata from source on any Linux system (physical, virtual, container, IoT, edge) and keep it up to date with
our **nightly releases** automatically, run the following:

```bash
# make sure you run `bash` for your shell
bash

# install Netdata directly from GitHub source
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

Starting with v1.12, Netdata collects anonymous usage information by default and sends it to Google Analytics. Read
about the information collected, and learn how to-opt, on our [anonymous statistics](/docs/agent/anonymous-statistics) page.

The usage statistics are _vital_ for us, as we use them to discover bugs and prioritize new features. We thank you for
_actively_ contributing to Netdata's future.

To learn more about the pros and cons of using _nightly_ vs. _stable_ releases, see our [notice about the two options](/docs/agent/packaging/installer#nightly-vs-stable-releases).

The above command will:

-   Install any required packages on your system (it will ask you to confirm before doing so)
-   Compile it, install it, and start it.

More installation methods and additional options can be found at the [installation
page](/docs/agent/packaging/installer).

To try Netdata in a Docker container, run this:

```sh
docker run -d --name=netdata \
  -p 19999:19999 \
  -v netdatalib:/var/lib/netdata \
  -v netdatacache:/var/cache/netdata \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/os-release:/host/etc/os-release:ro \
  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata
```

For more information about running Netdata in Docker, check the [docker installation page](/docs/agent/packaging/docker).

![image](https://user-images.githubusercontent.com/2662304/48304090-fd384080-e51b-11e8-80ae-eecb03118dda.png)

From Netdata v1.12 and above, anonymous usage information is collected by default and sent to Google Analytics. To read
more about the information collected and how to opt-out, check the [anonymous statistics
page](/docs/agent/anonymous-statistics).

## Why Netdata

Netdata has a quite different approach to monitoring.

Netdata is a monitoring agent you install on all your systems. It is:

-   A **metrics collector** for system and application metrics (including web servers, databases, containers, and much
    more),
-   A **long-term metrics database** that stores recent metrics in memory and "spills" historical metrics to disk for
    efficient long-term storage,
-   A super fast, interactive, and modern **metrics visualizer** optimized for anomaly detection,
-   And an **alarms notification engine** for detecting performance and availability issues.

All the above, are packaged together in a very flexible, extremely modular, distributed application.

This is how Netdata compares to other monitoring solutions:

| Netdata                                                         | others (open-source and commercial)                              |
| :-------------------------------------------------------------- | :--------------------------------------------------------------- |
| **High resolution metrics** (1s granularity)                    | Low resolution metrics (10s granularity at best)                 |
| Monitors everything, **thousands of metrics per node**          | Monitor just a few metrics                                       |
| UI is super fast, optimized for **anomaly detection**           | UI is good for just an abstract view                             |
| **Long-term, autonomous storage** at one-second granularity     | Centralized metrics in an expensive data lake at 10s granularity |
| **Meaningful presentation**, to help you understand the metrics | You have to know the metrics before you start                    |
| Install and get results **immediately**                         | Long preparation is required to get any useful results           |
| Use it for **troubleshooting** performance problems             | Use them to get _statistics of past performance_                 |
| **Kills the console** for tracing performance issues            | The console is always required for troubleshooting               |
| Requires **zero dedicated resources**                           | Require large dedicated resources                                |

Netdata is **open-source**, **free**, super **fast**, very **easy**, completely **open**, extremely **efficient**,
**flexible** and integrate-able.

It has been designed by **system administrators**, **DevOps engineers**, and **developers** for to not just visualize
metrics, but also troubleshoot complex performance problems.

## How it works

Netdata is a highly efficient, highly modular, metrics management engine. Its lockless design makes it ideal for
concurrent operations on the metrics.

![image](https://user-images.githubusercontent.com/2662304/48323827-b4c17580-e636-11e8-842c-0ee72fcb4115.png)

This is how it works:

| Function    | Description                                                                                                                                                                                                                                                    | Documentation                                       |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| **Collect** | Multiple independent data collection workers are collecting metrics from their sources using the optimal protocol for each application and push the metrics to the database. Each data collection worker has lockless write access to the metrics it collects. | [`collectors`](/docs/agent/collectors)               |
| **Store**   | Metrics are first stored in RAM in a custom database engine that then "spills" historical metrics to disk for efficient long-term metrics storage.                                                                                                             | [`database`](/docs/agent/database)                   |
| **Check**   | A lockless independent watchdog is evaluating **health checks** on the collected metrics, triggers alarms, maintains a health transaction log and dispatches alarm notifications.                                                                              | [`health`](/docs/agent/health)                       |
| **Stream**  | A lockless independent worker is streaming metrics, in full detail and in real-time, to remote Netdata servers, as soon as they are collected.                                                                                                                 | [`streaming`](/docs/agent/streaming)                 |
| **Archive** | A lockless independent worker is down-sampling the metrics and pushes them to **backend** time-series databases.                                                                                                                                               | [`exporting`](/docs/agent/export)               |
| **Query**   | Multiple independent workers are attached to the [internal web server](/docs/agent/web/server), servicing API requests, including [data queries](/docs/agent/web/api/queries).                                                                                   | [`web/api`](/docs/agent/web/api)                     |

The result is a highly efficient, low-latency system, supporting multiple readers and one writer on each metric.

## Infographic

This is a high level overview of Netdata feature set and architecture. Click it to to interact with it (it has direct
links to our documentation).

[![image](https://user-images.githubusercontent.com/43294513/60951037-8ba5d180-a2f8-11e9-906e-e27356f168bc.png)](https://my-netdata.io/infographic.html)

## Features

![finger-video](https://user-images.githubusercontent.com/2662304/48346998-96cf3180-e685-11e8-9f4e-059d23aa3aa5.gif)

This is what you should expect from Netdata:

### General

-   **1s granularity** - The highest possible resolution for all metrics.
-   **Unlimited metrics** - Netdata collects all the available metrics—the more, the better.
-   **1% CPU utilization of a single core** - It's unbelievably optimized.
-   **A few MB of RAM** - The highly-efficient database engine stores per-second metrics in RAM and then "spills"
    historical metrics to disk long-term storage.   
-   **Minimal disk I/O** - While running, Netdata only writes historical metrics and reads `error` and `access` logs.
-   **Zero configuration** - Netdata auto-detects everything, and can collect up to 10,000 metrics per server out of the
    box.
-   **Zero maintenance** - You just run it. Netdata does the rest.
-   **Zero dependencies** - Netdata runs a custom web server for its static web files and its web API (though its
    plugins may require additional libraries, depending on the applications monitored).
-   **Scales to infinity** - You can install it on all your servers, containers, VMs, and IoT devices. Metrics are not
    centralized by default, so there is no limit.
-   **Several operating modes** - Autonomous host monitoring (the default), headless data collector, forwarding proxy,
    store and forward proxy, central multi-host monitoring, in all possible configurations. Each node may have different
    metrics retention policies and run with or without health monitoring.

### Health Monitoring & Alarms

-   **Sophisticated alerting** - Netdata comes with hundreds of alarms **out of the box**! It supports dynamic
    thresholds, hysteresis, alarm templates, multiple role-based notification methods, and more.
-   **Notifications**: [alerta.io](/docs/agent/health/notifications/alerta/), [amazon sns](/docs/agent/health/notifications/awssns/),
    [discordapp.com](/docs/agent/health/notifications/discord/), [email](/docs/agent/health/notifications/email/),
    [flock.com](/docs/agent/health/notifications/flock/), [hangouts](/docs/agent/health/notifications/hangouts/),
    [irc](/docs/agent/health/notifications/irc/), [kavenegar.com](/docs/agent/health/notifications/kavenegar/),
    [messagebird.com](/docs/agent/health/notifications/messagebird/), [pagerduty.com](/docs/agent/health/notifications/pagerduty/),
    [prowl](/docs/agent/health/notifications/prowl/), [pushbullet.com](/docs/agent/health/notifications/pushbullet/),
    [pushover.net](/docs/agent/health/notifications/pushover/), [rocket.chat](/docs/agent/health/notifications/rocketchat/),
    [slack.com](/docs/agent/health/notifications/slack/), [smstools3](/docs/agent/health/notifications/smstools3/),
    [syslog](/docs/agent/health/notifications/syslog/), [telegram.org](/docs/agent/health/notifications/telegram/),
    [twilio.com](/docs/agent/health/notifications/twilio/), [web](/docs/agent/health/notifications/web/) and [custom
    notifications](/docs/agent/health/notifications/custom/).

### Integrations

-   **Time-series databases** - Netdata can archive its metrics to **Graphite**, **OpenTSDB**, **Prometheus**, **AWS
    Kinesis**, **MongoDB**, **JSON document DBs**, in the same or lower resolution (lower: to prevent it from congesting
    these servers due to the amount of data collected). Netdata also supports **Prometheus remote write API**, which
    allows storing metrics to **Elasticsearch**, **Gnocchi**, **InfluxDB**, **Kafka**, **PostgreSQL/TimescaleDB**,
    **Splunk**, **VictoriaMetrics** and a lot of other [storage
    providers](https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage).

## Visualization

-   **Stunning interactive dashboards** - Our dashboard is mouse-, touchpad-, and touch-screen friendly in 2 themes:
    `slate` (dark) and `white`.
-   **Amazingly fast visualization** - Even on low-end hardware, the dashboard responds to all queries in less than 1 ms
    per metric.
-   **Visual anomaly detection** - Our UI/UX emphasizes the relationships between charts so you can better detect
    anomalies visually.
-   **Embeddable** - Charts can be embedded on your web pages, wikis and blogs. You can even use [Atlassian's Confluence
    as a monitoring dashboard](/docs/agent/web/gui/confluence).
-   **Customizable** - You can build custom dashboards using simple HTML. No JavaScript needed!

### Positive and negative values

To improve clarity on charts, Netdata dashboards present **positive** values for metrics representing `read`, `input`,
`inbound`, `received` and **negative** values for metrics representing `write`, `output`, `outbound`, `sent`.

![Screenshot showing positive and negative
values](https://user-images.githubusercontent.com/1153921/81870401-9d649080-952a-11ea-80e3-4a7b480252ee.gif)

_Netdata charts showing the bandwidth and packets of a network interface. `received` is positive and `sent` is
negative._

### Autoscaled y-axis

Netdata charts automatically zoom vertically, to visualize the variation of each metric within the visible time-frame.

![Animated GIF showing the auso-scaling Y
axis](https://user-images.githubusercontent.com/1153921/80838276-8084a080-8bad-11ea-8167-8d5ab2fb1be1.gif)

_A zero-based `stacked` chart, automatically switches to an auto-scaled `area` chart when a single dimension is
selected._

### Charts are synchronized

Charts on Netdata dashboards are synchronized to each other. There is no master chart. Any chart can be panned or zoomed
at any time, and all other charts will follow.

![Animated GIF of the standard Netdata dashboard being manipulated and synchronizing
charts](https://user-images.githubusercontent.com/1153921/80839230-b034a800-8baf-11ea-9cb2-99c1e10f0f85.gif)

_Charts are panned by dragging them with the mouse. Charts can be zoomed in/out with`SHIFT` + `mouse wheel` while the
mouse pointer is over a chart._

### Highlighted time-frame

To improve visual anomaly detection across charts, the user can highlight a time-frame (by pressing `Alt` + `mouse
selection`) on all charts.

![An animated GIF of highlighting a specific
timeframe](https://user-images.githubusercontent.com/1153921/80839611-6ef0c800-8bb0-11ea-9e9c-f75ec9a2e54c.gif)

_A highlighted time-frame can be given by pressing `Alt` + `mouse selection` on any chart. Netdata will highlight the
same range on all charts._

## What Netdata monitors

Netdata can collect metrics from 200+ popular services and applications, on top of dozens of system-related metrics
jocs, such as CPU, memory, disks, filesystems, networking, and more. We call these **collectors**, and they're managed
by [**plugins**](/docs/agent/collectors/plugins.d), which support a variety of programming languages, including Go and
Python.

Popular collectors include **Nginx**, **Apache**, **MySQL**, **statsd**, **cgroups** (containers, Docker, Kubernetes,
LXC, and more), **Traefik**, **web server `access.log` files**, and much more. 

See the **full list of [supported collectors](/docs/agent/collectors/collectors)**.

Netdata's data collection is **extensible**, which means you can monitor anything you can get a metric for. You can even
write a collector for your custom application using our [plugin API](/docs/agent/collectors/plugins.d).

## Documentation

The Netdata documentation is at <https://learn.netdata.cloud>, but you can also find each page inside of Netdata's
repository itself in Markdown (`.md`) files. You can find all our documentation by navigating the repository.

Here is a quick list of notable documents:

| Directory                                             | Description                                                                                                           |
| :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| [`installer`](/docs/agent/packaging/installer)         | Instructions to install Netdata on your systems.                                                                      |
| [`docker`](/docs/agent/packaging/docker)               | Instructions to install Netdata using docker.                                                                         |
| [`daemon`](/docs/agent/daemon)                         | Information about the Netdata daemon and its configuration.                                                           |
| [`collectors`](/docs/agent/collectors)                 | Information about data collection plugins.                                                                            |
| [`health`](/docs/agent/health)                         | How Netdata's health monitoring works, how to create your own alarms and how to configure alarm notification methods. |
| [`streaming`](/docs/agent/streaming)                   | How to build hierarchies of Netdata servers, by streaming metrics between them.                                       |
| [`exporting`](/docs/agent/export)                 | Long term archiving of metrics to industry-standard time-series databases, like `prometheus`, `graphite`, `opentsdb`. |
| [`web/api`](/docs/agent/web/api)                       | Learn how to query the Netdata API and the queries it supports.                                                       |
| [`web/api/badges`](/docs/agent/web/api/badges)         | Learn how to generate badges (SVG images) from live data.                                                             |
| [`web/gui/custom`](/docs/agent/web/gui/custom)         | Learn how to create custom Netdata dashboards.                                                                        |
| [`web/gui/confluence`](/docs/agent/web/gui/confluence) | Learn how to create Netdata dashboards on Atlassian's Confluence.                                                     |

You can also check all the other directories. Most of them have plenty of documentation.

## Community

We welcome [contributions](/docs/agent/contributing). Feel free to join the team!

To report bugs or get help, use [GitHub's issues](https://github.com/netdata/netdata/issues).

You can also find Netdata on:

-   [Facebook](https://www.facebook.com/linuxnetdata/)
-   [Twitter](https://twitter.com/linuxnetdata)
-   [StackShare](https://stackshare.io/netdata)
-   [Product Hunt](https://www.producthunt.com/posts/netdata-monitoring-agent/)
-   [Repology](https://repology.org/metapackage/netdata/versions)

## License

Netdata is [GPLv3+](https://github.com/netdata/netdata/blob/master/LICENSE).

Netdata re-distributes other open-source tools and libraries. Please check the [third party licenses](/docs/agent/redistributed).

## Is it any good?

Yes.

_When people first hear about a new product, they frequently ask if it is any good. A Hacker News user
[remarked](https://news.ycombinator.com/item?id=3067434):_

> Note to self: Starting immediately, all raganwald projects will have a “Is it any good?” section in the readme, and
> the answer shall be “yes.".

So, we follow the tradition...

## Is it awesome?

[These people](https://github.com/netdata/netdata/stargazers) seem to like it.
