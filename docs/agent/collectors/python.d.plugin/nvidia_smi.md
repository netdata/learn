---
title: "NVIDIA GPU monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/nvidia_smi/README.md
---



Monitors performance metrics (memory usage, fan speed, pcie bandwidth utilization, temperature, etc.) using `nvidia-smi` cli tool.


**Requirements and Notes:**

-   You must have the `nvidia-smi` tool installed and your NVIDIA GPU(s) must support the tool. Mostly the newer high end models used for AI / ML and Crypto or Pro range, read more about [nvidia_smi](https://developer.nvidia.com/nvidia-system-management-interface).

-   You must enable this plugin as its disabled by default due to minor performance issues.

-   On some systems when the GPU is idle the `nvidia-smi` tool unloads and there is added latency again when it is next queried. If you are running GPUs under constant workload this isn't likely to be an issue.

-   Currently the `nvidia-smi` tool is being queried via cli. Updating the plugin to use the nvidia c/c++ API directly should resolve this issue. See discussion here: <https://github.com/netdata/netdata/pull/4357>

-   Contributions are welcome.

-   Make sure `netdata` user can execute `/usr/bin/nvidia-smi` or wherever your binary is.

-   If `nvidia-smi` process [is not killed after netdata restart](https://github.com/netdata/netdata/issues/7143) you need to off `loop_mode`.

-   `poll_seconds` is how often in seconds the tool is polled for as an integer.

It produces:

1.  Per GPU

    -   GPU utilization
    -   memory allocation
    -   memory utilization
    -   fan speed
    -   power usage
    -   temperature
    -   clock speed
    -   PCI bandwidth

## Configuration

Edit the `python.d/nvidia_smi.conf` configuration file using `edit-config` from the your agent's [config
directory](/docs/step-by-step/step-04#find-your-netdataconf-file), which is typically at `/etc/netdata`.

```bash
cd /etc/netdata   # Replace this path with your Netdata config directory, if different
sudo ./edit-config python.d/nvidia_smi.conf
```

Sample:

```yaml
loop_mode    : yes
poll_seconds : 1
```


