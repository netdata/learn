---
title: "Fail2ban monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/fail2ban/README.md
sidebar_label: "Fail2ban"
---



Monitors the fail2ban log file to show all bans for all active jails.

## Requirements

-   fail2ban.log file MUST BE readable by Netdata (A good idea is to add  **create 0640 root netdata** to fail2ban conf at logrotate.d)

It produces one chart with multiple lines (one line per jail)

## Configuration

Edit the `python.d/fail2ban.conf` configuration file using `edit-config` from the your agent's [config
directory](/guides/step-by-step/step-04#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/fail2ban.conf
```

Sample:

```yaml
local:
 log_path: '/var/log/fail2ban.log'
 conf_path: '/etc/fail2ban/jail.local'
 exclude: 'dropbear apache'
```

If no configuration is given, module will attempt to read log file at `/var/log/fail2ban.log` and conf file at `/etc/fail2ban/jail.local`.
If conf file is not found default jail is `ssh`.

---


