---
title: "Docker engine monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/dockerd/README.md
---



Collects docker container health metrics.

**Requirement:**

-   `docker` package, required version 3.2.0+

Following charts are drawn:

1.  **running containers**

    -   count

2.  **healthy containers**

    -   count

3.  **unhealthy containers**

    -   count

## Configuration

Edit the `python.d/dockerd.conf` configuration file using `edit-config` from the your agent's [config
directory](/docs/step-by-step/step-04.md#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different, if different
sudo ./edit-config python.d/dockerd.conf
```

```yaml
 update_every : 1
 priority     : 60000
```

---


