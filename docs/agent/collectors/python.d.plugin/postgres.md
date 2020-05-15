---
title: "PostgreSQL monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/postgres/README.md
sidebar_label: "PostgreSQL"
---



Collects database health and performance metrics.

## Requirements

-   `python-psycopg2` package. You have to install it manually.

Following charts are drawn:

1.  **Database size** MB

    -   size

2.  **Current Backend Processes** processes

    -   active

3.  **Current Backend Processe Usage** percentage

    -   used
    -   available

4.  **Write-Ahead Logging Statistics** files/s

    -   total
    -   ready
    -   done

5.  **Checkpoints** writes/s

    -   scheduled
    -   requested

6.  **Current connections to db** count

    -   connections

7.  **Tuples returned from db** tuples/s

    -   sequential
    -   bitmap

8.  **Tuple reads from db** reads/s

    -   disk
    -   cache

9.  **Transactions on db** transactions/s

    -   committed
    -   rolled back

10.  **Tuples written to db** writes/s

    -   inserted
    -   updated
    -   deleted
    -   conflicts

11. **Locks on db** count per type

    -   locks

## Configuration

Edit the `python.d/postgres.conf` configuration file using `edit-config` from the your agent's [config
directory](agent/step-by-step/step-04.md#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/postgres.conf
```

When no configuration file is found, the module tries to connect to TCP/IP socket: `localhost:5432`.

```yaml
socket:
  name         : 'socket'
  user         : 'postgres'
  database     : 'postgres'

tcp:
  name         : 'tcp'
  user         : 'postgres'
  database     : 'postgres'
  host         : 'localhost'
  port         : 5432
```

---


