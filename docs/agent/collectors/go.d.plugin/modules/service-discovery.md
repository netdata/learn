

Service discovery extracts all the potentially useful information from different sources,
converts it to the configurations and exports them to the different destinations.

# Pipeline

The service discovery pipeline has four jobs:

-   [discovery](#discovery): dynamically discovers targets.
-   [tag](#tag): tags discovered targets.
-   [build](#build): creates configuration files from the targets.
-   [export](#export): exports configurations.

Routing in a job and between jobs based on `tags` and `selector`.  

Pipeline configuration:

```yaml
name: <name>
discovery: <discovery_config>
tag: <tag_config>
build: <build_config>
export: <export_config>
```

# Tags and selectors

Tag, build and export jobs have `selector`, the pipeline routes a target/config to the job
only if its tags matches job selectors.

Both tags and selector are just lists of words.

A word must match the regex `^[a-zA-Z][a-zA-Z0-9=_.]*$`.

Tags special cases:

 - `-word`: the word will be removed on tags merging.

Selectors special cases:

-   `!word`: should not contain the word.
-   `word|word|word`: should contain any word.

# Discovery

Discovery job dynamically discovers targets using one of the supported service-discovery mechanisms.

Supported mechanisms:

-   [kubernetes](#kubernetes)

Discovery configuration:

```yaml
k8s:
  - <kubernetes_discovery_config>
```

## Kubernetes

Kubernetes discoverer retrieves targets from [Kubernetes'](https://kubernetes.io/)
[REST API](https://kubernetes.io/docs/reference/).
It always stays synchronized with the cluster state.

Kubernetes discovery configuration options:

```yaml
# Mandatory. Tags to add to all discovered targets.
tags: <tags>

# Mandatory. The Kubernetes role of entities that should be discovered.
role: <role>

# Optional. Discover only targets that exist on the same node as service-discovery.
# This option works only for 'pod' role and it requires MY_NODE_NAME env variable to be set.
local_mode: <boolean>

# Optional. If omitted, all namespaces are used.
namespaces:
  - <namespace>
```

One of the following role types can be configured to discover targets:

-   `pod`
-   `service`

### Pod Role

The pod role discovers all pods and exposes their containers as targets.
For each declared port of a container, it generates single target.

Available pod target fields:

| Name           | Type              | Value                                                     |
| :------------- | :---------------- | :-------------------------------------------------------- |
| `TUID`         | string            | `Namespace_Name_ContName_PortProtocol_Port`               |
| `Address`      | string            | `PodIP:Port`                                              |
| `Namespace`    | string            | _pod.metadata.namespace_                                  |
| `Name`         | string            | _pod.metadata.name_                                       |
| `Annotations`  | map[string]string | _pod.metadata.annotations_                                |
| `Labels`       | map[string]string | _pod.metadata.labels_                                     |
| `NodeName`     | string            | _pod.spec.nodeName_                                       |
| `PodIP`        | string            | _pod.status.podIP_                                        |
| `ContName`     | string            | _pod.spec.containers.name_                                |
| `Image`        | string            | _pod.spec.containers.image_                               |
| `Env`          | map[string]string | _pod.spec.containers.env_ + _pod.spec.containers.envFrom_ |
| `Port`         | string            | _pod.spec.containers.ports.containerPort_                 |
| `PortName`     | string            | _pod.spec.containers.ports.name_                          |
| `PortProtocol` | string            | _pod.spec.containers.ports.protocol_                      |

### Service Role

The service role discovers a target for each service port for each service.

Available service target fields:

| Name           | Type              | Value                                                     |
| :------------- | :---------------- | :-------------------------------------------------------- |
| `TUID`         | string            | `Namespace_Name_PortProtocol_Port`                        |
| `Address`      | string            | `Name.Namespace.svc:Port`                                              |
| `Namespace`    | string            | _svc.metadata.namespace_                                  |
| `Name`         | string            | _svc.metadata.name_                                       |
| `Annotations`  | map[string]string | _svc.metadata.annotations_                                |
| `Labels`       | map[string]string | _svc.metadata.labels_                                     |
| `Port`         | string            | _pod.spec.containers.ports.containerPort_                 |
| `PortName`     | string            | _pod.spec.containers.ports.name_                          |
| `PortProtocol` | string            | _pod.spec.containers.ports.protocol_                      |
| `ClusterIP`    | string            | _svc.spec.clusterIP_                                      |
| `ExternalName` | string            | _svc.spec.externalName_                                   |
| `Type`         | string            | _svc.spec.ports.type_                                     |

# Tag

Tag job tags targets discovered by [discovery job](#discovery). Its purpose is service identification.

Configuration is a list of tag rules:

```yaml
- <tag_rule_config>
```

Tag rule configuration options:

```yaml
# Mandatory. Routes targets to this tag rule with tags matching this selector.
selector: <selector>

# Mandatory. Tags to merge with the target tags if at least on of the match rules matches.
tags: <tags>

# Mandatory. Match rules, at least one should be defined. 
match:
    # Optional. Routes targets to this match rule with tags matching this selector.
  - selector: <selector>

    # Mandatory. Tags to merge with the target tags if this rule expression evaluates to true.
    tags: <tags>

    # Mandatory. Match expression.
    expr: <expression>
```

**Match expression evaluation result should be true or false**.
Expression syntax is [go-template](https://golang.org/pkg/text/template/).

Available custom functions:

-   `glob` reports whether arg1 matches the shell file name pattern.
-   `re` reports whether arg1 contains any match of the regular expression pattern.  
-   `hasKey` reports whether arg1 contains a key (arg1 should be a `map` type)

All these functions accepts two or more arguments, returning in effect:

> func(arg1, arg2) || func(arg1, arg3) || func(arg1, arg4) ... 

# Build

Build job creates configurations from targets.

Configuration is a list of build rules:

```yaml
- <build_rule_config>
```

Build rule configuration options:

```yaml
# Mandatory. Routes targets to this rule with tags matching this selector.
selector: <selector>

# Mandatory. Tags to add to all built by this rule configurations.
tags: <tags>

# Mandatory. Apply rules, at least one should be defined. 
apply:
    # Mandatory. Routes targets to this apply rule with tags matching this selector.
  - selector: <selector>

    # Optional. Tags to add to configurations built by this apply rule.
    tags: <tags>

    # Mandatory. Configuration template.
    template: <template>
```

Template syntax is [go-template](https://golang.org/pkg/text/template/).

# Export

Export job exports configurations built by [build job](#build).

Supported exporters:

-   `file`

Export configuration:

```yaml
file:
  - <file_exporter_config>
```

## File

File exporter writes configurations to a specific file.

```yaml
# Mandatory. Routes configurations to this exporter with tags matching this selector.
selector: <selector>

# Mandatory. Absolute path to a file.
filename: <filename>
```

# Troubleshooting

Service-discovery has debug mode and special `stdout` exporter which is enabled only when it's running from the terminal.  

CLI:

```cmd
Usage:
  sd [OPTION]...

Application Options:
      --config-file= Configuration file path
      --config-map=  Configuration ConfigMap (name:key)
  -d, --debug        Debug mode

Help Options:
  -h, --help         Show this help message
```
