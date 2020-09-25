---
title: "Export metrics to JSON document databases"
sidebar_label: JSON
description: "Archive your Agent's metrics to a JSON document database for long-term storage, further analysis, or correlation with data from other sources."
custom_edit_url: https://github.com/netdata/netdata/edit/master/exporting/json/README.md
---



You can use the JSON connector for the [exporting engine](/docs/agent/exporting) to archive your agent's metrics to JSON
document databases for long-term storage, further analysis, or correlation with data from other sources.

## Configuration

To enable data exporting to a JSON document database, run `./edit-config exporting.conf` in the Netdata configuration
directory and set the following options:

```conf
[json:my_json_instance]
    enabled = yes
    destination = localhost:5448
```

The JSON connector is further configurable using additional settings. See the [exporting reference
doc](/docs/agent/exporting#options) for details.


