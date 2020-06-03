---
title: "IPFS monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/ipfs/README.md
sidebar_label: "IPFS"
---



Collects [IPFS](https://ipfs.io) basic information like file system bandwidth, peers and repo metrics. 

1.  **Bandwidth** in kbits/s

    -   in
    -   out

2.  **Peers**

    -   peers

## Configuration

Edit the `python.d/ipfs.conf` configuration file using `edit-config` from the your agent's [config
directory](/guides/step-by-step/step-04#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/ipfs.conf
```

Only url to IPFS server is needed.

Sample:

```yaml
localhost:
  name : 'local'
  url  : 'http://localhost:5001'
```

---


