const NON_INDEXABLE_ROUTES = new Set([
	'/',
	'/blog',
	'/search',
	'/docs/ask-netdata',
	'/docs/developer-and-contributor-corner/libnetdata',
	'/docs/developer-and-contributor-corner/libnetdata/avl',
	'/docs/developer-and-contributor-corner/libnetdata/buffer-library',
	'/docs/developer-and-contributor-corner/libnetdata/circular-buffer',
	'/docs/developer-and-contributor-corner/libnetdata/clocks',
	'/docs/developer-and-contributor-corner/libnetdata/json',
	'/docs/developer-and-contributor-corner/libnetdata/socket',
	'/docs/developer-and-contributor-corner/libnetdata/statistical-functions',
	'/docs/developer-and-contributor-corner/libnetdata/storage-number',
	'/docs/developer-and-contributor-corner/libnetdata/threads',
	'/docs/developer-and-contributor-corner/libnetdata/url',
]);

function normalizeRoutePath(routePath) {
	if (!routePath) {
		return '/';
	}

	const pathname = new URL(routePath, 'https://learn.netdata.cloud').pathname;
	return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function isIndexableRoute(routePath) {
	return !NON_INDEXABLE_ROUTES.has(normalizeRoutePath(routePath));
}

module.exports = {
	NON_INDEXABLE_ROUTES,
	isIndexableRoute,
	normalizeRoutePath,
};
