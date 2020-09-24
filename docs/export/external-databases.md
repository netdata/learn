---
title: "Export metrics to external time-series databases"
description: "Use the exporting engine to send Netdata metrics to popular external time series databases for long-term storage or further analysis."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/export/external-databases.md
---

# Export metrics to external time-series databases

One of Netdata's pillars is [interoperability](/docs/overview/netdata-monitoring-stack.md) with other monitoring and
visualization solutions. To this end, you can use the Agent's [exporting engine](/exporting/README.md) to send metrics
to multiple external databases/services in parallel. 

Once you connect Netdata metrics to other solutions, you can apply machine learning analysis or correlation with other
tools, such as application tracing.

The exporting engine supports a number of connectors, including AWS Kinesis Data Streams, Graphite, JSON, MongoDB,
OpenTSDB, Prometheus remote write, and more, via exporting **connectors**. These connectors help you send Netdata
metrics to more than 20 popular time-series databases.

## Supported databases

Netdata supports exporting metrics to the following databases through a number of connectors. Once you find your
database and its associated connector, visit our [enabling a connector](/) doc for setup and configuration details.

-   **Graphite**: Graphite, [Prometheus remote write]()
-   **InfluxDB**: []
-   **JSON** document database: [JSON](/exporting/json/README.md)
-   **OpenTSDB**: 


    AppOptics: write
    Azure Data Explorer: read and write
    Azure Event Hubs: write
    Chronix: write
    Cortex: read and write
    CrateDB: read and write
    Elasticsearch: write
    Gnocchi: write
    Google BigQuery: read and write
    Google Cloud Spanner: read and write
    Graphite: write
    InfluxDB: read and write
    IRONdb: read and write
    Kafka: write
    M3DB: read and write
    MetricFire: read and write
    New Relic: write
    OpenTSDB: write
    PostgreSQL/TimescaleDB: read and write
    QuasarDB: read and write
    SignalFx: write
    Splunk: read and write
    TiKV: read and write
    Thanos: read and write
    VictoriaMetrics: write
    Wavefront: write


| Database | Supported connectors                    |
|-----------|----------------------------------------|
| Graphite  | Graphite <br />[Prometheus remote write](/exporting/prometheus/remote_write/README.md) |
| InfluxDB       | add a cell                             |
| OpenTSDB     | ipsum                                  |
|           | empty outside cells                    |
| skip      |                                        |
| six       | Morbi purus                            |


## What's next?

To begin exporting metrics to your 

-   [Guide: Export and visualize Netdata metrics in Graphite](/docs/guides/export/export-netdata-metrics-graphite.md)
-   [Guide: Use host labels to organize systems, metrics, and alarms](/docs/guides/using-host-labels.md)
-   [Guide: Change how long Netdata stores metrics (long-term storage)](/docs/guides/longer-metrics-storage.md)

### Related reference documentation

-   [Exporting engine reference](/exporting/README.md)
-   [Backends reference (deprecated)](/backends/README.md)

[![analytics](https://www.google-analytics.com/collect?v=1&aip=1&t=pageview&_s=1&ds=github&dr=https%3A%2F%2Fgithub.com%2Fnetdata%2Fnetdata&dl=https%3A%2F%2Fmy-netdata.io%2Fgithub%2Fdocs%2Fexporting%2Fexternal-databases&_u=MAC~&cid=5792dfd7-8dc4-476b-af31-da2fdb9f93d2&tid=UA-64295674-3)](<>)
