---
title: "Reinstall the Netdata Agent"
description: "Troubleshooting installation issues or force an update of the Netdata Agent by reinstalling it using the same method you used during installation."
custom_edit_url: https://github.com/netdata/netdata/edit/master/packaging/installer/REINSTALL.md
---



In certain situations, such as needing to enable a feature or troubleshoot an issue, you may need to reinstall the
Netdata Agent on your node.

## One-line installer script (`kickstart.sh`)

Run the one-line installer script with the `--reinstall` parameter to reinstall the Netdata Agent. This will preserve
any [user configuration](/docs/configure/nodes) in `netdata.conf` or other files.

If you used any [optional
parameters](/docs/agent/packaging/installer/methods/kickstart#optional-parameters-to-alter-your-installation) during initial
installation, you need to pass them to the script again during reinstallation. If you cannot remember which options you
used, read the contents of the `.environment` file and look for a `REINSTALL_OPTIONS` line. This line contains a list of
optional parameters.

```bash
wget -O /tmp/netdata-kickstart.sh https://my-netdata.io/kickstart.sh && sh /tmp/netdata-kickstart.sh --reinstall
```

## Troubleshooting

If you still experience problems with your Netdata Agent installation after following one of these processes, the next
best route is to [uninstall](/docs/agent/packaging/installer/uninstall) and then try a fresh installation using the [one-line
installer](/docs/agent/packaging/installer/methods/kickstart).

You can also post to our [community forums](https://community.netdata.cloud/c/support/13) or create a new [bug
report](https://github.com/netdata/netdata/issues/new?assignees=&labels=bug%2Cneeds+triage&template=BUG_REPORT.yml).


