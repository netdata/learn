#!/usr/bin/env python3
"""
Thorough tests for _escape_mdx_braces().

Tests cover: basic escaping, code block preservation, inline code preservation,
already-escaped braces, template literals, double braces, JSX style attributes,
real-world metadata content, and edge cases.
"""
import re
import sys

# --- Copy of the function under test (must match ingest.py exactly) ---

def _escape_mdx_braces(body):
    """
    Escape bare { outside of fenced code blocks and inline code for MDX 3.

    MDX interprets {word} as a JSX expression, which breaks when the content
    is plain text from metadata (e.g. metric names like zabbix.{context}).

    This function:
    - Preserves fenced code blocks (```...```) and inline code (`...`)
    - Escapes every bare { that isn't already escaped
    - Restores style={{ which is valid JSX
    """
    preserved = []

    def _save(match):
        preserved.append(match.group(0))
        return f"\x00MDXBRACE{len(preserved) - 1}\x00"

    # Preserve fenced code blocks — must come before inline code
    body = re.sub(r"```.*?```", _save, body, flags=re.DOTALL)
    # Preserve inline code
    body = re.sub(r"`[^`\n]+`", _save, body)

    # Escape every bare { not already preceded by a backslash
    body = re.sub(r"(?<!\\)\{", r"\\{", body)

    # Restore style={{ which is valid JSX (the above turns it into style=\{\{)
    body = body.replace("style=\\{\\{", "style={{")

    # Restore preserved code sections
    for i, original in enumerate(preserved):
        body = body.replace(f"\x00MDXBRACE{i}\x00", original)

    return body

# --- End of function copy ---

passed = 0
failed = 0


def check(name, input_text, expected):
    global passed, failed
    result = _escape_mdx_braces(input_text)
    if result == expected:
        passed += 1
        print(f"  PASS: {name}")
    else:
        failed += 1
        print(f"  FAIL: {name}")
        print(f"    input:    {input_text!r}")
        print(f"    expected: {expected!r}")
        print(f"    got:      {result!r}")


# ---------------------------------------------------------------------------
# 1. Basic single-brace escaping
# ---------------------------------------------------------------------------
print("=== Basic escaping ===")
check("simple {word}", "hello {world}", r"hello \{world}")
check("metric name {context}", "zabbix.{context}", r"zabbix.\{context}")
check("metric name {script}.{label}", "nagios.{script}.{label}", r"nagios.\{script}.\{label}")
check("{attribute_name} (was hardcoded)", "{attribute_name}", r"\{attribute_name}")
check("{attribute_unit} (was hardcoded)", "{attribute_unit}", r"\{attribute_unit}")
check("{HOST.IP}", "{HOST.IP}", r"\{HOST.IP}")
check("{HOST.NAME}", "{HOST.NAME}", r"\{HOST.NAME}")
check("{#MACRO}", "{#MACRO}", r"\{#MACRO}")
check("{dimension}", '"{dimension}"', r'"\{dimension}"')
check("multiple on one line", "| {a} | {b} |", r"| \{a} | \{b} |")
check("brace at end", "text{", r"text\{")
check("brace at start", "{start} of line", r"\{start} of line")
check("empty braces", "{}", r"\{}")
check("no braces", "plain text here", "plain text here")

# ---------------------------------------------------------------------------
# 2. Template literal ${...}
# ---------------------------------------------------------------------------
print("\n=== Template literals ===")
check("${expr}", "${foo}", r"$\{foo}")
check("${expr} in text", "value is ${count}", r"value is $\{count}")

# ---------------------------------------------------------------------------
# 3. Double braces {{...}}
# ---------------------------------------------------------------------------
print("\n=== Double braces ===")
check("{{double}}", "{{word}}", r"\{\{word}}")
check("{{double}} in text", "use {{var}} here", r"use \{\{var}} here")

# ---------------------------------------------------------------------------
# 4. JSX style={{ }} preservation
# ---------------------------------------------------------------------------
print("\n=== style={{}} JSX ===")
check("style={{...}}", "style={{width: '90%'}}", "style={{width: '90%'}}")
check("style={{...}} in tag",
      '<img style={{width: "90%", maxHeight: "100%"}} />',
      '<img style={{width: "90%", maxHeight: "100%"}} />')

# ---------------------------------------------------------------------------
# 5. Already escaped braces
# ---------------------------------------------------------------------------
print("\n=== Already escaped ===")
check("\\{already}", r"\{already}", r"\{already}")
check("\\{\\{double}}", r"\{\{double}}", r"\{\{double}}")
check("mixed escaped and bare", r"\{ok} and {bare}", r"\{ok} and \{bare}")

# ---------------------------------------------------------------------------
# 6. Fenced code block preservation
# ---------------------------------------------------------------------------
print("\n=== Fenced code blocks ===")
check("code block untouched",
      "text {a}\n```\n{inside_code}\n```\ntext {b}",
      "text \\{a}\n```\n{inside_code}\n```\ntext \\{b}")

check("code block with language",
      "```yaml\ntarget: \"{HOST.IP}\"\n```",
      "```yaml\ntarget: \"{HOST.IP}\"\n```")

check("code block with braces around it",
      "{before}\n```\n{inside}\n```\n{after}",
      "\\{before}\n```\n{inside}\n```\n\\{after}")

check("multiple code blocks",
      "{a}\n```\n{x}\n```\n{b}\n```\n{y}\n```\n{c}",
      "\\{a}\n```\n{x}\n```\n\\{b}\n```\n{y}\n```\n\\{c}")

# ---------------------------------------------------------------------------
# 7. Inline code preservation
# ---------------------------------------------------------------------------
print("\n=== Inline code ===")
check("inline code untouched",
      "use `{HOST.IP}` macro",
      "use `{HOST.IP}` macro")

check("inline code with surrounding braces",
      "{bare} and `{safe}` and {bare2}",
      "\\{bare} and `{safe}` and \\{bare2}")

check("multiple inline codes",
      "`{a}` then {b} then `{c}`",
      "`{a}` then \\{b} then `{c}`")

# ---------------------------------------------------------------------------
# 8. Table rows (real integration docs pattern)
# ---------------------------------------------------------------------------
print("\n=== Table rows ===")
check("metric table row",
      "| smartctl.device_smart_attr_{attribute_name} | {attribute_name} | {attribute_unit} |",
      r"| smartctl.device_smart_attr_\{attribute_name} | \{attribute_name} | \{attribute_unit} |")

check("metric table with backtick col",
      "| `{HOST.IP}` | {HOST.CONN} | address |",
      "| `{HOST.IP}` | \\{HOST.CONN} | address |")

check("zabbix metric row",
      "| zabbix.{context} | User-defined metric |",
      r"| zabbix.\{context} | User-defined metric |")

check("nagios metric row",
      "| nagios.{script}.{label} | Performance data |",
      r"| nagios.\{script}.\{label} | Performance data |")

# ---------------------------------------------------------------------------
# 9. Real-world zabbix metadata content
# ---------------------------------------------------------------------------
print("\n=== Real-world zabbix content ===")
zabbix_desc = """### Virtual Node Label Conventions

| Label key | Zabbix macro | Description |
|-----------|-------------|-------------|
| `_address` | `{HOST.IP}`, `{HOST.CONN}` | IP address or DNS name |

The `{HOST.NAME}`, `{HOST.HOST}`, and `{HOST.DNS}` macros are derived from the vnode hostname."""

zabbix_expected = """### Virtual Node Label Conventions

| Label key | Zabbix macro | Description |
|-----------|-------------|-------------|
| `_address` | `{HOST.IP}`, `{HOST.CONN}` | IP address or DNS name |

The `{HOST.NAME}`, `{HOST.HOST}`, and `{HOST.DNS}` macros are derived from the vnode hostname."""

check("zabbix description (all braces in backticks)", zabbix_desc, zabbix_expected)

zabbix_metrics = """| zabbix.{context} | {dimension} | varies |
| zabbix.{job}.state | ok, collect_failure | state |"""

zabbix_metrics_expected = r"""| zabbix.\{context} | \{dimension} | varies |
| zabbix.\{job}.state | ok, collect_failure | state |"""

check("zabbix metric rows", zabbix_metrics, zabbix_metrics_expected)

# ---------------------------------------------------------------------------
# 10. Real-world nagios metadata content
# ---------------------------------------------------------------------------
print("\n=== Real-world nagios content ===")
nagios_metrics = "| nagios.{script}.{label} | Performance data metric |"
nagios_expected = r"| nagios.\{script}.\{label} | Performance data metric |"
check("nagios metric row", nagios_metrics, nagios_expected)

# ---------------------------------------------------------------------------
# 11. Config example in code block (should NOT be escaped)
# ---------------------------------------------------------------------------
print("\n=== Config in code block ===")
config_block = '''Before config {bare}
```yaml
jobs:
  - name: disk_usage
    collection:
      snmp:
        target: "{HOST.IP}"
    dependent_pipelines:
      - context: zabbix.disk.used
```
After config {bare2}'''

config_expected = '''Before config \\{bare}
```yaml
jobs:
  - name: disk_usage
    collection:
      snmp:
        target: "{HOST.IP}"
    dependent_pipelines:
      - context: zabbix.disk.used
```
After config \\{bare2}'''

check("config in code block preserved", config_block, config_expected)

# ---------------------------------------------------------------------------
# 12. Edge cases
# ---------------------------------------------------------------------------
print("\n=== Edge cases ===")
check("empty string", "", "")
check("only braces", "{}", r"\{}")
check("nested braces", "{outer{inner}}", r"\{outer\{inner}}")
check("brace with no close", "open { text", r"open \{ text")
check("close brace only", "text } here", "text } here")
check("newline after brace", "{\nfoo}", "\\{\nfoo}")

# ---------------------------------------------------------------------------
# 13. Regression: verify the old hardcoded patterns still work
# ---------------------------------------------------------------------------
print("\n=== Regression: old hardcoded patterns ===")
check("smartctl full line",
      "| smartctl.device_smart_attr_{attribute_name} | {attribute_name} | {attribute_unit} |\n"
      "| smartctl.device_smart_attr_{attribute_name}_normalized | {attribute_name} | value |",
      "| smartctl.device_smart_attr_\\{attribute_name} | \\{attribute_name} | \\{attribute_unit} |\n"
      "| smartctl.device_smart_attr_\\{attribute_name}_normalized | \\{attribute_name} | value |")

# ---------------------------------------------------------------------------
# 14. Full document simulation
# ---------------------------------------------------------------------------
print("\n=== Full document simulation ===")
full_doc = """---
sidebar_label: "Zabbix Preprocessing"
---

# Zabbix Preprocessing

## Overview

Zabbix macros (`{HOST.NAME}`, `{HOST.IP}`) are expanded before execution.

## Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| zabbix.{context} | User-defined metric | varies |
| zabbix.{job}.state | Job state | state |

## Setup

```yaml
jobs:
  - name: api_latency
    collection:
      type: command
      command: /usr/local/bin/get_api_stats.sh
    dependent_pipelines:
      - context: myapp.api.latency
        dimension: p99
        steps:
          - type: jsonpath
            params: "$.latency.p99"
```

The `{HOST.IP}` macro resolves to the host address."""

full_doc_expected = """---
sidebar_label: "Zabbix Preprocessing"
---

# Zabbix Preprocessing

## Overview

Zabbix macros (`{HOST.NAME}`, `{HOST.IP}`) are expanded before execution.

## Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| zabbix.\\{context} | User-defined metric | varies |
| zabbix.\\{job}.state | Job state | state |

## Setup

```yaml
jobs:
  - name: api_latency
    collection:
      type: command
      command: /usr/local/bin/get_api_stats.sh
    dependent_pipelines:
      - context: myapp.api.latency
        dimension: p99
        steps:
          - type: jsonpath
            params: "$.latency.p99"
```

The `{HOST.IP}` macro resolves to the host address."""

check("full zabbix document", full_doc, full_doc_expected)

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print(f"\n{'='*60}")
print(f"Results: {passed} passed, {failed} failed, {passed + failed} total")
if failed:
    print("SOME TESTS FAILED!")
    sys.exit(1)
else:
    print("ALL TESTS PASSED!")
    sys.exit(0)
