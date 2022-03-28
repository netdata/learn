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

export function CollectorConfiguration({ configURL, moduleName }) {
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

{
	/* This piece of code generates the configuration section of a collector
Usage: This file needs to be imported in an MDX file like this: 

import CollectorDebug from '@site/src/components/Collectors/_collector-debugging.jsx';

<CollectorDebug
	pluginName=""
	collectorName=""
/>

pluginName: Assign the plugin name, for example go.d.plugin
collectorName: Assign the name of the collector, for example activemq
*/
}

export function CollectorDebug({ pluginName, collectorName }) {
	return (
		<>
			<p>
				To troubleshoot issues with the <code>{collectorName}</code> collector,
				run the <code>{pluginName}</code> with the debug option enabled.
			</p>

			<ol>
				<li>
					Navigate to your plugins directory, usually at
					<code>/usr/libexec/netdata/plugins.d/</code>. If that's not the case
					on your system, open <code>netdata.conf</code> and look for the
					setting <code>plugins directory</code>.{' '}
				</li>
				<li>
					In the plugins directory, switch to the <code>netdata</code> user.
					<CodeBlock className="bash">
						cd /usr/libexec/netdata/plugins.d/ sudo -u netdata -s
					</CodeBlock>{' '}
				</li>

				<li>
					Run the <code>{pluginName}</code> in debug mode to identify issues:
					<CodeBlock className="bash">
						./{pluginName} -d -m {collectorName}
					</CodeBlock>
					<p>
						The output should give you clues as to why the collector isn't
						working.
					</p>
				</li>
			</ol>
		</>
	);
}
