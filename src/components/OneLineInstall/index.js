import React, { useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import CodeBlock from "@theme/CodeBlock";

import styles from "./styles.module.css";

/**
 * Accepts markdown-style link strings so the ingest script can catch them:
 *   privacyMd='[anonymous statistics?](/docs/deployment-in-production/security-and-privacy-design)'
 *   connectMd='[connect](/docs/getting-started/monitor-your-infrastructure/connect-agent-to-cloud)'
 */

function parseMarkdownLink(md, fallbackText, fallbackHref) {
  // Matches: [label](href)
  const m = typeof md === "string" ? md.match(/^\s*\[([^\]]*)\]\(([^)]+)\)\s*$/) : null;
  if (m) {
    const text = (m[1] || "").trim() || fallbackText;
    const href = (m[2] || "").trim() || fallbackHref;
    return { text, href };
  }

  // If a path is passed, accept it too.
  if (typeof md === "string" && md.trim().startsWith("/")) {
    return { text: fallbackText, href: md.trim() };
  }

  return { text: fallbackText, href: fallbackHref };
}

export function OneLineInstall({
  method = "wget", // "wget" | "curl"

  //defaults
  privacyMd = "[anonymous statistics?](docs/netdata-agent/anonymous-telemetry-events)",
  connectMd = "[connect](/docs/netdata-cloud/connect-agent)",

  defaultUpdatesEnabled = true,
  defaultNightlyEnabled = true, // nightly == default; stable toggle flips this
  defaultTelemetryEnabled = true,
  defaultCloudEnabled = false,
  claimTokenPlaceholder = "YOUR_CLAIM_TOKEN",
}) {
  const baseCommand = useMemo(() => {
    if (method === "curl") {
      return "curl https://get.netdata.cloud/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh";
    }
    return "wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh";
  }, [method]);

  const [updatesEnabled, setUpdatesEnabled] = useState(!!defaultUpdatesEnabled);
  const [nightlyEnabled, setNightlyEnabled] = useState(!!defaultNightlyEnabled);
  const [telemetryEnabled, setTelemetryEnabled] = useState(!!defaultTelemetryEnabled);
  const [cloudEnabled, setCloudEnabled] = useState(!!defaultCloudEnabled);

  const flags = useMemo(() => {
    const parts = [];
    if (!updatesEnabled) parts.push("--no-updates");
    if (!nightlyEnabled) parts.push("--stable-channel");
    if (!telemetryEnabled) parts.push("--disable-telemetry");
    if (cloudEnabled) parts.push(`--claim-token ${claimTokenPlaceholder}`);
    return parts.length ? " " + parts.join(" ") : "";
  }, [updatesEnabled, nightlyEnabled, telemetryEnabled, cloudEnabled, claimTokenPlaceholder]);

  const currentCommand = `${baseCommand}${flags}`;

  const idPrefix = useMemo(
    () => `oli_${method}_${Math.random().toString(36).slice(2, 8)}`,
    [method]
  );

  const privacyLink = useMemo(
    () =>
      parseMarkdownLink(
        privacyMd,
        "anonymous statistics?",
        "/docs/deployment-in-production/security-and-privacy-design"
      ),
    [privacyMd]
  );

  const connectLink = useMemo(
    () =>
      parseMarkdownLink(
        connectMd,
        "connect",
        "/docs/getting-started/monitor-your-infrastructure/connect-agent-to-cloud"
      ),
    [connectMd]
  );

  return (
    <div className={clsx("relative overflow-hidden mt-8 mb-8 rounded-tr rounded-tl", styles.Container)}>
      <div className="text-lg lg:text-xl">
        <CodeBlock className="bash">{currentCommand}</CodeBlock>
      </div>

      <div className="z-10 relative -t-2 p-6 border-l border-b border-r border-gray-200 rounded-br rounded-bl dark:bg-gray-darkbg dark:border-gray-500">
        <div className="py-1 flex items-center">
          <input
            onChange={() => setUpdatesEnabled((v) => !v)}
            checked={updatesEnabled}
            type="checkbox"
            id={`${idPrefix}__updates`}
          />
          <label htmlFor={`${idPrefix}__updates`} className="relative text-sm pl-2">
            Do you want automatic updates? <code>default: enabled</code>
          </label>
        </div>

        <div className="py-1 flex items-center">
          <input
            onChange={() => setNightlyEnabled((v) => !v)}
            checked={nightlyEnabled}
            type="checkbox"
            id={`${idPrefix}__type`}
          />
          <label htmlFor={`${idPrefix}__type`} className="relative text-sm pl-2">
            Do you want nightly or stable releases? <code>default: nightly</code>
          </label>
        </div>

        <div className="py-1 flex items-center">
          <input
            onChange={() => setTelemetryEnabled((v) => !v)}
            checked={telemetryEnabled}
            type="checkbox"
            id={`${idPrefix}__stats`}
          />
          <label htmlFor={`${idPrefix}__stats`} className="relative text-sm pl-2">
            Do you want to contribute{" "}
            <Link to={privacyLink.href} className="hover:text-blue">
              {privacyLink.text}
            </Link>{" "}
            <code>default: enabled</code>
          </label>
        </div>

        <div className="py-1 flex items-center">
          <input
            onChange={() => setCloudEnabled((v) => !v)}
            checked={cloudEnabled}
            type="checkbox"
            id={`${idPrefix}__cloud`}
          />
          <label htmlFor={`${idPrefix}__cloud`} className="relative text-sm pl-2">
            Do you want to{" "}
            <Link to={connectLink.href} className="hover:text-blue">
              {connectLink.text}
            </Link>{" "}
            the node to Netdata Cloud? <code>default: disabled</code>
          </label>
        </div>
      </div>
    </div>
  );
}
