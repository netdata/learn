const fs = require('node:fs');
const path = require('node:path');

function normalizeRoute(value) {
  const pathname = value.split(/[?#]/, 1)[0];
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

function parseRedirects(text) {
  const lines = text.split(/\r?\n/);
  const rules = [];
  let block = null;
  const finish = () => {
    if (!block) return;
    if (!block.from || !block.to) {
      throw new Error(`Malformed redirect block at line ${block.line}: from and to are required`);
    }
    rules.push(block);
    block = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*\[\[redirects\]\]\s*$/.test(line)) {
      finish();
      block = {line: index + 1};
      continue;
    }
    if (/^\s*\[/.test(line)) {
      finish();
      continue;
    }
    if (!block || /^\s*(?:#.*)?$/.test(line)) continue;
    const match = line.match(/^\s*(from|to)\s*=\s*"([^"]*)"\s*(?:#.*)?$/);
    if (!match || block[match[1]] !== undefined) {
      throw new Error(`Unsupported or duplicate redirect field at line ${index + 1}: ${line.trim()}`);
    }
    block[match[1]] = match[2];
  }
  finish();
  return rules;
}

function routeSet(publishDir) {
  const routes = new Set();
  const stack = [publishDir];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(filename);
      else if (entry.isFile()) {
        const relative = `/${path.relative(publishDir, filename).split(path.sep).join('/')}`;
        routes.add(relative);
        if (relative.endsWith('/index.html')) routes.add(normalizeRoute(relative.slice(0, -'/index.html'.length)));
        else if (relative.endsWith('.html')) routes.add(relative.slice(0, -'.html'.length));
      }
    }
  }
  return routes;
}

function validateSource(rule) {
  if (!rule.from.startsWith('/')) throw new Error(`Malformed redirect source at line ${rule.line}: ${rule.from}`);
  if (/[?#\s]/.test(rule.from)) throw new Error(`Malformed redirect source at line ${rule.line}: ${rule.from}`);
  validatePercentEncoding(rule.from, rule.line, 'source');
  const stars = [...rule.from.matchAll(/\*/g)];
  if (stars.length > 1 || (stars.length === 1 && !rule.from.endsWith('/*')) || rule.from.includes(':')) {
    throw new Error(`Unsupported redirect source pattern at line ${rule.line}: ${rule.from}`);
  }
  if (rule.to.startsWith('/')) {
    if (/[?#\s]/.test(rule.to)) throw new Error(`Malformed redirect target at line ${rule.line}: ${rule.to}`);
    validatePercentEncoding(rule.to, rule.line, 'target');
    const splats = [...rule.to.matchAll(/:splat/g)];
    if (splats.length > 1 || (splats.length && !rule.from.endsWith('/*')) || rule.to.includes('*')) {
      throw new Error(`Unsupported redirect target pattern at line ${rule.line}: ${rule.to}`);
    }
  } else {
    let url;
    try { url = new URL(rule.to); } catch { throw new Error(`Malformed external redirect target at line ${rule.line}: ${rule.to}`); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Unsupported redirect target at line ${rule.line}: ${rule.to}`);
  }
}

function validatePercentEncoding(value, line, kind) {
  for (let index = value.indexOf('%'); index !== -1; index = value.indexOf('%', index + 1)) {
    const escape = value.slice(index, index + 3);
    if (!/^%[0-9a-f]{2}$/i.test(escape) || /^%(?:2f|3f|23|5c)$/i.test(escape)) {
      throw new Error(`Malformed redirect ${kind} at line ${line}: ${value}`);
    }
  }
}

function ruleMatches(rule, pathname) {
  if (!rule.from.endsWith('/*')) return normalizeRoute(rule.from) === normalizeRoute(pathname);
  return pathname.startsWith(rule.from.slice(0, -1));
}

function applyRule(rule, pathname) {
  if (!rule.from.endsWith('/*')) return rule.to;
  const remainder = pathname.slice(rule.from.length - 1);
  return rule.to.replace(':splat', remainder);
}

function firstMatch(rules, pathname) {
  const rule = rules.find((candidate) => ruleMatches(candidate, pathname));
  return rule ? {rule, target: applyRule(rule, pathname)} : null;
}

function staticSection(text) {
  const match = text.match(/#\s*section:\s*static\s*<<\s*START([\s\S]*?)#\s*section:\s*static\s*<<\s*END/);
  if (!match) throw new Error('Missing generated static section markers');
  return match[1];
}

function assertNoPublishedRedirects(publishDir) {
  const redirectsFile = path.join(publishDir, '_redirects');
  if (fs.existsSync(redirectsFile)) {
    throw new Error(`Published _redirects would precede netlify.toml: ${redirectsFile}`);
  }
}

function verifyRedirectGraph({netlifyPath, staticPath, publishDir, policyPath, publishedRoutes}) {
  const netlifyText = fs.readFileSync(netlifyPath, 'utf8');
  const staticText = fs.readFileSync(staticPath, 'utf8');
  if (staticSection(netlifyText) !== staticSection(staticText)) {
    throw new Error('Generated netlify.toml static section differs from static.toml');
  }
  const rules = parseRedirects(netlifyText);
  const routes = publishedRoutes || routeSet(publishDir);
  assertNoPublishedRedirects(publishDir);
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  const identities = new Map();

  for (const rule of rules) {
    validateSource(rule);
    const identity = normalizeRoute(rule.from);
    const previous = identities.get(identity);
    if (previous) {
      const kind = normalizeRoute(previous.to) === normalizeRoute(rule.to) ? 'Duplicate' : 'Conflicting';
      throw new Error(`${kind} redirect identity ${identity} at lines ${previous.line} and ${rule.line}`);
    }
    identities.set(identity, rule);
  }

  const indexedExact = new Map();
  const indexedWildcards = [];
  rules.forEach((rule, index) => {
    if (rule.from.endsWith('/*')) indexedWildcards.push({rule, index});
    else indexedExact.set(normalizeRoute(rule.from), {rule, index});
  });
  const matchRedirect = (pathname) => {
    let match = indexedExact.get(normalizeRoute(pathname));
    for (const candidate of indexedWildcards) {
      if ((!match || candidate.index < match.index) && ruleMatches(candidate.rule, pathname)) {
        match = candidate;
      }
    }
    return match ? {rule: match.rule, target: applyRule(match.rule, pathname)} : null;
  };

  const earlierWildcards = [];
  for (let index = 0; index < rules.length; index += 1) {
    const rule = rules[index];
    for (const earlier of earlierWildcards) {
      if (earlier.from.endsWith('/*') && ruleMatches(earlier, rule.from.replace(/\*$/, 'counterexample'))) {
        throw new Error(`Redirect at line ${rule.line} is shadowed by wildcard at line ${earlier.line}`);
      }
    }
    if (!rule.from.endsWith('/*') && routes.has(normalizeRoute(rule.from))) {
      throw new Error(`Redirect source shadows rendered route: ${rule.from}`);
    }
    if (!rule.to.startsWith('/')) continue;
    if (!rule.to.includes(':splat')) {
      const target = normalizeRoute(rule.to);
      const next = matchRedirect(target);
      if (next) throw new Error(`Redirect chain or cycle: ${rule.from} -> ${rule.to} -> ${next.target}`);
      if (!routes.has(target)) throw new Error(`Redirect target does not render: ${rule.from} -> ${rule.to}`);
    }
    if (rule.from.endsWith('/*')) earlierWildcards.push(rule);
  }

  const wildcardRules = rules.filter((rule) => rule.from.endsWith('/*'));
  for (const route of routes) {
    const shadow = wildcardRules.find((rule) => ruleMatches(rule, route));
    if (shadow) throw new Error(`Wildcard redirect source shadows rendered route: ${shadow.from} matches ${route}`);
  }
  for (const rule of wildcardRules) {
    const counterexample = `${rule.from.slice(0, -1)}__redirect_graph_counterexample__`;
    const target = applyRule(rule, counterexample);
    const next = target.startsWith('/') ? matchRedirect(normalizeRoute(target)) : null;
    if (next) throw new Error(`Wildcard redirect chain or cycle: ${counterexample} -> ${target} -> ${next.target}`);
  }

  for (const source of policy.retired_wildcard_sources) {
    if (rules.some((rule) => rule.from === source)) throw new Error(`Retired wildcard returned: ${source}`);
  }
  if (
    policy.required_exact_redirects.length !== 27 ||
    new Set(policy.required_exact_redirects.map(([source]) => source)).size !== 27
  ) {
    throw new Error('Dead-target repair inventory must contain exactly 27 unique exact redirects');
  }
  for (const [source, expected] of policy.required_exact_redirects) {
    const match = matchRedirect(source);
    if (!match || match.rule.from !== source || normalizeRoute(match.target) !== normalizeRoute(expected)) {
      throw new Error(`Required exact redirect is missing or wrong: ${source} -> ${expected}`);
    }
  }
  for (const [source, expected] of policy.archived_wildcard_requests) {
    const match = matchRedirect(source);
    if (!match || match.rule.from !== source || normalizeRoute(match.target) !== normalizeRoute(expected)) {
      throw new Error(`Archived wildcard request is missing its exact terminal redirect: ${source} -> ${expected}`);
    }
  }
  for (const [source, expected] of policy.same_class_exact_redirects) {
    const match = matchRedirect(source);
    if (!match || match.rule.from !== source || normalizeRoute(match.target) !== normalizeRoute(expected)) {
      throw new Error(`Same-class redirect repair is missing or wrong: ${source} -> ${expected}`);
    }
  }
  const retiredSources = new Set(policy.retired_wildcard_sources);
  if (retiredSources.size !== 7 || policy.archived_wildcard_requests.length !== 6) {
    throw new Error('Wildcard repair inventory must retain seven unique classes and six archived requests');
  }
  const noArchivedRequest = new Set(policy.archive_evidence.retired_rules_with_no_archived_request);
  for (const source of noArchivedRequest) {
    if (!retiredSources.has(source)) throw new Error(`Archive evidence names a non-retired wildcard: ${source}`);
  }
  for (const source of retiredSources) {
    const hasArchivedRequest = policy.archived_wildcard_requests.some(([request]) =>
      ruleMatches({from: source}, request),
    );
    if (!hasArchivedRequest && !noArchivedRequest.has(source)) {
      throw new Error(`Retired wildcard lacks archived request disposition: ${source}`);
    }
  }
  for (const [request] of policy.archived_wildcard_requests) {
    if (![...retiredSources].some((source) => ruleMatches({from: source}, request))) {
      throw new Error(`Archived request is not owned by a retired wildcard: ${request}`);
    }
  }

  const flows = policy.network_flows;
  if (flows.historical_suffixes.length !== 42 || new Set(flows.historical_suffixes).size !== 42) {
    throw new Error('Network Flows historical inventory must contain exactly 42 unique routes');
  }
  for (const suffix of flows.historical_suffixes) {
    const source = flows.source_prefix + suffix;
    const expected = flows.target_prefix + suffix;
    const match = matchRedirect(source);
    if (!match || normalizeRoute(match.target) !== normalizeRoute(expected) || !routes.has(normalizeRoute(expected))) {
      throw new Error(`Historical Network Flows route is not terminal: ${source} -> ${expected}`);
    }
  }
  const adjacent = `${flows.source_prefix}-archive/example`;
  if (matchRedirect(adjacent)) throw new Error(`Network Flows wildcard matches adjacent prefix: ${adjacent}`);

  return {rules: rules.length, routes: routes.size, historicalRoutes: flows.historical_suffixes.length};
}

if (require.main === module) {
  try {
    const result = verifyRedirectGraph({
      netlifyPath: path.resolve(process.argv[2] || 'netlify.toml'),
      staticPath: path.resolve(process.argv[3] || 'static.toml'),
      publishDir: path.resolve(process.argv[4] || 'build'),
      policyPath: path.resolve(process.argv[5] || 'config/redirect-policy.json'),
    });
    console.log(`Verified ${result.rules} redirects against ${result.routes} published routes and ${result.historicalRoutes} historical Network Flows routes.`);
  } catch (error) {
    console.error(`Redirect graph verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  applyRule,
  assertNoPublishedRedirects,
  firstMatch,
  normalizeRoute,
  parseRedirects,
  routeSet,
  ruleMatches,
  validateSource,
  verifyRedirectGraph,
};
