/*! prana-attribution.js v2 (restore-URL mode) - PROPOSED, NOT DEPLOYED. First-party marketing attribution persistence for pranadentalmiami.com.
 *  What it does: captures UTM / click-id / platform-id parameters on ANY landing page, keeps first-touch + last-touch (90 days, first-party cookie on the root domain),
 *  and appends them to GoHighLevel form / calendar / chat iframes so hidden fields in GHL are filled on submit.
 *  What it never does: read form input, health information, names, phones or emails; make network requests; set third-party cookies.
 *  GHL side: each key returned by hiddenFields() must exist as a hidden custom field whose query key equals the key (see schemas/ghl_fields_required.json).
 *  Load with <script src="/prana-attribution.js" defer></script> in <head> of EVERY page (before the GHL embed script). Default mode: restore-URL (no GHL custom fields needed). Set window.PRANA_ATTR_IFRAME=true before loading to ALSO append hidden-field params to GHL iframes. */
(function (root) {
  'use strict';
  var VERSION = 1, RESTORE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'], COOKIE = 'prana_attr', DAYS = 90, MAX_VAL = 200;
  var MARKETING = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid'];
  var PLATFORM = ['campaignid', 'adgroupid', 'creative', 'keyword', 'matchtype', 'network', 'device', 'placement', 'campaign_id', 'adset_id', 'ad_id', 'site_source_name'];
  var CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid'];
  var PLATFORM_FIELD = { campaignid: 'g_campaign_id', adgroupid: 'g_adgroup_id', creative: 'g_creative_id', keyword: 'g_keyword', matchtype: 'g_matchtype', network: 'g_network', device: 'g_device',
                         campaign_id: 'm_campaign_id', adset_id: 'm_adset_id', ad_id: 'm_ad_id', site_source_name: 'm_site_source' };
  var META_SOURCES = { facebook: 1, fb: 1, instagram: 1, ig: 1, meta: 1 };

  /* HTTPS canonicalisation: http -> https on the real domain only (never localhost/IPs); path, query (utm/gclid/fbclid) and hash are preserved. Pure: location-like -> target or ''. */
  function httpsTarget(l) {
    if (!l || l.protocol !== 'http:' || /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(l.hostname || '') || /\.(local|test|localhost)$/.test(l.hostname || '')) return '';
    return 'https://' + l.host + l.pathname + (l.search || '') + (l.hash || '');
  }

  function clean(v) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>"']/g, '').trim().slice(0, MAX_VAL); }

  function parseQuery(search) {
    var out = {}, q = String(search || '').replace(/^\?/, '');
    if (!q) return out;
    q.split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i < 1) return;
      var k, v;
      try { k = decodeURIComponent(kv.slice(0, i)).toLowerCase(); v = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) { return; }
      if ((MARKETING.indexOf(k) >= 0 || PLATFORM.indexOf(k) >= 0) && clean(v)) out[k] = clean(v);
    });
    return out;
  }

  function hostOf(u) { var m = /^https?:\/\/([^\/?#:]+)/i.exec(u || ''); return m ? m[1].toLowerCase().replace(/^www\./, '') : ''; }
  function iso(now) { return new Date(now).toISOString(); }

  function snapshot(params, page, referrer, now, ownHost) {
    var refHost = hostOf(referrer), external = refHost && refHost !== ownHost;
    var s = { source: params.utm_source || '', medium: params.utm_medium || '', campaign: params.utm_campaign || '', content: params.utm_content || '', term: params.utm_term || '',
              landing_page: String(page || '').split(/[?#]/)[0].slice(0, MAX_VAL), referrer: external ? refHost : '', ts: iso(now) };
    if (!s.source) {
      if (params.gclid || params.gbraid || params.wbraid) { s.source = 'google'; s.medium = s.medium || 'cpc'; }
      else if (params.fbclid) { s.source = 'facebook'; s.medium = s.medium || 'paid_social'; }
      else if (external) {
        var se = /(^|\.)(google|bing|duckduckgo|yahoo)\.[a-z.]+$/.exec(refHost), so = /(^|\.)(facebook|instagram|tiktok|youtube|linkedin|pinterest)\.com$/.exec(refHost);
        if (/(chatgpt|perplexity|claude\.ai|gemini\.google|copilot)/.test(refHost)) { s.source = refHost; s.medium = 'referral'; }
        else if (se) { s.source = se[2]; s.medium = 'organic'; }
        else if (so) { s.source = so[2]; s.medium = 'social'; }
        else { s.source = refHost; s.medium = 'referral'; }
      }
      else { s.source = '(direct)'; s.medium = '(none)'; }
    }
    return s;
  }

  function hasTouch(params, page, referrer, ownHost) {
    var h = hostOf(referrer);
    return MARKETING.some(function (k) { return params[k]; }) || PLATFORM.some(function (k) { return params[k]; }) || (h && h !== ownHost);
  }

  /* state: {v, ft, lt, ids:{gclid:{v,ts}}, plat:{...}} -> new state. Pure. */
  function merge(state, params, page, referrer, now, ownHost) {
    var st = state && state.v === VERSION ? JSON.parse(JSON.stringify(state)) : { v: VERSION, ft: null, lt: null, ids: {}, plat: {} };
    var touch = hasTouch(params, page, referrer, ownHost), snap = snapshot(params, page, referrer, now, ownHost);
    if (!st.ft || (st.ft.source === '(direct)' && touch)) st.ft = snap;           // a real touch upgrades a direct first visit
    if (touch) st.lt = snap;
    CLICK_IDS.forEach(function (k) { if (params[k]) st.ids[k] = { v: params[k], ts: iso(now) }; });
    Object.keys(st.ids).forEach(function (k) { if (now - Date.parse(st.ids[k].ts) > DAYS * 864e5) delete st.ids[k]; });   // Google accepts click ids <= 90 days
    PLATFORM.forEach(function (k) { if (params[k]) st.plat[k] = params[k]; });
    return st;
  }

  function cookieVal(cookies, name) { var m = new RegExp('(?:^|;\\s*)' + name + '=([^;]*)').exec(cookies || ''); return m ? decodeURIComponent(m[1]) : ''; }

  /* flat map of GHL hidden-field keys -> values (empty values omitted). Pure. */
  function hiddenFields(st, cookies) {
    var f = {}, put = function (k, v) { if (v) f[k] = clean(v); };
    if (st && st.ft) { put('ft_source', st.ft.source); put('ft_medium', st.ft.medium); put('ft_campaign', st.ft.campaign); put('ft_content', st.ft.content); put('ft_term', st.ft.term);
                       put('ft_landing_page', st.ft.landing_page); put('ft_referrer', st.ft.referrer); put('ft_ts', st.ft.ts); }
    if (st && st.lt) { put('lt_source', st.lt.source); put('lt_medium', st.lt.medium); put('lt_campaign', st.lt.campaign); put('lt_content', st.lt.content); put('lt_term', st.lt.term);
                       put('lt_landing_page', st.lt.landing_page); put('lt_ts', st.lt.ts); }
    var ids = (st && st.ids) || {}, latest = '';
    CLICK_IDS.forEach(function (k) { if (ids[k]) { put(k, ids[k].v); if (ids[k].ts > latest) latest = ids[k].ts; } });
    put('click_id_ts', latest);
    var fbc = cookieVal(cookies, '_fbc') || (ids.fbclid ? 'fb.1.' + Date.parse(ids.fbclid.ts) + '.' + ids.fbclid.v : '');
    put('fbc', fbc); put('fbp', cookieVal(cookies, '_fbp'));
    var ga = /^GA\d\.\d\.(.+)$/.exec(cookieVal(cookies, '_ga')); put('ga_client_id', ga ? ga[1] : '');
    var plat = (st && st.plat) || {}, meta = st && st.lt && META_SOURCES[String(st.lt.source).toLowerCase()];
    Object.keys(plat).forEach(function (k) { if (PLATFORM_FIELD[k]) put(PLATFORM_FIELD[k], plat[k]); });
    if (plat.placement) put(meta ? 'm_placement' : 'g_placement', plat.placement);
    return f;
  }

  /* append fields to a URL without overwriting any param already present. Pure. */
  function withParams(url, fields) {
    var hash = '', h = String(url).indexOf('#'); if (h >= 0) { hash = url.slice(h); url = url.slice(0, h); }
    var have = {}, q = url.indexOf('?') >= 0 ? url.slice(url.indexOf('?') + 1) : '';
    q.split('&').forEach(function (kv) { if (kv) have[decodeURIComponent(kv.split('=')[0])] = 1; });
    var add = Object.keys(fields).filter(function (k) { return !have[k]; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(fields[k]); });
    if (!add.length) return url + hash;
    return url + (url.indexOf('?') >= 0 ? (/[?&]$/.test(url) ? '' : '&') : '?') + add.join('&') + hash;
  }

  /* restore-URL mode (default): when the CURRENT page carries no marketing params but a stored touch exists, return the query string that re-adds them, so GHL's native
     attribution (which reads the parent page URL at submit time) still sees the click id + UTMs. Pure: (state, currentSearch) -> new search string ('' when nothing to do). */
  function restoreQuery(st, search) {
    var cur = parseQuery(search);
    if (MARKETING.some(function (k) { return cur[k]; }) || PLATFORM.some(function (k) { return cur[k]; })) return '';   // page already has its own params: never touch
    if (!st) return '';
    var t = st.lt || st.ft, add = {};
    if (t && t.source && t.source !== '(direct)') { add.utm_source = t.source; if (t.medium && t.medium !== '(none)') add.utm_medium = t.medium; if (t.campaign) add.utm_campaign = t.campaign; if (t.content) add.utm_content = t.content; if (t.term) add.utm_term = t.term; }
    Object.keys(st.ids || {}).forEach(function (k) { add[k] = st.ids[k].v; });
    Object.keys(st.plat || {}).forEach(function (k) { add[k] = st.plat[k]; });
    var keys = Object.keys(add); if (!keys.length) return '';
    var base = String(search || '').replace(/^\?/, '');
    return '?' + (base ? base + '&' : '') + keys.map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(add[k]); }).join('&');
  }

  var api = { version: VERSION, _pure: { httpsTarget: httpsTarget, parseQuery: parseQuery, restoreQuery: restoreQuery, merge: merge, hiddenFields: hiddenFields, withParams: withParams, snapshot: snapshot, hasTouch: hasTouch } };

  /* ---------- browser glue (only runs where document exists) ---------- */
  function rootDomain(h) { var p = h.split('.'); return p.length > 2 ? p.slice(-2).join('.') : h; }
  function cookieDomain(h) { return (/^[\d.]+$/.test(h) || h.indexOf('.') < 0) ? '' : 'domain=.' + rootDomain(h) + ';'; }
  function load() {
    try { var m = new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]*)').exec(document.cookie); if (m) return JSON.parse(decodeURIComponent(m[1])); } catch (e) {}
    try { return JSON.parse(root.localStorage.getItem(COOKIE) || 'null'); } catch (e) { return null; }
  }
  function save(st) {
    var raw = JSON.stringify(st);
    try { document.cookie = COOKIE + '=' + encodeURIComponent(raw) + ';max-age=' + DAYS * 86400 + ';path=/;' + cookieDomain(location.hostname) + 'SameSite=Lax' + (location.protocol === 'https:' ? ';Secure' : ''); } catch (e) {}
    try { root.localStorage.setItem(COOKIE, raw); } catch (e) {}
  }
  function decorate() {
    var st = api.state, f = hiddenFields(st, document.cookie);
    Array.prototype.forEach.call(document.querySelectorAll('iframe[src*="leadconnectorhq.com/widget/"], iframe[src*="msgsndr.com/widget/"]'), function (fr) {
      var next = withParams(fr.getAttribute('src'), f); if (next !== fr.getAttribute('src')) fr.setAttribute('src', next);
    });
  }
  function init() {
    try {
      if (root.PRANA_ATTR_CONSENT === false) return;                    // site can gate storage on a consent banner
      api.state = merge(load(), parseQuery(location.search), location.href, document.referrer, Date.now(), location.hostname.replace(/^www\./, ''));
      save(api.state);
      var rq = restoreQuery(api.state, location.search);
      if (rq && root.history && root.history.replaceState) root.history.replaceState(root.history.state, '', location.pathname + rq + location.hash);   // no reload, no navigation
      if (root.PRANA_ATTR_IFRAME === true) decorate();                    // optional second channel (hidden-field mode); off by default
      if (root.PRANA_ATTR_IFRAME === true && root.MutationObserver) new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
      api.get = function () { return hiddenFields(api.state, document.cookie); };
    } catch (e) { /* never break the page */ }
  }
  root.PranaAttribution = api;
  try { if (typeof location !== 'undefined') { var ht = httpsTarget(location); if (ht) { location.replace(ht); return; } } } catch (e) {}
  if (typeof document !== 'undefined' && document.addEventListener) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})(typeof window !== 'undefined' ? window : this);
