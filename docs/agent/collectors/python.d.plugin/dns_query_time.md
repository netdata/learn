---
title: "DNS query RTT monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/dns_query_time/README.md
sidebar_label: "DNS query RTT"
---



Measures DNS query round trip time.

**Requirement:**

-   `python-dnspython` package

It produces one aggregate chart or one chart per DNS server, showing the query time.

## Configuration

Edit the `python.d/dns_query_time.conf` configuration file using `edit-config` from the your agent's [config
directory](agent/step-by-step/step-04.md#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different, if different
sudo ./edit-config python.d/dns_query_time.conf
```

---


