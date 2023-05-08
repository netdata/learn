import React from 'react';

export const ReleaseVersion = '1.39.0';

export const ReleaseDate = 'May 8, 2023';

export const ReleaseNotes = [
	'Netdata Charts v3.0',
	'Windows support',
	'Virtual nodes and custom labels',
];



export const News = [	
	{
		title: <>Netdata release 1.39.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.39.0',
		date: 'May 8, 2023',
		type: 'Link',
		description: (
			<>
				Explore the new capabitilies of your powerful Agent! 
			</>
		),
	},
	{
		title: <>Netdata Paid Subscriptions Released</>,
		href: 'https://blog.netdata.cloud/introducing-netdata-paid-subscriptions/',
		date: 'Feb 22, 2023',
		type: 'Link',
		description: (
			<>
				Additional features and capabilities for users and businesses that need tighter and customizable integration of the monitoring solution to their processes.
			</>
		),
	},
	{
		title: <>Netdata Feed</>,
		href: '/docs/troubleshooting-and-machine-learning/events-feed',
		date: 'Feb 21, 2023',
		type: 'Link',
		description: (
			<>
				Receive Live feed of events from your infrastructure! 
			</>
		),
	},
	{
		title: <>Netdata Functions</>,
		href: 'https://blog.netdata.cloud/netdata-functions/',
		date: 'Feb 09, 2023',
		type: 'Link',
		description: (
			<>
				Execute anything from the Netdata Agent Collector in run-time and on-demand using Functions.
			</>
		),
	},	
	{
		title: <>Netdata release 1.38.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.38.0',
		date: 'Feb 06, 2023',
		type: 'Link',
		description: (
			<>
				Huge performance, scalability and stability improvements, runtime functions, events feed, more alert notifications on Netdata Cloud and more! 	
			</>
		),
	},
	{
		title: <>Netdata data source plugin for Grafana</>,
		href: 'https://www.netdata.cloud/blog/introducing-netdata-source-plugin-for-grafana',
		date: 'Nov 09, 2022',
		type: 'Link',
		description: (
			<>
				This initial release of the Netdata data source plugin aims to maximize the troubleshooting capabilities of Netdata in Grafana, making them more widely available. 
			</>
		),
	},
	{
		title: <>New Demo space kickoff</>,
		href: 'https://app.netdata.cloud/spaces/netdata-demo/',
		date: 'Oct 23, 2022',
		type: 'Link',
		description: (
			<>
				We have made available multiple rooms in our Demo space for you to experience the power and simplicity of Netdata with live infrastructure monitoring. 
			</>
		),
	},
	{
		title: <>A PostgreSQL collector, as it supposed to be</>,
		href: 'https://blog.netdata.cloud/postgresql-monitoring/',
		date: 'Sept 26, 2022',
		type: 'Link',
		description: (
			<>
				Netdata now collects 100+ PostgreSQL metrics and visualizes them across 60+ composite charts.
			</>
		),
	},
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
		href: '/docs/getting-started/monitor-your-infrastructure/home-overview-and-single-node-view',
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
		href: '/docs/data-collection/monitor-anything/Networking/SNMP',
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
		href: '/docs/installation/update-netdata#determine-which-installation-method-you-used',
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
];
