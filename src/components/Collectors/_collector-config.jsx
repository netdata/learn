{
	/* This piece of code generates the configuration section of a collector
Usage: This file needs to be imported in an MDX file like this: 

import CollectorConfiguration from '@site/src/components/Collectors/_collector-config.jsx';

<CollectorConfiguration
	configURL=""
	moduleName=""
/>

configURL: Assign the Github URL of the collector's configuration file
moduleName: Assign the name of the collector in the following schema: PLUGIN/COLLECTOR.conf */
}

import React from 'react';
import CodeBlock from '@theme/CodeBlock';

export default function CollectorConfiguration({ configURL, moduleName }) {
	return (
		<>
			<p>
				To edit the <code>{moduleName} </code> configuration file:
			</p>

			<ol>
				<li>
					Navigate to the{' '}
					<a href="/docs/configure/nodes#the-netdata-config-directory">
						Netdata config directory
					</a>
					.<CodeBlock className="bash">cd /etc/netdata</CodeBlock>
				</li>
				<li>
					Use the{' '}
					<a href="/docs/configure/nodes#use-edit-config-to-edit-configuration-files">
						<code>edit-config</code>
					</a>{' '}
					script to edit <code>{moduleName}</code>.
					<CodeBlock className="bash">
						sudo ./edit-config {moduleName}
					</CodeBlock>
				</li>
				<li>
					Enable changes to the collector by setting <code>enabled: yes</code>.
				</li>
				<li>
					Save the changes and restart the Agent with{' '}
					<code>sudo systemctl restart netdata</code> or the{' '}
					<a href="/docs/configure/start-stop-restart">appropriate method</a>{' '}
					for your system.
				</li>
			</ol>

			<p>
				For all available options, please see the module{' '}
				<a href={configURL}>configuration file</a>.
			</p>
		</>
	);
}
