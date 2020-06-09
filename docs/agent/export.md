---
title: Export metrics
description: "Archive your Netdata metrics to multiple external time series databases for long-term storage or further analysis."
custom_edit_url: https://github.com/netdata/netdata/edit/master/docs/export/README.md
---



One of Netdata's pillars is interoperability with other monitoring and visualization solutions. To this end, you can use
the Agent's [exporting engine](/docs/agent/exporting) to send metrics to multiple external databases/services in
parallel. Once you connect Netdata metrics to other solutions, you can apply machine learning analysis or correlation
with other tools, such as application tracing.

The exporting engine supports a number of connectors, including AWS Kinesis Data Streams, Graphite, JSON, MongoDB,
OpenTSDB, Prometheus remote write, and more, via exporting **connectors**. These connectors help you seamlessly send
Netdata metrics to more than 20 different endpoints, including every [service that
supports](https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage) Prometheus remote write. See
the [exporting reference guide](/docs/agent/exporting) for the full list.

## Exporting quickstart

Let's cover the process of enabling an exporting connector, using the Graphite connector as an example. These steps can
be applied to other connectors as well.

> If you are migrating from the deprecated backends system, this quickstart will also help you update your configuration
> to the new format. For the most part, the configurations are identical, but there are two exceptions. First,
> `exporting.conf` uses a new `[<type>:<name>]` format for defining connector instances. Second, the `host tags` setting
> is deprecated. Instead, use [host labels](/guides/using-host-labels) to tag exported metrics.

Open the `exporting.conf` file with `edit-config`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory
sudo ./edit-config exporting.conf
```

### Enable the exporting engine

Enable the exporting engine by setting `enabled` to `yes`:

```conf
[exporting:global]
    enabled = yes
```

### Change how often the exporting engine sends metrics

By default, the exporting engine only sends metrics to external databases every 10 seconds to avoid congesting the
destination with thousands of per-second metrics.

You can change this frequency for all connectors based on how you use exported metrics or the resources you can allocate
to long-term storage. Use the `update every` setting to change the frequency in seconds.

```conf
[exporting:global]
    update every = 10
```

### Enable a connector (Graphite)

To enable the Graphite connector, find the `[graphite:my_graphite_instance]` example section in `exporting.conf`. You
can use this (or the respective example for the connector you want to use) as a framework for your configration.

`[graphite:my_graphite_instance]` is an example of the new `[<type>:<name>]` format for defining connector instances.

Uncomment the section itself and replace `my_graphite_instance` with a name of your choice. Then set `enabled` to `yes`
and uncomment the line.

```conf
[graphite:my_graphite_instance]
    enabled = yes
    # destination = localhost:2003
    # data source = average
    # prefix = netdata
    # hostname = my_hostname
    # update every = 10
    # buffer on failures = 10
    # timeout ms = 20000
    # send names instead of ids = yes
    # send charts matching = *
    # send hosts matching = localhost *
```

Next, edit and uncomment any other lines necessary to connect the exporting engine to your endpoint. If migrating from
backends, port your settings over and uncomment any lines you change. You must edit the `destination` setting in most
situations.

For details on all the configuration options, see the [exporting reference](/docs/agent/exporting#configuration).

Restart your Agent to begin exporting to the destination of your choice. Because the Agent exports metrics as they're
collected, you should start seeing data in your external database after only a few seconds.

## Exporting reference, guides, and related features

-   [Exporting reference guide](/docs/agent/exporting)
-   [Guide: Export and visualize Netdata metrics in Graphite](/guides/export/export-netdata-metrics-graphite)
-   [Guide: Use host labels to organize systems, metrics, and alarms](/guides/using-host-labels)
-   [Guide: Change how long Netdata stores metrics (long-term storage)](/guides/longer-metrics-storage)
-   [Backends (deprecated)](/docs/agent/backends)


