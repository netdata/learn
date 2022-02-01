import React from 'react';

export const ReleaseVersion = '1.32.0';

export const ReleaseDate = 'November 30, 2021';

export const ReleaseNotes = [
	'Architectural changes to improve responsiveness, reliability, and stability',
	'eBPF latency monitoring for disks, IRQs, and more',
	'ML powered anomaly detection',
	'eBPF container monitoring using cgroups',
	'New timezone selector and time control tools',
];

export const News = [
	{
		title: <>Cloud charts 2.0</>,
		href: 'docs/cloud/visualize/interact-new-charts',
		date: 'November 30, 2021',
		type: 'Doc',
		description: (
			<>
				{' '}
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
	{
		title: <>Date and timeframe controls for visualizations on Netdata Cloud</>,
		href: 'docs/dashboard/visualization-date-and-time-controls',
		date: 'August 18, 2021',
		type: 'Doc',
		description: (
			<>
				Dashboards now allow you to visualize specific timeframes for any time
				interval either by using a set of quick time-ranges or selecting a
				custom time-range .
			</>
		),
	},
	{
		title: <>Kubernetes monitoring with Netdata: Overview and visualizations</>,
		href: '/guides/monitor/kubernetes-k8s-netdata',
		date: 'May 5, 2021',
		type: 'Guide',
		description: (
			<>
				Learn how to navigate Netdata's Kubernetes monitoring features for
				visualizing the health and performance of a Kubernetes cluster with
				per-second granulrity.
			</>
		),
	},
	{
		title: <>Z-scores collector</>,
		href: '/docs/agent/collectors/python.d.plugin/zscores',
		date: 'April 26, 2021',
		type: 'Collector',
		description: (
			<>
				Create smoothed, rolling Z-Scores for selected metrics or charts to
				visualize when they deviate from normal.
			</>
		),
	},
	{
		title: <>Develop a custom data collector in Python</>,
		href: '/guides/python-collector',
		date: 'March 24, 2021',
		type: 'Guide',
		description: (
			<>
				Learn how write a custom data collector in Python, which you'll use to
				collect metrics from and monitor any application that isn't supported
				out of the box.
			</>
		),
	},
];
