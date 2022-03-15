---
title: "Collecting metrics"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/README.md
---



Netdata can collect metrics from hundreds of different sources, be they internal data created by the system itself, or
external data created by services or applications. To see _all_ of the sources Netdata collects from, view our [list of
supported collectors](/docs/agent/collectors/collectors).

There are two essential points to understand about how collecting metrics works in Netdata:

-   All collectors are **installed by default** with every installation of Netdata. You do not need to install
    collectors manually to collect metrics from new sources.
-   Upon startup, Netdata will **auto-detect** any application or service that has a
    [collector](/docs/agent/collectors/collectors), as long as both the collector and the app/service are configured correctly.

Most users will want to enable a new Netdata collector for their app/service. For those details, see
our [collectors' configuration reference](/docs/agent/collectors/reference).

## Take your next steps with collectors

[Supported collectors list](/docs/agent/collectors/collectors)

[Collectors configuration reference](/docs/agent/collectors/reference)

## Guides

[Monitor Nginx or Apache web server log files with Netdata](/guides/collect-apache-nginx-web-logs)

[Monitor CockroachDB metrics with Netdata](/guides/monitor-cockroachdb)

[Monitor Unbound DNS servers with Netdata](/guides/collect-unbound-metrics)

[Monitor a Hadoop cluster with Netdata](/guides/monitor-hadoop-cluster)

## Related features

**[Dashboards](/docs/agent/web)**: Visualize your newly-collect metrics in real-time using Netdata's [built-in
dashboard](/docs/agent/web/gui). 

**[Exporting](/docs/agent/exporting)**: Extend our built-in [database engine](/docs/agent/database/engine), which supports
long-term metrics storage, by archiving metrics to external databases like Graphite, Prometheus, MongoDB, TimescaleDB, and more.
It can export metrics to multiple databases simultaneously.


