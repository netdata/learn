const SITEMAP_EXCLUDED_ROUTES = new Set([
	'/',
	'/blog',
	'/search',
	'/docs/ask-netdata',
	'/docs/ask-nedi',
]);

function normalizeRoutePath(routePath) {
	if (!routePath) {
		return '/';
	}

	const pathname = new URL(routePath, 'https://learn.netdata.cloud').pathname;
	return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function isSitemapIncludedRoute(routePath) {
	return !SITEMAP_EXCLUDED_ROUTES.has(normalizeRoutePath(routePath));
}

module.exports = {
	SITEMAP_EXCLUDED_ROUTES,
	isSitemapIncludedRoute,
	normalizeRoutePath,
};
