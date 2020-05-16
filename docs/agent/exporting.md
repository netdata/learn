---
title: "Export metrics to external databases (experimental)"
description: "With the exporting engine, you can archive your Netdata metrics to multiple external databases for long-term storage or further analysis."
custom_edit_url: https://github.com/netdata/netdata/edit/master/exporting/README.md
---



The exporting engine is an update for the former [backends](/docs/agent/backends). It's still work in progress. It has a
modular structure and supports metric exporting via multiple exporting connector instances at the same time. You can
have different update intervals and filters configured for every exporting connector instance. The exporting engine has
its own configuration file `exporting.conf`. Configuration is almost similar to [backends](/docs/agent/backends#configuration).
The only difference is that the type of a connector should be specified in a section name before a colon and a name after
the colon. At the moment only four types of connectors are supported: `graphite`, `json`, `opentsdb`, `opentsdb:http`.

An example configuration:
```conf
[exporting:global]
enabled = yes

[graphite:my_instance1]
enabled = yes
destination = localhost:2003
data source = sum
update every = 5
send charts matching = system.load

[json:my_instance2]
enabled = yes
destination = localhost:5448
data source = as collected
update every = 2
send charts matching = system.active_processes

[opentsdb:my_instance3]
enabled = yes
destination = localhost:4242
data source = sum
update every = 10
send charts matching = system.cpu

[opentsdb:http:my_instance4]
enabled = yes
destination = localhost:4243
data source = average
update every = 3
send charts matching = system.active_processes

```


