const SNMP_INTEGRATION_PATH =
  '/docs/network-performance-monitoring/snmp-traps/integrations/';
const VENDOR_LEGAL_SUFFIXES = new Set([
  'ab', 'ag', 'co', 'corp', 'corporation', 'gmbh', 'inc', 'limited', 'llc', 'ltd', 'sro',
]);

function normalizeWhitespace(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function stripGeneratedSnmpFormerly(title, permalink) {
  const normalizedTitle = normalizeWhitespace(title);
  const normalizedPermalink = String(permalink ?? '').toLowerCase();

  if (!normalizedPermalink.startsWith(SNMP_INTEGRATION_PATH)) {
    return normalizedTitle;
  }

  const legacyMatch = normalizedTitle.match(
    /^(.*?)\s+(?:formerly|previously|previous\s+was)\s+(.*?)(\s+snmp\s+traps?)$/i,
  );
  if (!legacyMatch) {
    return normalizedTitle;
  }

  const compact = (value) =>
    normalizeWhitespace(value)
      .split(' ')
      .filter((token) => !VENDOR_LEGAL_SUFFIXES.has(token.replace(/[.,]/g, '').toLowerCase()));
  const currentName = compact(legacyMatch[1]).join(' ');
  const formerName = compact(legacyMatch[2]).slice(0, 2).join(' ');
  return `${currentName} (${formerName})${legacyMatch[3]}`;
}

export function getImmediateParentTitle(breadcrumbs, currentPermalink) {
  const items = Array.isArray(breadcrumbs) ? breadcrumbs : [];
  const currentPath = String(currentPermalink ?? '').replace(/\/+$/, '');
  const lastItemPath = String(items.at(-1)?.href ?? '').replace(/\/+$/, '');
  const parentIndex = lastItemPath === currentPath ? -2 : -1;
  return normalizeWhitespace(items.at(parentIndex)?.label);
}

export function composeDocTitle({
  seoTitle,
  title,
  sidebarLabel,
  permalink,
  breadcrumbs,
}) {
  const explicitTitle = normalizeWhitespace(seoTitle);
  if (explicitTitle) {
    return explicitTitle;
  }

  const leafTitle = stripGeneratedSnmpFormerly(
    normalizeWhitespace(title) || normalizeWhitespace(sidebarLabel), permalink,
  );
  const parentTitle = getImmediateParentTitle(breadcrumbs, permalink);

  if (!leafTitle || !parentTitle || leafTitle === parentTitle) {
    return leafTitle || parentTitle;
  }

  return `${leafTitle} | ${parentTitle}`;
}

export function formatSiteTitle(params) {
  const {title, defaultFormatter} = params;
  const defaultTitle = defaultFormatter(params);
  if (!title || defaultTitle.length <= 60) {
    return defaultTitle;
  }

  const snmpLeafTitle = title.replace(/\s+\|\s+Integrations$/, '');
  if (snmpLeafTitle !== title && /\sSNMP\sTraps?$/i.test(snmpLeafTitle)) {
    const shortDefault = defaultFormatter({...params, title: snmpLeafTitle});
    return shortDefault.length <= 60 ? shortDefault : snmpLeafTitle;
  }

  return title;
}
