---
title: "Postfix monitoring with Netdata"
custom_edit_url: https://github.com/netdata/netdata/edit/master/collectors/python.d.plugin/postfix/README.md
---



Monitors MTA email queue statistics using postqueue tool.  

Execute `postfix -p` to grab postfix queue.

It produces only two charts:

1.  **Postfix Queue Emails**

    -   emails

2.  **Postfix Queue Emails Size** in KB

    -   size

Configuration is not needed.

---


