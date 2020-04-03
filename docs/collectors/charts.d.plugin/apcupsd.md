---
title: "APC UPS monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/charts.d.plugin/apcupsd/README.md
---



Monitors different APC UPS models and retrieves status information using `apcaccess` tool.

## Configuration

Edit the `charts.d/apcupsd.conf` configuration file using `edit-config` from the your agent's [config
directory](/docs/step-by-step/step-04#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config charts.d/apcupsd.conf
```


