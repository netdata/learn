/* Whole-observation URL projection. Storage and SDK identity remain producer-owned. */
(function (root) {
  'use strict';
  var LIMIT = 3800;
  var LIFETIME = 7776000000;
  var SURFACES = ['website', 'learn', 'community', 'app', 'agent'];
  var FIELDS = ['referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ts'];
  var LEGACY = ['landing_page'].concat(FIELDS);
  var owns = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };
  var object = function (value) { return value !== null && typeof value === 'object' && !Array.isArray(value); };

  function time(value) {
    var date = new Date(value);
    return typeof value === 'string' && Number.isFinite(date.getTime()) && date.toISOString() === value
      ? date.getTime() : NaN;
  }

  function referrer(value) {
    if (!value) return '';
    try {
      if (value.trim() !== value || /[\\\u0000-\u0020\u007f]/.test(value)) return null;
      var url = new URL(value.split(/[?#]/, 1)[0]);
      var host = url.hostname.toLowerCase().replace(/\.$/, '');
      if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port ||
          !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/.test(host) ||
          /(^|\.)(localhost|local|internal|intranet|lan|home|test|invalid|onion)$/.test(host) ||
          ((host === 'netdata.cloud' || host.endsWith('.netdata.cloud')) &&
            ['www.netdata.cloud', 'learn.netdata.cloud'].indexOf(host) === -1 && url.pathname !== '/')) return null;
      return url.href;
    } catch (e) { return null; }
  }

  function entry(value, now) {
    if (!object(value) || SURFACES.indexOf(value.surface) === -1 ||
        typeof value.path !== 'string' || !/^\/(?!\/)[^?#\\\u0000-\u0020\u007f]*$/.test(value.path) ||
        FIELDS.some(function (key) { return owns(value, key) && typeof value[key] !== 'string'; })) return null;
    var stamp = time(value.ts);
    if (!Number.isFinite(stamp) || stamp > now || stamp + LIFETIME <= now) return null;
    var result = { surface: value.surface, path: value.path };
    FIELDS.forEach(function (key) { result[key] = value[key] || ''; });
    result.referrer = referrer(result.referrer);
    if (result.referrer === null) return null;
    if (owns(value, 'identities')) {
      if (!Array.isArray(value.identities) || value.identities.length > 5 || !value.identities.every(function (identity) {
        return object(identity) && ['distinct_id', 'project_token'].every(function (key) {
          return typeof identity[key] === 'string' && identity[key].length > 0 && identity[key].trim() === identity[key];
        }) && SURFACES.indexOf(identity.surface) !== -1 &&
          ['anonymous', 'identified'].indexOf(identity.status) !== -1 && Number.isFinite(time(identity.observed_at));
      })) return null;
      result.identities = value.identities.map(function (identity) {
        var projected = {};
        ['distinct_id', 'project_token', 'surface', 'status', 'observed_at'].forEach(function (key) { projected[key] = identity[key]; });
        return projected;
      });
    }
    return result;
  }

  function project(raw, now) {
    try {
      var data = raw;
      if (typeof raw === 'string') {
        try { data = JSON.parse(raw); }
        catch (e) { data = JSON.parse(decodeURIComponent(raw)); }
      }
      if (!object(data) || (owns(data, 'version') && data.version !== 1 && data.version !== 2)) return null;
      if (data.version === 2 && encodeURIComponent(JSON.stringify(data)).length > LIMIT) return null;
      now = now === undefined ? Date.now() : Number(now);
      if (!Number.isFinite(now)) return null;
      var historical = {};
      if (LEGACY.some(function (key) { return owns(data, key) && typeof data[key] !== 'string'; })) return null;
      LEGACY.forEach(function (key) { if (owns(data, key)) historical[key] = data[key]; });
      var website = Object.assign({}, historical, { surface: 'website', path: historical.landing_page });
      var selected = entry(data.version === 2 ? data.entry : website, now);
      if (!selected) return null;
      if (Object.keys(historical).some(function (key) { return Boolean(historical[key]); })) {
        var validated = entry(website, now);
        if (!validated) return null;
        if (owns(historical, 'referrer')) historical.referrer = validated.referrer;
      }
      var result = Object.assign(historical, { version: 2, entry: selected });
      return encodeURIComponent(JSON.stringify(result)).length <= LIMIT ? result : null;
    } catch (e) { return null; }
  }

  function decorate(href, projected) {
    try {
      var url = new URL(href);
      if (url.origin !== 'https://app.netdata.cloud' || url.username || url.password ||
          url.searchParams.has('nd_ft')) return href;
      var validated = project(projected);
      if (!validated) return href;
      var hashAt = href.indexOf('#');
      var beforeHash = hashAt < 0 ? href : href.slice(0, hashAt);
      var hash = hashAt < 0 ? '' : href.slice(hashAt);
      var result = beforeHash + (beforeHash.indexOf('?') < 0 ? '?' : /[?&]$/.test(beforeHash) ? '' : '&') +
        'nd_ft=' + encodeURIComponent(JSON.stringify(validated)) + hash;
      return new URL(result).href.length <= LIMIT ? result : href;
    } catch (e) { return href; }
  }

  root.ndFirstTouchHandoff = { project: project, decorate: decorate };
})(window);
