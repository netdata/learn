# LiteSpeed monitoring with Netdata

Collects web server performance metrics for network, connection, requests, and cache.  

It produces:

1.  **Network Throughput HTTP** in kilobits/s

    -   in
    -   out

2.  **Network Throughput HTTPS** in kilobits/s

    -   in
    -   out

3.  **Connections HTTP** in connections

    -   free
    -   used

4.  **Connections HTTPS** in connections

    -   free
    -   used

5.  **Requests** in requests/s

    -   requests

6.  **Requests In Processing** in requests

    -   processing

7.  **Public Cache Hits** in hits/s

    -   hits

8.  **Private Cache Hits** in hits/s

    -   hits

9.  **Static Hits** in hits/s

    -   hits

## Configuration

Edit the `python.d/litespeed.conf` configuration file using `edit-config` from the your agent's [config
directory](../../../docs/step-by-step/step-04.md#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/litespeed.conf
```

```yaml
local:
  path  : 'PATH'
```

If no configuration is given, module will use "/tmp/lshttpd/".

---

