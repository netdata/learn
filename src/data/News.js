import React from 'react';

export const ReleaseVersion = '1.35.0';

export const ReleaseDate = 'June 8, 2022';

export const ReleaseNotes = [
	'Anomaly Advisor * on-device Machine Learning',
	'Metric Correlations on Agent',
	'Kubernetes monitoring improvements',
	'Visualization improvements',
];



export const News = [
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
	{
		title: <>Cloud charts 2.0</>,
		href: 'docs/cloud/visualize/interact-new-charts',
		date: 'November 30, 2021',
		type: 'Doc',
		description: (
			<>
				The improved charts in Netdata Cloud allow you to build the
				visualizations that meet your needs. You can customize the chart type
				and move around the chart to catch every metric.
			</>
		),
	},
	{
		title: <>Timezone selector is now available on Netdata Cloud</>,
		href: 'docs/dashboard/visualization-date-and-time-controls#timezone-selector',
		date: 'September 22, 2021',
		type: 'Doc',
		description: (
			<>
				With the timezone selector, you have the ability to change the timezone
				on Netdata Cloud.
			</>
		),
	},
	
];
