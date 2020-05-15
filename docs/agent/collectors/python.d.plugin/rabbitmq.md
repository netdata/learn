---
title: "RabbitMQ monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/rabbitmq/README.md
sidebar_label: "RabbitMQ"
---



Collects message broker global and per virtual host metrics.


Following charts are drawn:

1.  **Queued Messages**

    -   ready
    -   unacknowledged

2.  **Message Rates**

    -   ack
    -   redelivered
    -   deliver
    -   publish

3.  **Global Counts**

    -   channels
    -   consumers
    -   connections
    -   queues
    -   exchanges

4.  **File Descriptors**

    -   used descriptors

5.  **Socket Descriptors**

    -   used descriptors

6.  **Erlang processes**

    -   used processes

7.  **Erlang run queue**

    -   Erlang run queue

8.  **Memory**

    -   free memory in megabytes

9.  **Disk Space**

    -   free disk space in gigabytes


Per Vhost charts:

1.  **Vhost Messages**

    -   ack
    -   confirm
    -   deliver
    -   get
    -   get_no_ack
    -   publish
    -   redeliver
    -   return_unroutable

## Configuration

Edit the `python.d/rabbitmq.conf` configuration file using `edit-config` from the your agent's [config
directory](agent/step-by-step/step-04.md#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/rabbitmq.conf
```

When no configuration file is found, module tries to connect to: `localhost:15672`.

```yaml
socket:
  name     : 'local'
  host     : '127.0.0.1'
  port     :  15672
  user     : 'guest'
  pass     : 'guest'
```

---


