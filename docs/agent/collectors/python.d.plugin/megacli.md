---
title: "MegaRAID controller monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/megacli/README.md
sidebar_label: "MegaRAID controllers"
---



Collects adapter, physical drives and battery stats.

## Requirements

Uses the `megacli` program, which can only be executed by root.  It uses
`sudo` and assumes that it is configured such that the `netdata` user can
execute `megacli` as root without password.

Add to `sudoers`:

```
netdata ALL=(root)       NOPASSWD: /path/to/megacli
```


To grab stats it executes:

-   `sudo -n megacli -LDPDInfo -aAll`
-   `sudo -n megacli -AdpBbuCmd -a0`

It produces:

1.  **Adapter State**

2.  **Physical Drives Media Errors**

3.  **Physical Drives Predictive Failures**

4.  **Battery Relative State of Charge**

5.  **Battery Cycle Count**



## Configuration

**megacli** is disabled by default. Should be explicitly enabled in `python.d.conf`.

```yaml
megacli: yes
```

Edit the `python.d/megacli.conf` configuration file using `edit-config` from the your agent's [config
directory](agent/step-by-step/step-04.md#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/megacli.conf
```

Battery stats disabled by default. To enable them, modify `megacli.conf`.

```yaml
do_battery: yes
```

---


