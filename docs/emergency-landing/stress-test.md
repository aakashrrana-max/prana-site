# Stress test: 10 conversion criteria

Scored 1–10 on the first full draft, fixed, then scored again. Scores are judgment calls, backed by the test results below where possible.

| # | Criterion | Draft | Problem found | Fix | Final |
|---|---|---|---|---|---|
| 1 | Message match (ad → headline → offer) | 8 | Fine for "emergency dentist", weaker for "broken tooth" / "lost crown" ads. | 5 switchable headlines (`?h=`) mapped to ad groups. | 9 |
| 2 | Above the fold on a phone (375×812): call, request, hours, location, doctor photo, services | 5 | Doctor photo, hours and address were below the fold. A long description pushed the buttons down. | Compact hero: status pill with hours, doctor + address row with photo, one-line services description, buttons by ~630 px. Sticky Call / Request bar always visible. | 9 |
| 3 | Call and button visibility, tap size | 6 | CSS `font:` shorthand bug made button labels thin and the submit label tiny. Double space in "Call  (786)…". | Fixed the font rules. All visible buttons ≥ 54 px tall (test). Non-breaking "Call (786) 579-0521". | 9 |
| 4 | Form friction | 8 | 3 fields was already short. No hint of how long it takes. Sticky bar covered the form while typing. | "Takes about 30 seconds. Faster? Call us." Sticky bar hides while typing. Request buttons scroll to the form and focus Name. | 9 |
| 5 | Trust without reviews | 6 | Leaned on generic claims. Didn't use the one provable edge from competitor research (hours). | "8am to 8pm, Saturdays too" in the status line; "Evenings and Saturdays, so you don't have to miss work". Real doctor photo, NYU, "you see Dr. Rana himself", price in writing. | 7 *(capped until real reviews exist)* |
| 6 | Honesty and safety (no unverified claims, ER warning) | 9 | Practice isn't open yet, so "same-day" today would be false. | Date-aware copy: pre-open until Nov 16 (ET), then open-now / closed-now status by itself. ER/911 box under the hero and in the FAQ. No price, reviews, "free" or 24/7. | 10 |
| 7 | Calm urgency | 6 | Open-now status said "until 8pm" twice. No live open/closed signal. | Live "Open now · until 8pm" / "Closed now · opens Monday at 8am". Fixed duplicate text. | 8 |
| 8 | Speed (Lighthouse mobile) | 5 | Performance 69, simulated LCP 6.0 s: Meta, gtag and GHL scripts started before first paint. The hidden variant image downloaded anyway. | Tags load right after first paint, with early events queued and replayed. Hidden image is now lazy. | 9 (Performance 93) |
| 9 | Tracking completeness | 7 | `lp_view` fired before gtag existed (lost). Call-conversion hook would have fired a fake conversion on every page load. | Event queue flushed when `pl-events.js` loads. Hook only sets `phone_conversion_number`. Call taps before tags load are replayed as Contact. | 9 |
| 10 | Booking-first variant actually different on mobile | 4 | With `?hero=book`, the form still sat below the hero, so mobile was nearly the same as call-first. | Grid areas: booking-first puts the form right under the buttons on mobile and in the left column on desktop. Request button becomes the primary. | 9 |
| | **Average** | **6.4** | | | **8.8** |

**Still not perfect:**
- The form itself starts just below the fold at 375×812. The sticky "Request visit" button covers this, and `?hero=book` puts it higher.
- Trust stays capped until real reviews exist.
- The pre-open period limits what the page can promise. That is correct, but it will convert worse than after Nov 16.

## Automated test results (final run: 35 passed, 0 failed)

Run with headless Chrome against `http://127.0.0.1:8937`. Third-party hosts were blocked. **The GHL webhook was mocked:** no request reached GHL,
and no real or fake patient data was sent anywhere. Scripts: [tests/test.js](tests/test.js), [tests/shots.js](tests/shots.js).

- tel: links: 9, all `tel:+17865790521`. Visible buttons ≥ 48 px (min 54). Sticky bar visible at 375.
- No `aggregateRating` / review data in JSON-LD.
- `pl-events.js` loads; `lp_view`, `click_to_call` (+ `cta_location`, `lp_variant`), Google Ads **Contact** conversion on call tap,
  `directions_click`, `form_start`, `form_submit`, `generate_lead`, Google Ads **Lead** conversion. Enhanced conversions off by default.
- Request button focuses the name field. Validation blocks an empty name and a 9-digit phone.
- On localhost nothing is sent without `?live_submit=1`. Payload has E.164 phone, first/last name, `service_interest: Emergency`, `source: lp-emergency`, reason.
- With `?live_submit=1` and a mocked webhook: POST goes to the existing GHL webhook URL and carries `gclid` + UTM attribution. Success state shows.
- Webhook 500 → fallback GHL form iframe + call link. Too-fast submit, honeypot and rate limit (4th in 30 min) all block sending.
- States: today → pre-open; Tue 10am → "Open now · until 8pm"; Sat 9pm → "Closed now · opens Monday at 8am"; Tue 6am → "opens today at 8am".
- Variants: `?hero=book&img=tx&info=price&h=3` all apply. No horizontal scroll at 375, 768 or 1280.

## Lighthouse (mobile, simulated throttling, local server)

| | Draft | Final |
|---|---|---|
| Performance | 69 | **93** |
| Accessibility | 100 | **100** |
| Best practices | 79 | **100** |
| SEO | 69 | 69 (only failing audit: `noindex`, intentional for an ad page) |
| FCP / LCP | 1.1 s / 6.0 s | **1.0 s / 1.7 s** |
| TBT / CLS | 370 ms / 0 | 310 ms / **0** |

The local Python server has no gzip or caching. GitHub Pages has both, so production should score the same or better.
The remaining TBT is the Meta pixel and gtag code running after load.

**Note:** the first (draft) Lighthouse run did not block analytics, so it sent a few page-view hits from `127.0.0.1` to GA4, Meta and GHL
(page views only, no form data). The final run blocked the main collection endpoints, but one GA4 hit to `www.google.com/g/collect` still
got through. If you filter GA4 by hostname, these won't show. Otherwise they are a handful of localhost page views on 2026-10-18.

## Screenshots

`screenshots/` holds `preopen-*` (what visitors see today), `open-now-*` (from Nov 16 during hours) and `variant-book-tx-price-*`
at 375, 768 and 1280 px. `-fold.png` is the first screen, `-full.jpg` the whole page.
