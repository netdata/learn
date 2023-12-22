import React from 'react';

export const ReleaseVersion = '1.44.0';

export const ReleaseDate = 'Dec 6, 2023';

export const ReleaseNotes = [
	'Netdata vs. Prometheus',
	'systemd-journal plugin improvements',
	'log2journal, a new tool in your quiver for log management',
	'Netdata now logs to systemd-journal',
	'Functions, power up your troubleshooting toolkit!',
	'New Alert Notification Integrations to Netdata Cloud'
];



export const News = [
	{
		title: <>Netdata Alerts Configuration Manager released!</>,
		href: 'https://learn.netdata.cloud/docs/alerting/creating-alerts-with-the-alerts-configuration-manager',
		date: 'Dec 22, 2023',
		type: 'Link',
		description: (
			<>
				The wait is finally over! The Alerts Configuration Manager provides a wizard to create and manage alerts for your infrastructure monitoring, directly from the Netdata Dashboards.
			</>
		),	
	},
	{
		title: <>Netdata release 1.44.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.44.0',
		date: 'Dec 6, 2023',
		type: 'Link',
		description: (
			<>
				 Check out our Netdata v1.44.0 release notes to learn about our newest features and improvements. 

			</>
		),	
	},
	{
		title: <>Netdata Cloud On-Prem is here, explore the possibilites</>,
		href: 'https://www.netdata.cloud/contact-us/?subject=on-prem',
		date: 'Nov 20, 2023',
		type: 'Link',
		description: (
			<>
				Book a meeting today and discover how Netdata can transform infrastructure monitoring for your organization.
			</>
		),	
	},
	{
		title: <>Unlock Log Management Mastery with systemd-journal and Netdata</>,
		href: 'https://blog.netdata.cloud/system-operators-unlock-log-management-mastery-with-systemd-journal-and-netdata/',
		date: 'Nov 3, 2023',
		type: 'Link',
		description: (
			<>
				The dynamic duo of systemd-journal and Netdata is revolutionizing log management!
			</>
		),	
	},
	{
		title: <>Netdata release 1.43.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.43.0',
		date: 'Oct 16, 2023',
		type: 'Link',
		description: (
			<>
				Check out our Netdata v1.43.0 release notes to learn about our newest features and improvements.
			</>
		),	
	},
	{
		title: <>Netdata release 1.42.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.42.0',
		date: 'Aug 9, 2023',
		type: 'Link',
		description: (
			<>
				Check out our Netdata v1.42.0 release notes to learn about our newest features and improvements.
			</>
		),
	},	{
		title: <>Netdata Integrations Marketplace</>,
		href: 'https://app.netdata.cloud/spaces/netdata-demo/rooms/all-nodes/overview#integrationsModalOpen=true',
		date: 'August 3, 2023',
		type: 'Link',
		description: (
			<>
				Check out our Netdata Integrations Marketplace to find all the integrations Netdata supports across Deploy, Data Collection, Alert Notifications, and Exporters..
			</>
		),
	},	{
		title: <>Netdata release 1.41.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.41.0',
		date: 'July 20, 2023',
		type: 'Link',
		description: (
			<>
				Check out our Netdata v1.41.0 release notes to learn about our newest features and improvements.
			</>
		),
	},	{
		title: <>Netdata Assistant</>,
		href: 'https://blog.netdata.cloud/netdata-assistant/',
		date: 'July 18, 2023',
		type: 'Link',
		description: (
			<>
				Your AI-Powered Troubleshooting Sidekick.
			</>
		),
	},
	{
		title: <>Netdata release 1.40.0</>,
		href: 'https://github.com/netdata/netdata/releases/tag/v1.40.0',
		date: 'June 14, 2023',
		type: 'Link',
		description: (
			<>
				Check out our Netdata v1.40.0 release notes to learn about our newest features and improvements.
			</>
		),
	},	
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
