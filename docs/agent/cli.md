---
title: "Netdata cli"
custom_edit_url: https://github.com/netdata/netdata/edit/master/cli/README.md
---



You can see the commands netdatacli supports by executing it with `netdatacli` and entering `help` in
standard input. All commands are given as standard input to `netdatacli`.

The commands that a running netdata agent can execute are the following:

```sh
The commands are (arguments are in brackets):
help
    Show this help menu.
reload-health
    Reload health configuration.
save-database
    Save internal DB to disk for for memory mode save.
reopen-logs
    Close and reopen log files.
shutdown-agent
    Cleanup and exit the netdata agent.
fatal-agent
    Log the state and halt the netdata agent.
reload-claiming-state
    Reload agent claiming state from disk.
```

Those commands are the same that can be sent to netdata via [signals](/docs/agent/daemon#command-line-options).


