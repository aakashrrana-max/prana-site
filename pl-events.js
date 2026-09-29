/*! pl-events.js v2 - conversion events + Google tag loader for pranadentalmiami.com. Complements /prana-attribution.js (does NOT capture attribution).
 *  - Standard Meta events (Lead / Contact / Schedule) + GA4 events + optional Google Ads conversions, one shared event id (Conversions API dedupe).
 *  - Phone and WhatsApp taps => Contact event (calls are the main lead channel).
 *  - Google tag: loads ONLY when an id is set below; empty = no request, no cookie, no change to the page.
 *  PRIVACY: event params never carry names, phones, emails, page names or health details. */
(function (root) {
  'use strict';
  /* ---- OWNER SETTINGS: the only place to edit when the Google accounts exist ---- */
  var SETTINGS = { ga4: 'G-6KP15B68YK', ads: '', privacy: true, adsConversions: { Lead: '', Contact: '', Schedule: '' } };   /* Google Ads later: ads: 'AW-123456789', Lead: 'AW-123456789/AbCdEfGh'. privacy:true = Google signals + ad personalization OFF (healthcare-safe default) */
  var cfg = root.PranaTrackingConfig || SETTINGS;
  var STANDARD = { Lead: 'generate_lead', Contact: 'contact', Schedule: 'schedule_appointment' };
  var ORIGINAL_HREF = root.location ? root.location.href : '';   /* captured BEFORE the attribution script restores params into the URL */
  function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }); }
  var lastId = uuid(), sent = {}, api = { standard: STANDARD, uuid: uuid };

  /* ---- Google tag: ONE loader per page, ONE config per id. Skipped if any other gtag.js/GTM is already present (no duplicate tags). ---- */
  var ga = /^(G|AW)-[A-Z0-9]{6,}$/i;
  if (typeof document !== 'undefined' && (ga.test(cfg.ga4 || '') || ga.test(cfg.ads || ''))) {
    var already = root.__plGtag || document.querySelector('script[src*="googletagmanager.com/gtag/js"], script[src*="googletagmanager.com/gtm.js"]');
    root.dataLayer = root.dataLayer || [];
    if (!root.gtag) root.gtag = function () { root.dataLayer.push(arguments); };
    if (!already) {
      root.__plGtag = 1;
      var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga.test(cfg.ga4 || '') ? cfg.ga4 : cfg.ads);
      document.head.appendChild(s);
      root.gtag('js', new Date());
      var priv = cfg.privacy === false ? {} : { allow_google_signals: false, allow_ad_personalization_signals: false };
      if (ga.test(cfg.ga4 || '')) { var c = { page_location: ORIGINAL_HREF }; for (var k in priv) c[k] = priv[k]; root.gtag('config', cfg.ga4, c); }
      if (ga.test(cfg.ads || '')) root.gtag('config', cfg.ads, priv);
    }
  }

  function conv(name, id) {
    var label = (cfg.adsConversions || {})[name];
    if (label && /^AW-[0-9]+\/[A-Za-z0-9_-]+$/.test(label) && root.gtag) root.gtag('event', 'conversion', { send_to: label, transaction_id: id });
  }
  function copy(o) { var p = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) p[k] = o[k]; return p; }

  /** Google/GA4 + dataLayer only (used when the caller already sent the Meta event, e.g. the booking popup). */
  api.trackNonMeta = function (name, params, id) {
    params = params || {}; id = id || uuid(); lastId = id;
    try { if (root.gtag) { var p = copy(params); p.event_id = id; root.gtag('event', STANDARD[name] || name, p); conv(name, id); } } catch (e) {}
    try { (root.dataLayer = root.dataLayer || []).push({ event: STANDARD[name] || name, event_id: id, event_params: params }); } catch (e) {}
    return id;
  };
  /** Meta + Google + dataLayer. Lead/Contact/Schedule are the platforms' standard events; anything else is custom. Returns the event id. */
  api.track = function (name, params) {
    params = params || {}; var id = uuid(); lastId = id;
    try { if (root.fbq) { if (STANDARD[name]) root.fbq('track', name, params, { eventID: id }); else root.fbq('trackCustom', name, params, { eventID: id }); } } catch (e) {}
    api.trackNonMeta(name, params, id);
    return id;
  };
  api.lastEventId = function () { return lastId; };
  /** Attribution for webhook payloads (from the deployed script) + event id. Empty attribution if the script is missing or consent-blocked. */
  api.payloadFields = function () {
    var a = {};
    try { if (root.PranaAttribution && typeof root.PranaAttribution.get === 'function') a = root.PranaAttribution.get() || {}; } catch (e) {}
    var o = copy(a); o.pl_event_id = lastId; o.page_path = (root.location && root.location.pathname) || '';
    try { o.page_url = String(root.location.href).split('#')[0]; o.referrer = (root.document && root.document.referrer) || ''; } catch (e) {}
    return o;
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a) return;
      var h = a.getAttribute('href') || '';
      if (/^tel:/i.test(h)) api.track('Contact', { method: 'phone' });
      else if (/wa\.me|api\.whatsapp\.com/i.test(h)) api.track('Contact', { method: 'whatsapp' });
    }, true);
    /* GHL iframe form submitted: message names are UNVERIFIED (GHL does not document them). Harmless if none match. */
    root.addEventListener('message', function (e) {
      var host = (/^https?:\/\/([^\/]+)/.exec(e.origin || '') || [0, ''])[1];
      if (!/(^|\.)(leadconnectorhq|msgsndr)\.com$/.test(host)) return;
      var d = e.data, m = typeof d === 'string' ? d : (d && (d.type || d.event || d.action)) || '';
      if (/form[-_ ]?submit|submitted|lead[-_ ]?captured/i.test(String(m)) && !sent.lead) { sent.lead = 1; api.track('Lead', {}); }
    });
  }
  root.PranaEvents = api;
})(typeof window !== 'undefined' ? window : this);
