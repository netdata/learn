import React, { useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import CodeBlock from "@theme/CodeBlock";

import styles from "./styles.module.css";

export function OneLineInstall({
  method = "wget", // "wget" | "curl"
  privacyLink = "/docs/deployment-in-production/security-and-privacy-design",
  connectLink = "/docs/getting-started/monitor-your-infrastructure/connect-agent-to-cloud",
  defaultUpdatesEnabled = true,
  defaultNightlyEnabled = true, // nightly == default; stable toggle flips this
  defaultTelemetryEnabled = true,
  defaultCloudEnabled = false,
  claimTokenPlaceholder = "YOUR_CLAIM_TOKEN",
}) {
  // Base command depends on method
  const baseCommand = useMemo(() => {
    if (method === "curl") {
      return "curl https://get.netdata.cloud/kickstart.sh > /tmp/netdata-kickstart.sh && sh /tmp/netdata-kickstart.sh";
    }
    // default: wget
    return "wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh";
  }, [method]);

  // Checkboxes reflect *enabled* state (like your original code)
  const [updatesEnabled, setUpdatesEnabled] = useState(!!defaultUpdatesEnabled);
  const [nightlyEnabled, setNightlyEnabled] = useState(!!defaultNightlyEnabled);
  const [telemetryEnabled, setTelemetryEnabled] = useState(!!defaultTelemetryEnabled);
  const [cloudEnabled, setCloudEnabled] = useState(!!defaultCloudEnabled);

  // Build flags from enabled state
  const flags = useMemo(() => {
    const parts = [];

    // If updates are disabled => add --no-updates
    if (!updatesEnabled) parts.push("--no-updates");

    // If nightly is disabled => stable channel
    if (!nightlyEnabled) parts.push("--stable-channel");

    // If telemetry is disabled => disable telemetry
    if (!telemetryEnabled) parts.push("--disable-telemetry");

    // If cloud is enabled => add claim token placeholder
    if (cloudEnabled) parts.push(`--claim-token ${claimTokenPlaceholder}`);

    return parts.length ? " " + parts.join(" ") : "";
  }, [updatesEnabled, nightlyEnabled, telemetryEnabled, cloudEnabled, claimTokenPlaceholder]);

  const currentCommand = `${baseCommand}${flags}`;

  // Unique-ish ids so multiple instances on a page don't clash
  const idPrefix = useMemo(() => `oli_${method}_${Math.random().toString(36).slice(2, 8)}`, [method]);

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
            <Link to={privacyLink} className="hover:text-blue">
              anonymous statistics?
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
            <Link to={connectLink} className="hover:text-blue">
              connect
            </Link>{" "}
            the node to Netdata Cloud? <code>default: disabled</code>
          </label>
        </div>
      </div>
    </div>
  );
}
