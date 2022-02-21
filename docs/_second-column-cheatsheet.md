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

Use the `edit-config` script to edit the `netdata.conf` file.

```
[web]
mode = none
```

#### Change the port Netdata listens to (port 39999)

```
[web]
default port = 39999
```

#### Opt out from anonymous statistics

```
sudo touch .opt-out-from-anonymous-statistics
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