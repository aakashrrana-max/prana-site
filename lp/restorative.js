/*! lp/restorative.js - shared behavior for the crowns + bridges ad landing pages.
 *  Needs /pl-events.js (GA4, Google Ads conversions, Meta, GHL tracking) and /prana-attribution.js on the page.
 *  Page config: window.LP = { source, service, serviceInterest }. A/B variant classes are set by the inline <head> script (window.LP_VARIANT).
 *  PRIVACY: ad-platform events carry only the CTA position, step and variant. The visitor's concern, name, phone and email go to GHL only. */
(function () {
  'use strict';
  var LP = window.LP || {};
  var WEBHOOK = 'https://services.leadconnectorhq.com/hooks/qxdMI6WF2uNxt7goL1jY/webhook-trigger/cfdb9b4e-d393-48b0-920b-e9a12e91fb69';
  var FALLBACK_FORM = 'https://api.leadconnectorhq.com/widget/form/mDpUSOrNwxC8qu8w8aRH';
  var variant = window.LP_VARIANT || 'h=problem|hero=price|cta=form';
  var isBook = document.documentElement.classList.contains('cta-book');

  function ev(name, params) {
    var p = params || {}; p.lp_variant = variant; p.lp_page = LP.source || '';
    /* Standard events (Contact) go to Meta + Google; page-level analytics events stay in GA4/dataLayer only. */
    try { if (window.PranaEvents) return window.PranaEvents.standard[name] ? window.PranaEvents.track(name, p) : window.PranaEvents.trackNonMeta(name, p); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push({ event: name, event_params: p }); } catch (e) {}
  }
  function uuid() {
    try { if (window.PranaEvents && window.PranaEvents.uuid) return window.PranaEvents.uuid(); } catch (e) {}
    return 'lp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* Which test cell this visitor saw (GA4 can segment every later event by lp_variant). */
  ev('lp_view', {});

  /* CTA clicks by position. tel: and wa.me taps are already sent as Contact by pl-events.js; SMS taps are added here. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (a) ev('lp_cta_click', { cta: a.getAttribute('data-cta'), cta_type: /^tel:/.test(a.getAttribute('href') || '') ? 'call' : /^sms:/.test(a.getAttribute('href') || '') ? 'sms' : /^https?:/.test(a.getAttribute('href') || '') ? 'link' : (a.hasAttribute('data-book') || isBook) ? 'book' : 'form' });
    var s = e.target && e.target.closest ? e.target.closest('a[href^="sms:"]') : null;
    if (s) ev('Contact', { method: 'sms' });
    /* Jump to the form, then put the cursor in the first field. */
    var j = e.target && e.target.closest ? e.target.closest('a[href="#consult"]') : null;
    /* Booking-first cell: every "book" button opens the booking popup (book.js) instead of scrolling to a form. */
    if (j && isBook && typeof window.pranaBook === 'function') { e.preventDefault(); e.stopPropagation(); window.pranaBook(); return; }
    if (j) {
      var card = document.getElementById('consult');
      if (card) { e.preventDefault(); card.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        var first = card.querySelector('input:not(.hp),select'); if (first) setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (x) { first.focus(); } }, 450); }
    }
  }, true);

  /* FAQ opens: which questions people care about (index only). */
  Array.prototype.forEach.call(document.querySelectorAll('.faq details'), function (d, i) {
    d.addEventListener('toggle', function () { if (d.open) ev('lp_faq_open', { faq: d.getAttribute('data-faq') || String(i + 1) }); });
  });

  /* Sticky mobile CTA: hidden while the hero buttons or the form are on screen. */
  var bar = document.querySelector('.mbar'), heroCta = document.querySelector('.hero .cta-row'), formEl = document.getElementById('consult');
  if (bar && 'IntersectionObserver' in window) {
    var vis = { hero: true, form: false };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.target === heroCta) vis.hero = x.isIntersecting; if (x.target === formEl) vis.form = x.isIntersecting; });
      bar.classList.toggle('on', !vis.hero && !vis.form);
    }, { threshold: 0 });
    if (heroCta) io.observe(heroCta); if (formEl) io.observe(formEl);
  } else if (bar) bar.classList.add('on');

  /* ---- Short consult form -> GHL inbound webhook (same hook as the booking popup and quiz pages) ---- */
  var form = document.getElementById('lp-form');
  if (!form) return;
  var card = form.closest('.formcard'), started = false;
  form.addEventListener('focusin', function () { if (!started) { started = true; ev('lp_form_start', {}); } });

  /* Tie each error message to its field for screen readers. */
  Array.prototype.forEach.call(form.querySelectorAll('.field'), function (f) { var i = f.querySelector('input,select'), m = f.querySelector('.err-msg'); if (i && m) { m.id = i.id + '-err'; i.setAttribute('aria-describedby', m.id); } });
  /* Clear a field's error as soon as the visitor fixes it. */
  form.addEventListener('input', function (e) { var f = e.target.closest && e.target.closest('.field.bad'); if (f) { f.classList.remove('bad'); e.target.setAttribute('aria-invalid', 'false'); } });
  form.addEventListener('change', function (e) { var f = e.target.closest && e.target.closest('.field.bad'); if (f && e.target.value) { f.classList.remove('bad'); e.target.setAttribute('aria-invalid', 'false'); } });

  function field(name) { return form.querySelector('[name="' + name + '"]'); }
  function check(name, ok) { var f = field(name).closest('.field'); f.classList.toggle('bad', !ok); field(name).setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (field('company') && field('company').value) return; /* honeypot */
    var name = field('name').value.trim(), phone = field('phone').value.trim(), email = (field('email') ? field('email').value.trim() : ''), concern = field('concern').value;
    var ok = check('name', name.length > 1);
    ok = check('phone', phone.replace(/\D/g, '').length >= 10) && ok;
    if (field('email')) ok = check('email', !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) && ok;
    ok = check('concern', !!concern) && ok;
    if (!ok) { ev('lp_form_invalid', {}); var bad = form.querySelector('.bad input,.bad select'); if (bad) bad.focus(); return; }

    var btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = 'Sending…';
    var parts = name.split(/\s+/), id = uuid();
    var body = { name: name, first_name: parts[0] || '', last_name: parts.slice(1).join(' '), firstName: parts[0] || '', lastName: parts.slice(1).join(' '),
      phone: phone, email: email, service: LP.service || 'Crowns & bridges', treatment_interest: concern, source: LP.source || 'lp-restorative',
      page: location.pathname, language: 'en', lp_variant: variant, sms_consent: 'yes (consent text shown on form)' };
    try { if (window.PranaEvents) { var pf = window.PranaEvents.payloadFields(); for (var k in pf) body[k] = pf[k]; } } catch (x) {}
    if (LP.serviceInterest) body.service_interest = LP.serviceInterest;
    body.event_id = id; body.pl_event_id = id;

    fetch(WEBHOOK, { method: 'POST', mode: 'cors', credentials: 'omit', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        /* Conversion fires only after GHL accepted the lead. Same event id on Meta + Google for dedupe. */
        try { window.fbq && window.fbq('track', 'Lead', { content_name: 'Consult request' }, { eventID: id }); } catch (x) {}
        try { if (window.PranaEvents) window.PranaEvents.trackNonMeta('Lead', { content_name: 'Consult request', lp_variant: variant, lp_page: LP.source || '' }, id); } catch (x) {}
        card.classList.add('sent');
        var d = card.querySelector('.done'); if (d) { d.setAttribute('tabindex', '-1'); d.focus(); }
      })
      .catch(function () {
        ev('lp_form_error', {});
        btn.disabled = false; btn.textContent = btn.getAttribute('data-label') || 'Send';
        var fb = card.querySelector('.fallback');
        if (fb && !fb.firstChild) fb.innerHTML = '<p class="cta-note" role="alert">That didn\'t send. Please call <a href="tel:+17865790521">(786) 579-0521</a>, or use this form:</p><iframe title="Consultation request form" src="' + FALLBACK_FORM + '"></iframe>';
      });
  });
})();
