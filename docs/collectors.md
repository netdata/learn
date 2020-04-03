---
title: "Collecting metrics"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/README.md
---



Netdata can collect metrics from hundreds of different sources, be they internal data created by the system itself, or
external data created by services or applications. To see _all_ of the sources Netdata collects from, view our [list of
supported collectors](/docs/collectors), and then view our [quickstart guide](/docs/quickstart) to get up-and-running.

There are two essential points to understand about how collecting metrics works in Netdata:

-   All collectors are **installed by default** with every installation of Netdata. You do not need to install
    collectors manually to collect metrics from new sources.
-   Upon startup, Netdata will **auto-detect** any application or service that has a [collector](/docs/collectors), as long
    as both the collector and the app/service are configured correctly.

Most users will want to enable a new Netdata collector for their app/service. For those details, see our [quickstart
guide](/docs/quickstart).

## Take your next steps with collectors

[Collectors quickstart](/docs/quickstart)

[Supported collectors list](/docs/collectors)

[Collectors configuration reference](/docs/reference)

## Tutorials

[Monitor Nginx or Apache web server log files with Netdata](/docs/tutorials/collect-apache-nginx-web-logs)

[Monitor CockroadchDB metrics with Netdata](/docs/tutorials/monitor-cockroachdb)

[Monitor Unbound DNS servers with Netdata](/docs/tutorials/collect-unbound-metrics)

[Monitor a Hadoop cluster with Netdata](/docs/tutorials/monitor-hadoop-cluster)

## Related features

**[Dashboards](/docs/web)**: Vizualize your newly-collect metrics in real-time using Netdata's [built-in
dashboard](/docs/web/gui). 

**[Backends](/docs/backends)**: Extend our built-in [database engine](/docs), which supports long-term metrics
storage, by archiving metrics to like Graphite, Prometheus, MongoDB, TimescaleDB, and more.

**[Exporting](/docs/exporting)**: An experimental refactoring of our backends system with a modular system and
support for exporting metrics to multiple systems simultaneously.


