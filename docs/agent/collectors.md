---
title: "Collecting metrics"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/README.md
---



Netdata can collect metrics from hundreds of different sources, be they internal data created by the system itself, or
external data created by services or applications. To see _all_ of the sources Netdata collects from, view our [list of
supported collectors](agent/collectors/collectors.md), and then view our [quickstart guide](agent/collectors/quickstart.md) to get
up-and-running.

There are two essential points to understand about how collecting metrics works in Netdata:

-   All collectors are **installed by default** with every installation of Netdata. You do not need to install
    collectors manually to collect metrics from new sources.
-   Upon startup, Netdata will **auto-detect** any application or service that has a
    [collector](agent/collectors/collectors.md), as long as both the collector and the app/service are configured correctly.

Most users will want to enable a new Netdata collector for their app/service. For those details, see our [quickstart
guide](agent/collectors/quickstart.md).

## Take your next steps with collectors

[Collectors quickstart](agent/collectors/quickstart.md)

[Supported collectors list](agent/collectors/collectors.md)

[Collectors configuration reference](agent/collectors/reference.md)

## Tutorials

[Monitor Nginx or Apache web server log files with Netdata](agent/tutorials/collect-apache-nginx-web-logs.md)

[Monitor CockroadchDB metrics with Netdata](agent/tutorials/monitor-cockroachdb.md)

[Monitor Unbound DNS servers with Netdata](agent/tutorials/collect-unbound-metrics.md)

[Monitor a Hadoop cluster with Netdata](agent/tutorials/monitor-hadoop-cluster.md)

## Related features

**[Dashboards](agent/web.md)**: Vizualize your newly-collect metrics in real-time using Netdata's [built-in
dashboard](agent/web/gui.md). 

**[Backends](agent/backends.md)**: Extend our built-in [database engine](agent/database/engine.md), which supports
long-term metrics storage, by archiving metrics to like Graphite, Prometheus, MongoDB, TimescaleDB, and more.

**[Exporting](agent/exporting.md)**: An experimental refactoring of our backends system with a modular system and
support for exporting metrics to multiple systems simultaneously.


