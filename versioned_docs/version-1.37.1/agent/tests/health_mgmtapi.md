---
title: "Health command API tester"
custom_edit_url: https://github.com/netdata/netdata/edit/master/tests/health_mgmtapi/README.md
---



The directory `tests/health_cmdapi` contains the test script `health-cmdapi-test.sh` for the [health command API](/docs/agent/web/api/health).

The script can be executed with options to prepare the system for the tests, run them and restore the system to its previous state. 

It depends on the management API being accessible on localhost:19999 and on the responses to the api/v1/alarms?all requests being functional.
It also requires read access to the management API key that is usually under `/var/lib/netdata/netdata.api.key` (`@varlibdir_POST@/netdata.api.key`).


