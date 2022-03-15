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
import React from 'react';
import CodeBlock from '@theme/CodeBlock';

export default function CollectorDebug({ pluginName, collectorName }) {
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
