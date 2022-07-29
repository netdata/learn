import React from 'react';

export const ReleaseVersion = '1.35.0';

export const ReleaseDate = 'June 8, 2022';

export const ReleaseNotes = [
	'Anomaly Advisor & on-device Machine Learning',
	'Metric Correlations on Agent',
	'Kubernetes monitoring improvements',
	'Visualization improvements',
];



export const News = [
	{
		title: <>Netdata Agent patch release</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.35.1',
		date: 'June 9, 2022',
		type: 'Doc',
		description: (
			<>
				For users who installed Netdata with a Static build since March 22, 2022, the v1.35.1 patch release fixes an issue in the static build installation code that causes automatic updates to be unintentionally disabled when updating static installs.
			</>
		),
	},
	{
		title: <>Anomaly Advisor, on-device machine learning, and Metric Correlations on the Agent</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.35.0',
		date: 'June 8, 2022',
		type: 'Doc',
		description: (
			<>
				Check out our Netdata v1.35.0 release notes to learn about our newest feature offerings, including Anomaly Advisor, on-device machine learning, and our introduction of Metric Correlations on our open-source agent dashboard.
			</>
		),
	},
	{
		title: <>Netdata's new Home tab</>,
		href: 'docs/cloud/visualize/overview',
		date: 'May 18, 2022',
		type: 'Doc',
		description: (
			<>
				Our new Home tab provides a predefined dashboard of relevant information about entities in a War Room. This tab will automatically present summarized information in an easily digestible display.
			</>
		),
	},
	{
		title: <>SNMP collector now runs on Go</>,
		href: '/docs/agent/collectors/go.d.plugin/modules/snmp',
		date: 'March 28, 2022',
		type: 'Doc',
		description: (
			<>
				Go is known for its reliability and blazing speed - precisely what you need when monitoring networks. We've rewritten our SNMP collector from Node.js to Go. Apart from improved configuration options, the new collector eliminates the need for Node.js, slimming down our dependency tree.
			</>
		),
	},
	{
		title: <>Play pretend: The kickstart script now has a dry-run mode</>,
		href: '/docs/agent/packaging/installer/update#determine-which-installation-method-you-used',
		date: 'Mar 16, 2022',
		type: 'Doc',
		description: (
			<>
				If you have a system that you need to be extra careful on, we have good
				news for you: When installing or updating Netdata using the kickstart
				script, you can use the <code>--dry-run</code> option to get a report of
				what would happen on your node.
			</>
		),
	},
	{
		title: <>New version of the kickstart script</>,
		href: '/docs/agent/packaging/installer/methods/kickstart/',
		date: 'January 18, 2022',
		type: 'Doc',
		description: (
			<>
				Our new and improved one-line install process gets you started with
				Netdata even faster. Now more portable than ever, it eliminates the need
				to manually handle dependencies on a majority of Linux systems.
				Additionally, most users will see greatly reduced resource requirements
				for the install process compared to the old script.
			</>
		),
	},
	
	
];
