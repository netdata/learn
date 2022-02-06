## Manage the daemon

| Intent                      |                                                                Action |
|:----------------------------|----------------------------------------------------------------------:|
| Start Netdata               |                                      `$ sudo systemctl start netdata` |
| Stop Netdata                |                                       `$ sudo systemctl stop netdata` |
| Restart Netdata             |                                    `$ sudo systemctl restart netdata` |
| Reload health configuration | `$ sudo netdatacli reload-health` <br></br> `$ killall -USR2 netdata` |
| View error logs             |                                     `less /var/log/netdata/error.log` |

## See metrics and dashboards

#### Netdata Cloud `https://app.netdata.cloud`

#### Local dashboard `https://NODE:19999`

> Replace `NODE` with the IP address or hostname of your node. Often `localhost`.

#### Access the Netdata API `http://NODE:19999/api/v1/info`

## Metrics collection & retention

#### Increase metrics retention (4GiB)

```
sudo ./edit-config netdata.conf
```

```
[global]
 dbengine multihost disk space = 4096
```

#### Reduce the collection frequency (every 5 seconds)

```
sudo ./edit-config netdata.conf
```

```
[global]
 update every = 5
```

#### Enable/disable plugins (groups of collectors)

```
sudo ./edit-config netdata.conf
```

```
[plugins]
 go.d = yes # enabled
 node.d = no # disabled
```

#### Enable/disable specific collectors

```
sudo ./edit-config go.d.conf
```

> `Or python.d.conf, node.d.conf, edbpf.conf, and so on`.

```
modules:
 activemq: no # disabled
 bind: no # disabled
 cockroachdb: yes # enabled
 ```

#### Edit a collector s config (example)

```
$ sudo ./edit-config go.d/mysql.conf
$ sudo ./edit-config ebpf.conf
$ sudo ./edit-config python.d/anomalies.conf
```

## Alarms & notifications

#### Add a new alarm

```
sudo touch health.d/example-alarm.conf
sudo ./edit-config health.d/example-alarm.conf
```

#### Configure a specific alarm

```
sudo ./edit-config health.d/example-alarm.conf
```

#### Silence a specific alarm

```
sudo ./edit-config health.d/example-alarm.conf
 to: silent
```

#### Disable alarms and notifications

```
[health]
 enabled = no
```
