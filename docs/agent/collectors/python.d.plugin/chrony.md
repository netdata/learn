---
title: "Chrony monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/chrony/README.md
---



Monitors the precision and statistics of a local chronyd server, and produces:

-   frequency
-   last offset
-   RMS offset
-   residual freq
-   root delay
-   root dispersion
-   skew
-   system time

## Requirements
Verify that user Netdata can execute `chronyc tracking`. If necessary, update `/etc/chrony.conf`, `cmdallow`.

## Configuration

Edit the `python.d/chrony.conf` configuration file using `edit-config` from the your agent's [config
directory](/docs/step-by-step/step-04#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different, if different
sudo ./edit-config python.d/chrony.conf
```

Sample:

```yaml
# data collection frequency:
update_every: 1

# chrony query command:
local:
  command: 'chronyc -n tracking'
```

---


