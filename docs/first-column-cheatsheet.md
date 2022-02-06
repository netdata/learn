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

## Configuration

#### The Netdata config directory: `/etc/netdata`

> View the running Netdata configuration if your config directory is not here. The cheatsheet assumes you’re running all commands from within the Netdata config directory!

#### Edit Netdata's main config file `$ sudo ./edit-config netdata.conf`

#### Edit Netdata's other config files (examples):

- `$ sudo ./edit-config apps_groups.conf`
- `$ sudo ./edit-config ebpf.conf`
- `$ sudo ./edit-config health.d/load.conf`
- `$ sudo ./edit-config go.d/prometheus.conf`

#### View the running Netdata configuration `http://NODE:19999/netdata.conf`

> Replace `NODE` with the IP address or hostname of your node. Often `localhost`.

## Interact with charts

| Intent                                 |                                                                                                                                                                                                                                                                            Action |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| Stop a chart from updating             |                                                                                                                                                                                                                                                                           `click` |                                    
| Zoom                                   | **Cloud** <br/> use the `zoom in` and `zoom out` buttons on any chart (upper right corner)  <br/><br/> **Agent**<br/>`SHIFT` or `ALT` + `mouse scrollwheel` <br/> `SHIFT` or `ALT` + `two-finger pinch` (touchscreen)  <br/> `SHIFT` or `ALT` + `two-finger scroll` (touchscreen) |                   
| Zoom to a specific timeframe           |                                                                                                                                **Cloud**<br/>use the `select and zoom` button on any chart and then do a `mouse selection`  <br/><br/>  **Agent**<br/>`SHIFT` + `mouse selection` |                
| Pan forward or back in time            |                                                                                                                                                                                                                    `click` & `drag` <br/> `touch` & `drag` (touchpad/touchscreen) |             
| Select a certain timeframe             |                                                                                                                                                                                 `ALT` + `mouse selection` <br/> WIP need to evaluate this `command?`  + `mouse selection` (macOS) | 
| Reset to default auto refreshing state |                                                                                                                                                                                                                                                                    `double click` |    

## Dashboards

#### Disable the local dashboard

```
[web]
mode = none
```

#### Opt out from anonymous statistics

```
sudo touch .opt-out-from-anonymous-statistics
```

#### Change the port Netdata listens to (port 39999)

```
[web]
default port = 39999
```

## Understanding the dashboard

**Charts**: A visualization displaying one or more collected/calculated metrics in a time series. Charts are generated
by collectors.

**Dimensions**: Any value shown on a chart, which can be raw or calculated values, such as percentages, averages,
minimums, maximums, and more.

**Families**: One instance of a monitored hardware or software resource that needs to be monitored and displayed
separately from similar instances. Example, disks named
**sda**, **sdb**, **sdc**, and so on.

**Contexts**: A grouping of charts based on the types of metrics collected and visualized.
**disk.io**, **disk.ops**, and **disk.backlog** are all contexts.

