---
title: "Export metrics to external time-series databases"
description: "Use the exporting engine to send Netdata metrics to popular external time series databases for long-term storage or further analysis."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/export/external-databases.md
---



Netdata allows you to export metrics to external time-series databases with the [exporting
engine](/docs/agent/exporting). This system uses a number of **connectors** to intiate connections to [more than
thirty](#supported-databases) supported databases, including InfluxDB, Prometheus, Graphite, ElasticSearch, and much
more. 

The exporting engine resamples Netdata's thousands of per-second metrics at a user-configurable interval, and can export
metrics to multiple time-series databases simultaneously.

Based on your needs and resources you allocated to your external time-series database, you can configure the interval
that metrics are exported or export only certain charts with filtering. You can also choose whether metrics are exported
as-collected, a normalized average, or the sum/volume of metrics values over the configured interval.

Exporting is an important part of Netdata's effort to be [interoperable](/docs/overview/netdata-monitoring-stack)
with other monitoring software. You can use an external time-series database for long-term metrics retention, further
analysis, or correlation with other tools, such as application tracing.

## Supported databases

Netdata supports exporting metrics to the following databases through several
[connectors](/docs/agent/exporting#features). Once you find the connector that works for your database, open its
documentation and the [enabling a connector](/docs/export/enable-connector) doc for details on enabling it.

-   **AppOptics**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **AWS Kinesis**: [AWS Kinesis Data Streams](/docs/agent/exporting/aws_kinesis)
-   **Azure Data Explorer**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Azure Event Hubs**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Blueflood**: [Graphite](/docs/agent/exporting/graphite)
-   **Chronix**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Cortex**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **CrateDB**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **ElasticSearch**: [Graphite](/docs/agent/exporting/graphite), [Prometheus remote
    write](/docs/agent/exporting/prometheus/remote_write)
-   **Gnocchi**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Google BigQuery**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Google Cloud Pub/Sub**: [Google Cloud Pub/Sub Service](/docs/agent/exporting/pubsub)
-   **Graphite**: [Graphite](/docs/agent/exporting/graphite), [Prometheus remote
    write](/docs/agent/exporting/prometheus/remote_write)
-   **InfluxDB**: [Graphite](/docs/agent/exporting/graphite), [Prometheus remote
    write](/docs/agent/exporting/prometheus/remote_write)
-   **IRONdb**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **JSON**: [JSON document databases](/docs/agent/exporting/json)
-   **Kafka**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **KairosDB**: [Graphite](/docs/agent/exporting/graphite), [OpenTSDB](/docs/agent/exporting/opentsdb)
-   **M3DB**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **MetricFire**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **MongoDB**: [MongoDB](/docs/agent/exporting/mongodb/)
-   **New Relic**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **OpenTSDB**: [OpenTSDB](/docs/agent/exporting/opentsdb), [Prometheus remote
    write](/docs/agent/exporting/prometheus/remote_write)
-   **PostgreSQL**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
    via [PostgreSQL Prometheus Adapter](https://github.com/CrunchyData/postgresql-prometheus-adapter)
-   **Prometheus**: [Prometheus scraper](/docs/agent/exporting/prometheus)
-   **TimescaleDB**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write),
    [netdata-timescale-relay](/docs/agent/exporting/timescale)
-   **QuasarDB**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **SignalFx**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Splunk**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **TiKV**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Thanos**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **VictoriaMetrics**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)
-   **Wavefront**: [Prometheus remote write](/docs/agent/exporting/prometheus/remote_write)

Can't find your preferred external time-series database? Ask our [community](https://community.netdata.cloud/) for
solutions, or file an [issue on
GitHub](https://github.com/netdata/netdata/issues/new?labels=bug%2C+needs+triage&template=bug_report.md).

## What's next?

We recommend you read our document on [enabling a connector](/docs/export/enable-connector) to learn about the
process and discover important configuration options. If you would rather skip ahead, click on any of the above links to
connectors for their reference documentation, which outline any prerequisites to install for that connector, along with
connector-specific configuration options.

Read about one possible use case for exporting metrics in our guide: [_Export and visualize Netdata metrics in
Graphite_](/guides/export/export-netdata-metrics-graphite).

### Related reference documentation

-   [Exporting engine reference](/docs/agent/exporting)
-   [Backends reference (deprecated)](/docs/agent/backends)


