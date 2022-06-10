---
title: Obsolete offline nodes
description: Netdata cloud admins now have the ability to obsolete offline nodes
custom_edit_url: https://github.com/netdata/learn/blob/master/docs/cloud/manage/obsolete-nodes.md
---

Netdata admin users now have the ability to remove obsolete nodes from a space. 

- Only admin users have the ability to obsolete nodes
- Only offline nodes can be marked obsolete (Live nodes and stale nodes cannot be obsoleted)
- Node obsoletion works across the entire space, so the obsoleted node will be removed from all rooms belonging to the space
- If the obsoleted nodes eventually become live or online once more they will be automatically re-added to the space

![Obsoleting an offline node](https://user-images.githubusercontent.com/24860547/173019181-3d055cfd-8790-4110-9439-58aea69a1231.gif)

## What's next?

Currently node obsoletion can be performed from the "Nodes" tab. The ability to perform node obsoletion from other places you use to manage your space and rooms will be added along with the ability to bulk delete a large number of obsolete nodes.
