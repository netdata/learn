## Install Netdata

#### Install Netdata

```
wget -O /tmp/netdata-kickstart.sh https://my-netdata.io/kickstart.sh && sh /tmp/netdata-kickstart.sh
```

Or, if you have cURL but not wget (such as on macOS):

```
curl https://my-netdata.io/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh
```

#### Claim a node to Netdata Cloud

```
wget -O /tmp/netdata-kickstart.sh https://my-netdata.io/kickstart.sh && sh /tmp/netdata-kickstart.sh --claim-token TOKEN --claim-rooms ROOM1,ROOM2 --claim-url https://app.netdata.cloud
```

> Sign in to Netdata Cloud, click the `Claim Nodes` button, choose the `War Rooms` to add nodes to, then click `Copy` to copy the full script to your clipboard. Paste that into your node’s terminal and run it.


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

> After any change, reload the Netdata health configuration

```
netdatacli reload-health
```

or if that command doesn't work on your installation, use:

```
killall -USR2 netdata
```