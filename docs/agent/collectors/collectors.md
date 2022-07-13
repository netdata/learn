---
title: "Supported collectors list"
description: "Netdata gathers real-time metrics from hundreds of data sources using collectors. Most require zero configuration and are pre-configured out of the box."
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/COLLECTORS.md
---



Netdata uses collectors to help you gather metrics from your favorite applications and services and view them in
real-time, interactive charts. The following list includes collectors for both external services/applications and
internal system metrics.

Learn more about [how collectors work](/docs/collect/how-collectors-work), and then learn how to [enable or
configure](/docs/collect/enable-configure) any of the below collectors using the same process.

Some collectors have both Go and Python versions as we continue our effort to migrate all collectors to Go. In these
cases, _Netdata always prioritizes the Go version_, and we highly recommend you use the Go versions for the best
experience.

If you want to use a Python version of a collector, you need to explicitly [disable the Go
version](/docs/collect/enable-configure), and enable the Python version. Netdata then skips the Go version and
attempts to load the Python version and its accompanying configuration file.

If you don't see the app/service you'd like to monitor in this list:

- Check out our [GitHub issues](https://github.com/netdata/netdata/issues). Use the search bar to look for previous
  discussions about that collector—we may be looking for assistance from users such as yourself!
- If you don't see the collector there, you can make
  a [feature request](https://github.com/netdata/netdata/issues/new/choose) on GitHub.
- If you have basic software development skills, you can add your own plugin
  in [Go](/docs/agent/collectors/go.d.plugin#how-to-develop-a-collector)
  or [Python](/guides/python-collector)

Supported Collectors List:

- [Service and application collectors](#service-and-application-collectors)
    - [Generic](#generic)
    - [APM (application performance monitoring)](#apm-application-performance-monitoring)
    - [Containers and VMs](#containers-and-vms)
    - [Data stores](#data-stores)
    - [Distributed computing](#distributed-computing)
    - [Email](#email)
    - [Kubernetes](#kubernetes)
    - [Logs](#logs)
    - [Messaging](#messaging)
    - [Network](#network)
    - [Provisioning](#provisioning)
    - [Remote devices](#remote-devices)
    - [Search](#search)
    - [Storage](#storage)
    - [Web](#web)
- [System collectors](#system-collectors)
    - [Applications](#applications)
    - [Disks and filesystems](#disks-and-filesystems)
    - [eBPF](#ebpf)
    - [Hardware](#hardware)
    - [Memory](#memory)
    - [Networks](#networks)
    - [Operating systems](#operating-systems)
    - [Processes](#processes)
    - [Resources](#resources)
    - [Users](#users)
- [Netdata collectors](#netdata-collectors)
- [Orchestrators](#orchestrators)
- [Third-party collectors](#third-party-collectors)
- [Etc](#etc)

## Service and application collectors

The Netdata Agent auto-detects and collects metrics from all of the services and applications below. You can also
configure any of these collectors according to your setup and infrastructure.

### Generic

- [Prometheus endpoints](/docs/agent/collectors/go.d.plugin/modules/prometheus): Gathers
  metrics from any number of Prometheus endpoints, with support to autodetect more than 600 services and applications.

### APM (application performance monitoring)

- [Go applications](/docs/agent/collectors/python.d.plugin/go_expvar): Monitor any Go application that exposes its
  metrics with the  `expvar` package from the Go standard library.
- [Java Spring Boot 2
  applications](/docs/agent/collectors/go.d.plugin/modules/springboot2/) (Go version):
  Monitor running Java Spring Boot 2 applications that expose their metrics with the use of the Spring Boot Actuator.
- [Java Spring Boot 2 applications](/docs/agent/collectors/python.d.plugin/springboot) (Python version): Monitor
  running Java Spring Boot applications that expose their metrics with the use of the Spring Boot Actuator.
- [statsd](/docs/agent/collectors/statsd.plugin): Implement a high performance `statsd` server for Netdata.
- [phpDaemon](/docs/agent/collectors/go.d.plugin/modules/phpdaemon/): Collect worker
  statistics (total, active, idle), and uptime for web and network applications.
- [uWSGI](/docs/agent/collectors/python.d.plugin/uwsgi): Monitor performance metrics exposed by the uWSGI Stats
  Server.

### Containers and VMs

- [Docker containers](/docs/agent/collectors/cgroups.plugin): Monitor the health and performance of individual Docker
  containers using the cgroups collector plugin.
- [DockerD](/docs/agent/collectors/python.d.plugin/dockerd): Collect container health statistics.
- [Docker Engine](/docs/agent/collectors/go.d.plugin/modules/docker_engine/): Collect
  runtime statistics from the `docker` daemon using the `metrics-address` feature.
- [Docker Hub](/docs/agent/collectors/go.d.plugin/modules/dockerhub/): Collect statistics
  about Docker repositories, such as pulls, starts, status, time since last update, and more.
- [Libvirt](/docs/agent/collectors/cgroups.plugin): Monitor the health and performance of individual Libvirt containers
  using the cgroups collector plugin.
- [LXC](/docs/agent/collectors/cgroups.plugin): Monitor the health and performance of individual LXC containers using
  the cgroups collector plugin.
- [LXD](/docs/agent/collectors/cgroups.plugin): Monitor the health and performance of individual LXD containers using
  the cgroups collector plugin.
- [systemd-nspawn](/docs/agent/collectors/cgroups.plugin): Monitor the health and performance of individual
  systemd-nspawn containers using the cgroups collector plugin.
- [vCenter Server Appliance](/docs/agent/collectors/go.d.plugin/modules/vcsa/): Monitor
  appliance system, components, and software update health statuses via the Health API.
- [vSphere](/docs/agent/collectors/go.d.plugin/modules/vsphere/): Collect host and virtual
  machine performance metrics.
- [Xen/XCP-ng](/docs/agent/collectors/xenstat.plugin): Collect XenServer and XCP-ng metrics using `libxenstat`.

### Data stores

- [CockroachDB](/docs/agent/collectors/go.d.plugin/modules/cockroachdb/): Monitor various
  database components using `_status/vars` endpoint.
- [Consul](/docs/agent/collectors/go.d.plugin/modules/consul/): Capture service and unbound
  checks status (passing, warning, critical, maintenance).
- [Couchbase](/docs/agent/collectors/go.d.plugin/modules/couchbase/): Gather per-bucket
  metrics from any number of instances of the distributed JSON document database.
- [CouchDB](/docs/agent/collectors/go.d.plugin/modules/couchdb): Monitor database health and
  performance metrics
  (reads/writes, HTTP traffic, replication status, etc).
- [MongoDB](/docs/agent/collectors/python.d.plugin/mongodb): Collect memory-caching system performance metrics and
  reads the server's response to `stats` command (stats interface).
- [MySQL](/docs/agent/collectors/go.d.plugin/modules/mysql/): Collect database global,
  replication and per user statistics.
- [OracleDB](/docs/agent/collectors/python.d.plugin/oracledb): Monitor database performance and health metrics.
- [Pika](/docs/agent/collectors/go.d.plugin/modules/pika/): Gather metric, such as clients,
  memory usage, queries, and more from the Redis interface-compatible database.
- [Postgres](/docs/agent/collectors/python.d.plugin/postgres): Collect database health and performance metrics.
- [ProxySQL](/docs/agent/collectors/python.d.plugin/proxysql): Monitor database backend and frontend performance
  metrics.
- [Redis](/docs/agent/collectors/go.d.plugin/modules/redis/): Monitor status from any
  number of database instances by reading the server's response to the `INFO ALL` command.
- [RethinkDB](/docs/agent/collectors/python.d.plugin/rethinkdbs): Collect database server and cluster statistics.
- [Riak KV](/docs/agent/collectors/python.d.plugin/riakkv): Collect database stats from the `/stats` endpoint.
- [Zookeeper](/docs/agent/collectors/go.d.plugin/modules/zookeeper/): Monitor application
  health metrics reading the server's response to the `mntr` command.
- [Memcached](/docs/agent/collectors/python.d.plugin/memcached): Collect memory-caching system performance metrics.

### Distributed computing

- [BOINC](/docs/agent/collectors/python.d.plugin/boinc): Monitor the total number of tasks, open tasks, and task
  states for the distributed computing client.
- [Gearman](/docs/agent/collectors/python.d.plugin/gearman): Collect application summary (queued, running) and per-job
  worker statistics (queued, idle, running).

### Email

- [Dovecot](/docs/agent/collectors/python.d.plugin/dovecot): Collect email server performance metrics by reading the
  server's response to the `EXPORT global` command.
- [EXIM](/docs/agent/collectors/python.d.plugin/exim): Uses the `exim` tool to monitor the queue length of a
  mail/message transfer agent (MTA).
- [Postfix](/docs/agent/collectors/python.d.plugin/postfix): Uses the `postqueue` tool to monitor the queue length of a
  mail/message transfer agent (MTA).

### Kubernetes

- [Kubelet](/docs/agent/collectors/go.d.plugin/modules/k8s_kubelet/): Monitor one or more
  instances of the Kubelet agent and collects metrics on number of pods/containers running, volume of Docker
  operations, and more.
- [kube-proxy](/docs/agent/collectors/go.d.plugin/modules/k8s_kubeproxy/): Collect
  metrics, such as syncing proxy rules and REST client requests, from one or more instances of `kube-proxy`.
- [Service discovery](https://github.com/netdata/agent-service-discovery/): Find what services are running on a
  cluster's pods, converts that into configuration files, and exports them so they can be monitored by Netdata.

### Logs

- [Fluentd](/docs/agent/collectors/go.d.plugin/modules/fluentd/): Gather application
  plugins metrics from an endpoint provided by `in_monitor plugin`.
- [Logstash](/docs/agent/collectors/go.d.plugin/modules/logstash/): Monitor JVM threads,
  memory usage, garbage collection statistics, and more.
- [OpenVPN status logs](/docs/agent/collectors/go.d.plugin/modules/openvpn_status_log): Parse
  server log files and provide summary (client, traffic) metrics.
- [Squid web server logs](/docs/agent/collectors/go.d.plugin/modules/squidlog/): Tail Squid
  access logs to return the volume of requests, types of requests, bandwidth, and much more.
- [Web server logs (Go version for Apache,
  NGINX)](/docs/agent/collectors/go.d.plugin/modules/weblog/): Tail access logs and provide
  very detailed web server performance statistics. This module is able to parse 200k+ rows in less than half a second.
- [Web server logs (Apache, NGINX)](/docs/agent/collectors/go.d.plugin/modules/weblog): Tail
  access log
  file and collect web server/caching proxy metrics.

### Messaging

- [ActiveMQ](/docs/agent/collectors/go.d.plugin/modules/activemq/): Collect message broker
  queues and topics statistics using the ActiveMQ Console API.
- [Beanstalk](/docs/agent/collectors/python.d.plugin/beanstalk): Collect server and tube-level statistics, such as CPU
  usage, jobs rates, commands, and more.
- [Pulsar](/docs/agent/collectors/go.d.plugin/modules/pulsar/): Collect summary,
  namespaces, and topics performance statistics.
- [RabbitMQ (Go)](/docs/agent/collectors/go.d.plugin/modules/rabbitmq/): Collect message
  broker overview, system and per virtual host metrics.
- [RabbitMQ (Python)](/docs/agent/collectors/python.d.plugin/rabbitmq): Collect message broker global and per virtual
  host metrics.
- [VerneMQ](/docs/agent/collectors/go.d.plugin/modules/vernemq/): Monitor MQTT broker
  health and performance metrics. It collects all available info for both MQTTv3 and v5 communication

### Network

- [Bind 9](/docs/agent/collectors/go.d.plugin/modules/bind/): Collect nameserver summary
  performance statistics via a web interface (`statistics-channels` feature).
- [Chrony](/docs/agent/collectors/go.d.plugin/modules/chrony): Monitor the precision and
  statistics of a local `chronyd` server.
- [CoreDNS](/docs/agent/collectors/go.d.plugin/modules/coredns/): Measure DNS query round
  trip time.
- [Dnsmasq](/docs/agent/collectors/go.d.plugin/modules/dnsmasq_dhcp/): Automatically
  detects all configured `Dnsmasq` DHCP ranges and Monitor their utilization.
- [DNSdist](/docs/agent/collectors/go.d.plugin/modules/dnsdist/): Collect
  load-balancer performance and health metrics.
- [Dnsmasq DNS Forwarder](/docs/agent/collectors/go.d.plugin/modules/dnsmasq/): Gather
  queries, entries, operations, and events for the lightweight DNS forwarder.
- [DNS Query Time](/docs/agent/collectors/go.d.plugin/modules/dnsquery/): Monitor the round
  trip time for DNS queries in milliseconds.
- [Freeradius](/docs/agent/collectors/go.d.plugin/modules/freeradius/): Collect
  server authentication and accounting statistics from the `status server`.
- [Libreswan](/docs/agent/collectors/charts.d.plugin/libreswan): Collect bytes-in, bytes-out, and uptime metrics.
- [Icecast](/docs/agent/collectors/python.d.plugin/icecast): Monitor the number of listeners for active sources.
- [ISC Bind (RDNC)](/docs/agent/collectors/python.d.plugin/bind_rndc): Collect nameserver summary performance
  statistics using the `rndc` tool.
- [ISC DHCP](/docs/agent/collectors/go.d.plugin/modules/isc_dhcpd): Reads a
  `dhcpd.leases` file and collects metrics on total active leases, pool active leases, and pool utilization.
- [OpenLDAP](/docs/agent/collectors/python.d.plugin/openldap): Provides statistics information from the OpenLDAP
  (`slapd`) server.
- [NSD](/docs/agent/collectors/python.d.plugin/nsd): Monitor nameserver performance metrics using the `nsd-control`
  tool.
- [NTP daemon](/docs/agent/collectors/python.d.plugin/ntpd): Monitor the system variables of the local `ntpd` daemon
  (optionally including variables of the polled peers) using the NTP Control Message Protocol via a UDP socket.
- [OpenSIPS](/docs/agent/collectors/charts.d.plugin/opensips): Collect server health and performance metrics using the
  `opensipsctl` tool.
- [OpenVPN](/docs/agent/collectors/go.d.plugin/modules/openvpn/): Gather server summary
  (client, traffic) and per user metrics (traffic, connection time) stats using `management-interface`.
- [Pi-hole](/docs/agent/collectors/go.d.plugin/modules/pihole/): Monitor basic (DNS
  queries, clients, blocklist) and extended (top clients, top permitted, and blocked domains) statistics using the PHP
  API.
- [PowerDNS Authoritative Server](/docs/agent/collectors/go.d.plugin/modules/powerdns):
  Monitor one or more instances of the nameserver software to collect questions, events, and latency metrics.
- [PowerDNS Recursor](/docs/agent/collectors/go.d.plugin/modules/powerdns_recursor):
  Gather incoming/outgoing questions, drops, timeouts, and cache usage from any number of DNS recursor instances.
- [RetroShare](/docs/agent/collectors/python.d.plugin/retroshare): Monitor application bandwidth, peers, and DHT
  metrics.
- [Tor](/docs/agent/collectors/python.d.plugin/tor): Capture traffic usage statistics using the Tor control port.
- [Unbound](/docs/agent/collectors/go.d.plugin/modules/unbound/): Collect DNS resolver
  summary and extended system and per thread metrics via the `remote-control` interface.

### Provisioning

- [Puppet](/docs/agent/collectors/python.d.plugin/puppet): Monitor the status of Puppet Server and Puppet DB.

### Remote devices

- [AM2320](/docs/agent/collectors/python.d.plugin/am2320): Monitor sensor temperature and humidity.
- [Access point](/docs/agent/collectors/charts.d.plugin/ap): Monitor client, traffic and signal metrics using the `aw`
  tool.
- [APC UPS](/docs/agent/collectors/charts.d.plugin/apcupsd): Capture status information using the `apcaccess` tool.
- [Energi Core](/docs/agent/collectors/go.d.plugin/modules/energid): Monitor
  blockchain indexes, memory usage, network usage, and transactions of wallet instances.
- [UPS/PDU](/docs/agent/collectors/charts.d.plugin/nut): Read the status of UPS/PDU devices using the `upsc` tool.
- [SNMP devices](/docs/agent/collectors/go.d.plugin/modules/snmp): Gather data using the SNMP
  protocol.
- [1-Wire sensors](/docs/agent/collectors/python.d.plugin/w1sensor): Monitor sensor temperature.

### Search

- [Elasticsearch](/docs/agent/collectors/go.d.plugin/modules/elasticsearch): Collect
  dozens of metrics on search engine performance from local nodes and local indices. Includes cluster health and
  statistics.
- [Solr](/docs/agent/collectors/go.d.plugin/modules/solr/): Collect application search
  requests, search errors, update requests, and update errors statistics.

### Storage

- [Ceph](/docs/agent/collectors/python.d.plugin/ceph): Monitor the Ceph cluster usage and server data consumption.
- [HDFS](/docs/agent/collectors/go.d.plugin/modules/hdfs/): Monitor health and performance
  metrics for filesystem datanodes and namenodes.
- [IPFS](/docs/agent/collectors/python.d.plugin/ipfs): Collect file system bandwidth, peers, and repo metrics.
- [Scaleio](/docs/agent/collectors/go.d.plugin/modules/scaleio/): Monitor storage system,
  storage pools, and SDCS health and performance metrics via VxFlex OS Gateway API.
- [Samba](/docs/agent/collectors/python.d.plugin/samba): Collect file sharing metrics using the `smbstatus` tool.

### Web

- [Apache](/docs/agent/collectors/go.d.plugin/modules/apache/): Collect Apache web
  server performance metrics via the `server-status?auto` endpoint.
- [HAProxy](/docs/agent/collectors/python.d.plugin/haproxy): Collect frontend, backend, and health metrics.
- [HTTP endpoints](/docs/agent/collectors/go.d.plugin/modules/httpcheck/): Monitor
  any HTTP endpoint's availability and response time.
- [Lighttpd](/docs/agent/collectors/go.d.plugin/modules/lighttpd/): Collect web server
  performance metrics using the `server-status?auto` endpoint.
- [Lighttpd2](/docs/agent/collectors/go.d.plugin/modules/lighttpd2/): Collect web server
  performance metrics using the `server-status?format=plain` endpoint.
- [Litespeed](/docs/agent/collectors/python.d.plugin/litespeed): Collect web server data (network, connection,
  requests, cache) by reading `.rtreport*` files.
- [Nginx](/docs/agent/collectors/go.d.plugin/modules/nginx/): Monitor web server
  status information by gathering metrics via `ngx_http_stub_status_module`.
- [Nginx VTS](/docs/agent/collectors/go.d.plugin/modules/nginxvts/): Gathers metrics from
  any Nginx deployment with the _virtual host traffic status module_ enabled, including metrics on uptime, memory
  usage, and cache, and more.
- [PHP-FPM](/docs/agent/collectors/go.d.plugin/modules/phpfpm/): Collect application
  summary and processes health metrics by scraping the status page (`/status?full`).
- [TCP endpoints](/docs/agent/collectors/go.d.plugin/modules/portcheck/): Monitor any
  TCP endpoint's availability and response time.
- [Spigot Minecraft servers](/docs/agent/collectors/python.d.plugin/spigotmc): Monitor average ticket rate and number
  of users.
- [Squid](/docs/agent/collectors/python.d.plugin/squid): Monitor client and server bandwidth/requests by gathering
  data from the Cache Manager component.
- [Tengine](/docs/agent/collectors/go.d.plugin/modules/tengine/): Monitor web server
  statistics using information provided by `ngx_http_reqstat_module`.
- [Tomcat](/docs/agent/collectors/python.d.plugin/tomcat): Collect web server performance metrics from the Manager App
  (`/manager/status?XML=true`).
- [Traefik](/docs/agent/collectors/python.d.plugin/traefik): Uses Traefik's Health API to provide statistics.
- [Varnish](/docs/agent/collectors/python.d.plugin/varnish): Provides HTTP accelerator global, backends (VBE), and
  disks (SMF) statistics using the `varnishstat` tool.
- [x509 check](/docs/agent/collectors/go.d.plugin/modules/x509check/): Monitor certificate
  expiration time.
- [Whois domain expiry](/docs/agent/collectors/go.d.plugin/modules/whoisquery/): Checks the
  remaining time until a given domain is expired.

## System collectors

The Netdata Agent can collect these system- and hardware-level metrics using a variety of collectors, some of which
(such as `proc.plugin`) collect multiple types of metrics simultaneously.

### Applications

- [Fail2ban](/docs/agent/collectors/python.d.plugin/fail2ban): Parses configuration files to detect all jails, then
  uses log files to report ban rates and volume of banned IPs.
- [Monit](/docs/agent/collectors/python.d.plugin/monit): Monitor statuses of targets (service-checks) using the XML
  stats interface.
- [WMI (Windows Management Instrumentation)
  exporter](/docs/agent/collectors/go.d.plugin/modules/wmi/): Collect CPU, memory,
  network, disk, OS, system, and log-in metrics scraping `wmi_exporter`.

### Disks and filesystems

- [BCACHE](/docs/agent/collectors/proc.plugin): Monitor BCACHE statistics with the the `proc.plugin` collector.
- [Block devices](/docs/agent/collectors/proc.plugin): Gather metrics about the health and performance of block
  devices using the the `proc.plugin` collector.
- [Btrfs](/docs/agent/collectors/proc.plugin): Monitors Btrfs filesystems with the the `proc.plugin` collector.
- [Device mapper](/docs/agent/collectors/proc.plugin): Gather metrics about the Linux device mapper with the proc
  collector.
- [Disk space](/docs/agent/collectors/diskspace.plugin): Collect disk space usage metrics on Linux mount points.
- [Clock synchronization](/docs/agent/collectors/timex.plugin): Collect the system clock synchronization status on Linux.
- [Files and directories](/docs/agent/collectors/go.d.plugin/modules/filecheck): Gather
  metrics about the existence, modification time, and size of files or directories.
- [ioping.plugin](/docs/agent/collectors/ioping.plugin): Measure disk read/write latency.
- [NFS file servers and clients](/docs/agent/collectors/proc.plugin): Gather operations, utilization, and space usage
  using the the `proc.plugin` collector.
- [RAID arrays](/docs/agent/collectors/proc.plugin): Collect health, disk status, operation status, and more with the
  the `proc.plugin` collector.
- [Veritas Volume Manager](/docs/agent/collectors/proc.plugin): Gather metrics about the Veritas Volume Manager (VVM).
- [ZFS](/docs/agent/collectors/proc.plugin): Monitor bandwidth and utilization of ZFS disks/partitions using the proc
  collector.

### eBPF

- [Files](/docs/agent/collectors/ebpf.plugin): Provides information about how often a system calls kernel
  functions related to file descriptors using the eBPF collector.
- [Virtual file system (VFS)](/docs/agent/collectors/ebpf.plugin): Monitor IO, errors, deleted objects, and
  more for kernel virtual file systems (VFS) using the eBPF collector.
- [Processes](/docs/agent/collectors/ebpf.plugin): Monitor threads, task exits, and errors using the eBPF collector.

### Hardware

- [Adaptec RAID](/docs/agent/collectors/python.d.plugin/adaptec_raid): Monitor logical and physical devices health
  metrics using the `arcconf` tool.
- [CUPS](/docs/agent/collectors/cups.plugin): Monitor CUPS.
- [FreeIPMI](/docs/agent/collectors/freeipmi.plugin): Uses `libipmimonitoring-dev` or `libipmimonitoring-devel` to
  monitor the number of sensors, temperatures, voltages, currents, and more.
- [Hard drive temperature](/docs/agent/collectors/python.d.plugin/hddtemp): Monitor the temperature of storage
  devices.
- [HP Smart Storage Arrays](/docs/agent/collectors/python.d.plugin/hpssa): Monitor controller, cache module, logical
  and physical drive state, and temperature using the `ssacli` tool.
- [MegaRAID controllers](/docs/agent/collectors/python.d.plugin/megacli): Collect adapter, physical drives, and
  battery stats using the `megacli` tool.
- [NVIDIA GPU](/docs/agent/collectors/python.d.plugin/nvidia_smi): Monitor performance metrics (memory usage, fan
  speed, pcie bandwidth utilization, temperature, and more) using the `nvidia-smi` tool.
- [Sensors](/docs/agent/collectors/python.d.plugin/sensors): Reads system sensors information (temperature, voltage,
  electric current, power, and more) from `/sys/devices/`.
- [S.M.A.R.T](/docs/agent/collectors/python.d.plugin/smartd_log): Reads SMART Disk Monitoring daemon logs.

### Memory

- [Available memory](/docs/agent/collectors/proc.plugin): Tracks changes in available RAM using the the `proc.plugin`
  collector.
- [Committed memory](/docs/agent/collectors/proc.plugin): Monitor committed memory using the `proc.plugin` collector.
- [Huge pages](/docs/agent/collectors/proc.plugin): Gather metrics about huge pages in Linux and FreeBSD with the
  `proc.plugin` collector.
- [KSM](/docs/agent/collectors/proc.plugin): Measure the amount of merging, savings, and effectiveness using the
  `proc.plugin` collector.
- [Numa](/docs/agent/collectors/proc.plugin): Gather metrics on the number of non-uniform memory access (NUMA) events
  every second using the `proc.plugin` collector.
- [Page faults](/docs/agent/collectors/proc.plugin): Collect the number of memory page faults per second using the
  `proc.plugin` collector.
- [RAM](/docs/agent/collectors/proc.plugin): Collect metrics on system RAM, available RAM, and more using the
  `proc.plugin` collector.
- [SLAB](/docs/agent/collectors/slabinfo.plugin): Collect kernel SLAB details on Linux systems.
- [swap](/docs/agent/collectors/proc.plugin): Monitor the amount of free and used swap at every second using the
  `proc.plugin` collector.
- [Writeback memory](/docs/agent/collectors/proc.plugin): Collect how much memory is actively being written to disk at
  every second using the `proc.plugin` collector.

### Networks

- [Access points](/docs/agent/collectors/charts.d.plugin/ap): Visualizes data related to access points.
- [fping.plugin](/docs/agent/collectors/fping.plugin): Measure network latency, jitter and packet loss between the monitored node
  and any number of remote network end points.
- [Netfilter](/docs/agent/collectors/nfacct.plugin): Collect netfilter firewall, connection tracker, and accounting
  metrics using `libmnl` and `libnetfilter_acct`.
- [Network stack](/docs/agent/collectors/proc.plugin): Monitor the networking stack for errors, TCP connection aborts,
  bandwidth, and more.
- [Network QoS](/docs/agent/collectors/tc.plugin): Collect traffic QoS metrics (`tc`) of Linux network interfaces.
- [SYNPROXY](/docs/agent/collectors/proc.plugin): Monitor entries uses, SYN packets received, TCP cookies, and more.

### Operating systems

- [freebsd.plugin](/docs/agent/collectors/freebsd.plugin): Collect resource usage and performance data on FreeBSD systems.
- [macOS](/docs/agent/collectors/macos.plugin): Collect resource usage and performance data on macOS systems.

### Processes

- [Applications](/docs/agent/collectors/apps.plugin): Gather CPU, disk, memory, network, eBPF, and other metrics per
  application using the `apps.plugin` collector.
- [systemd](/docs/agent/collectors/cgroups.plugin): Monitor the CPU and memory usage of systemd services using the
  `cgroups.plugin` collector.
- [systemd unit states](/docs/agent/collectors/go.d.plugin/modules/systemdunits): See the
  state (active, inactive, activating, deactivating, failed) of various systemd unit types.
- [System processes](/docs/agent/collectors/proc.plugin): Collect metrics on system load and total processes running
  using `/proc/loadavg` and the `proc.plugin` collector.
- [Uptime](/docs/agent/collectors/proc.plugin): Monitor the uptime of a system using the `proc.plugin` collector.

### Resources

- [CPU frequency](/docs/agent/collectors/proc.plugin): Monitor CPU frequency, as set by the `cpufreq` kernel module,
  using the `proc.plugin` collector.
- [CPU idle](/docs/agent/collectors/proc.plugin): Measure CPU idle every second using the `proc.plugin` collector.
- [CPU performance](/docs/agent/collectors/perf.plugin): Collect CPU performance metrics using performance monitoring
  units (PMU).
- [CPU throttling](/docs/agent/collectors/proc.plugin): Gather metrics about thermal throttling using the `/proc/stat`
  module and the `proc.plugin` collector.
- [CPU utilization](/docs/agent/collectors/proc.plugin): Capture CPU utilization, both system-wide and per-core, using
  the `/proc/stat` module and the `proc.plugin` collector.
- [Entropy](/docs/agent/collectors/proc.plugin): Monitor the available entropy on a system using the `proc.plugin`
  collector.
- [Interprocess Communication (IPC)](/docs/agent/collectors/proc.plugin): Monitor IPC semaphores and shared memory
  using the `proc.plugin` collector.
- [Interrupts](/docs/agent/collectors/proc.plugin): Monitor interrupts per second using the `proc.plugin` collector.
- [IdleJitter](/docs/agent/collectors/idlejitter.plugin): Measure CPU latency and jitter on all operating systems.
- [SoftIRQs](/docs/agent/collectors/proc.plugin): Collect metrics on SoftIRQs, both system-wide and per-core, using the
  `proc.plugin` collector.
- [SoftNet](/docs/agent/collectors/proc.plugin): Capture SoftNet events per second, both system-wide and per-core,
  using the `proc.plugin` collector.

### Users

- [systemd-logind](/docs/agent/collectors/python.d.plugin/logind): Monitor active sessions, users, and seats tracked
  by `systemd-logind` or `elogind`.
- [User/group usage](/docs/agent/collectors/apps.plugin): Gather CPU, disk, memory, network, and other metrics per user
  and user group using the `apps.plugin` collector.

## Netdata collectors

These collectors are recursive in nature, in that they monitor some function of the Netdata Agent itself. Some
collectors are described only in code and associated charts in Netdata dashboards.

- [ACLK (code only)](https://github.com/netdata/netdata/blob/master/aclk/legacy/aclk_stats.c): View whether a Netdata
  Agent is connected to Netdata Cloud via the [ACLK](/docs/agent/aclk), the volume of queries, process times, and more.
- [Alarms](/docs/agent/collectors/python.d.plugin/alarms): This collector creates an
  **Alarms** menu with one line plot showing the alarm states of a Netdata Agent over time.
- [Anomalies](/docs/agent/collectors/python.d.plugin/anomalies): This collector uses the
  Python PyOD library to perform unsupervised anomaly detection on your Netdata charts and/or dimensions.
- [Exporting (code only)](https://github.com/netdata/netdata/blob/master/exporting/send_internal_metrics.c): Gather
  metrics on CPU utilization for the [exporting engine](/docs/agent/exporting), and specific metrics for each enabled
  exporting connector.
- [Global statistics (code only)](https://github.com/netdata/netdata/blob/master/daemon/global_statistics.c): See
  metrics on the CPU utilization, network traffic, volume of web clients, API responses, database engine usage, and
  more.

## Orchestrators

Plugin orchestrators organize and run many of the above collectors.

If you're interested in developing a new collector that you'd like to contribute to Netdata, we highly recommend using
the `go.d.plugin`.

- [go.d.plugin](https://github.com/netdata/go.d.plugin): An orchestrator for data collection modules written in `go`.
- [python.d.plugin](/docs/agent/collectors/python.d.plugin): An orchestrator for data collection modules written in `python` v2/v3.
- [charts.d.plugin](/docs/agent/collectors/charts.d.plugin): An orchestrator for data collection modules written in `bash` v4+.

## Third-party collectors

These collectors are developed and maintained by third parties and, unlike the other collectors, are not installed by
default. To use a third-party collector, visit their GitHub/documentation page and follow their installation procedures.

- [CyberPower UPS](https://github.com/HawtDogFlvrWtr/netdata_cyberpwrups_plugin): Polls CyberPower UPS data using
  PowerPanel® Personal Linux.
- [Logged-in users](https://github.com/veksh/netdata-numsessions): Collect the number of currently logged-on users.
- [nextcloud](https://github.com/arnowelzel/netdata-nextcloud): Monitor Nextcloud servers.
- [nim-netdata-plugin](https://github.com/FedericoCeratto/nim-netdata-plugin): A helper to create native Netdata
  plugins using Nim.
- [Nvidia GPUs](https://github.com/coraxx/netdata_nv_plugin): Monitor Nvidia GPUs.
- [Teamspeak 3](https://github.com/coraxx/netdata_ts3_plugin): Pulls active users and bandwidth from TeamSpeak 3
  servers.
- [SSH](https://github.com/Yaser-Amiri/netdata-ssh-module): Monitor failed authentication requests of an SSH server.

## Etc

- [checks.plugin](/docs/agent/collectors/checks.plugin): A debugging collector, disabled by default.
- [charts.d example](/docs/agent/collectors/charts.d.plugin/example): An example `charts.d` collector.
- [python.d example](/docs/agent/collectors/python.d.plugin/example): An example `python.d` collector.
