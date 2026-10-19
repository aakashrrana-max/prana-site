const puppeteer = require('puppeteer-core');
const BASE = 'http://127.0.0.1:8937/lp/emergency-dentist.html';
const HOOK = 'services.leadconnectorhq.com/hooks/';
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
async function page(b, q, opts = {}) {
  const p = await b.newPage();
  await p.setViewport({ width: opts.w || 375, height: 812, isMobile: (opts.w || 375) < 768, hasTouch: (opts.w || 375) < 768 });
  p.hookHits = [];
  await p.setRequestInterception(true);
  p.on('request', r => {
    const u = r.url();
    if (u.includes(HOOK)) { p.hookHits.push({ method: r.method(), body: r.postData() });
      if (r.method() === 'OPTIONS') return r.respond({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' } });
      return r.respond({ status: opts.hookStatus || 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{"status":"Success: test mock"}' }); }
    if (/facebook|googletagmanager|msgsndr|leadconnector|google\.com\/maps/.test(u)) return r.abort();
    r.continue();
  });
  await p.evaluateOnNewDocument(() => { window.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href^="tel:"],a[href^="sms:"],a[target=_blank]'); if (a) e.preventDefault(); }); });
  await p.goto(BASE + (q || ''), { waitUntil: 'networkidle0' });
  return p;
}
const events = p => p.evaluate(() => (window.dataLayer || []).map(x => x && x.event ? x.event : (x && x[0] === 'event' ? 'gtag:' + x[1] : null)).filter(Boolean));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  let p = await page(b, '');
  // tel links
  const tels = await p.$$eval('a[href^="tel:"]', as => as.map(a => a.getAttribute('href')));
  ok(tels.length >= 6 && tels.every(h => h === 'tel:+17865790521'), `tel links (${tels.length}) all tel:+17865790521`);
  const sizes = await p.$$eval('.btn', bs => bs.filter(b => b.offsetParent).map(b => b.getBoundingClientRect().height));
  ok(sizes.every(h => h >= 48), `visible buttons >= 48px tall (min ${Math.min(...sizes)})`);
  ok(await p.$eval('#mbar', e => getComputedStyle(e).display !== 'none'), 'sticky call bar visible at 375');
  ok(!(await p.evaluate(() => [...document.querySelectorAll("script[type=\"application/ld+json\"]")].some(s => /aggregateRating|reviewCount|ratingValue|"review"/.test(s.textContent)))), 'no rating/review schema');
  ok(await p.evaluate(() => !!window.PranaEvents && typeof gtag === 'function'), 'pl-events.js loaded (PranaEvents + gtag)');
  ok((await events(p)).includes('lp_view'), 'lp_view event');
  // call click
  await p.click('#mbar a[href^="tel:"]');
  let ev = await events(p);
  ok(ev.includes('click_to_call'), 'click_to_call event (GA4/dataLayer)');
  ok(await p.evaluate(() => dataLayer.some(x => x && x[0] === 'event' && x[1] === 'conversion' && /gq-zCNGmy6EdEKPTtOBE/.test(x[2].send_to))), 'Google Ads Contact conversion on call tap (pl-events)');
  ok(await p.evaluate(() => dataLayer.some(x => x && x.event === 'click_to_call' && x.event_params.cta_location === 'sticky' && x.event_params.lp_variant)), 'call event carries cta_location + lp_variant');
  // directions
  await p.click('.hero-more a[data-directions]');
  ok((await events(p)).includes('directions_click'), 'directions_click event');
  // request CTA scrolls to form
  await p.click('.hero-top a[data-req]'); await new Promise(r => setTimeout(r, 700));
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'f-name'), 'request CTA focuses the name field');
  // validation
  await new Promise(r => setTimeout(r, 2600));
  await p.click('#fsend');
  ok(await p.$eval('#e-name', e => e.textContent.length > 0), 'validation: empty name blocked');
  await p.type('#f-name', 'Test Fakeperson'); await p.type('#f-phone', '305555012');
  await p.click('#fsend');
  ok(await p.$eval('#e-phone', e => e.textContent.length > 0), 'validation: 9-digit phone blocked');
  ok((await events(p)).includes('form_start'), 'form_start event');
  await p.type('#f-phone', '3'); await p.select('#f-reason', 'Toothache');
  await p.click('#fsend'); await new Promise(r => setTimeout(r, 600));
  ev = await events(p);
  ok(p.hookHits.length === 0, 'localhost: nothing sent to GHL without live_submit=1');
  const pl = await p.evaluate(() => window.PE_lastPayload);
  ok(pl && pl.phone === '+13055550123' && pl.first_name === 'Test' && pl.service_interest === 'Emergency' && pl.source === 'lp-emergency' && pl.reason === 'Toothache', 'payload fields correct (E.164 phone, names, service_interest, source)');
  ok(ev.includes('form_submit') && ev.includes('gtag:generate_lead'), 'form_submit + generate_lead events');
  ok(await p.evaluate(() => dataLayer.some(x => x && x[0] === 'event' && x[1] === 'conversion' && /7b4lCJCMy6EdEKPTtOBE/.test(x[2].send_to))), 'Google Ads Lead conversion fired');
  ok(await p.$eval('#fdone', e => !e.hidden), 'success message shown');
  ok(!(await p.evaluate(() => dataLayer.some(x => x && x[0] === 'set' && x[1] === 'user_data'))), 'enhanced conversions off by default');
  await p.close();

  // live path with mocked webhook (never reaches GHL)
  p = await page(b, '?live_submit=1&gclid=TEST-GCLID-123&utm_source=google&utm_campaign=emerg-test');
  await new Promise(r => setTimeout(r, 2600));
  await p.type('#f-name', 'Test Fakeperson'); await p.type('#f-phone', '(305) 555-0123');
  await p.click('#fsend'); await new Promise(r => setTimeout(r, 1000));
  const post = p.hookHits.find(h => h.method === 'POST');
  const body = post && JSON.parse(post.body);
  ok(!!body, 'live_submit: POST sent to the GHL webhook URL (mocked)');
  ok(body && body.gclid === 'TEST-GCLID-123' && body.lt_source === 'google', 'payload carries gclid + UTM attribution');
  ok(await p.$eval('#fdone', e => !e.hidden), 'live_submit: success state after 200');
  // rate limit: same browser, already 2 submissions stored in localStorage (one per page) -> reload and send twice more
  await p.close();

  p = await page(b, '?live_submit=1', { hookStatus: 500 });
  await new Promise(r => setTimeout(r, 2600));
  await p.type('#f-name', 'Test Fakeperson'); await p.type('#f-phone', '3055550123');
  await p.click('#fsend'); await new Promise(r => setTimeout(r, 1000));
  ok(await p.$eval('#ffallback', e => !e.hidden && !!e.querySelector('iframe[src*="mDpUSOrNwxC8qu8w8aRH"]')), 'webhook error: fallback GHL form + call link shown');
  await p.close();

  // honeypot + too fast
  p = await page(b, '?live_submit=1');
  await p.type('#f-name', 'Bot'); await p.type('#f-phone', '3055550123');
  await p.click('#fsend'); await new Promise(r => setTimeout(r, 500));
  ok(p.hookHits.length === 0 && (await events(p)).includes('form_blocked'), 'too-fast submit blocked (fake success, nothing sent)');
  await p.close();
  p = await page(b, '?live_submit=1');
  await new Promise(r => setTimeout(r, 2600));
  await p.$eval('#f-web', e => e.value = 'spam.example');
  await p.type('#f-name', 'Bot'); await p.type('#f-phone', '3055550123');
  await p.click('#fsend'); await new Promise(r => setTimeout(r, 500));
  ok(p.hookHits.length === 0, 'honeypot blocks submit');
  await p.close();
  // rate limit
  p = await page(b, '?live_submit=1');
  await p.evaluate(() => localStorage.setItem('pe_lp_sub', JSON.stringify([Date.now(), Date.now(), Date.now()])));
  await new Promise(r => setTimeout(r, 2600));
  await p.type('#f-name', 'Test Fakeperson'); await p.type('#f-phone', '3055550123');
  await p.click('#fsend'); await new Promise(r => setTimeout(r, 500));
  ok(p.hookHits.length === 0 && /already have your request/.test(await p.$eval('#fstatus', e => e.textContent)), 'rate limit: 4th submit in 30 min blocked');
  await p.close();

  // states + variants
  for (const [q, cls, txt] of [['', 'is-preopen', 'Opens Monday'], ['?now=2026-11-17T10:00', 'is-open-now', 'Open now'], ['?now=2026-11-21T21:00', 'is-closed-now', 'opens Monday'], ['?now=2026-11-17T06:00', 'is-closed-now', 'opens today']]) {
    p = await page(b, q);
    const st = await p.evaluate(() => [document.documentElement.className, document.querySelector('.status').innerText]);
    ok(st[0].includes(cls) && st[1].includes(txt), `state ${q || '(today)'} -> ${cls}: "${st[1].replace(/\n/g, ' | ')}"`);
    await p.close();
  }
  p = await page(b, '?hero=book&img=tx&info=price&h=3');
  const v = await p.evaluate(() => ({ c: document.documentElement.className, h1: document.getElementById('h1').textContent,
    first: getComputedStyle(document.querySelector('.hero .btn-req')).order, tx: getComputedStyle(document.querySelector('.who .tx')).display,
    price: getComputedStyle(document.querySelector('.f-price')).display, formTop: document.getElementById('request').getBoundingClientRect().top, moreTop: document.querySelector('.hero-more').getBoundingClientRect().top }));
  ok(v.c.includes('v-hero-book') && v.h1.startsWith('Broken Tooth') && v.first === '-1' && v.tx === 'block' && v.price === 'grid' && v.formTop < v.moreTop, 'variants: booking-first, treatment image, price-first, headline 3');
  await p.close();
  for (const w of [375, 768, 1280]) { p = await page(b, '', { w }); ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `no horizontal scroll at ${w}`); await p.close(); }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
