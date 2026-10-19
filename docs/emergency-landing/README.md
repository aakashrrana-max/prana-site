# Emergency dentist landing page (Google Ads)

**Status: draft for owner review. Not pushed, not deployed.** Built 2026-10-18 on branch `claude/emergency-dentist-landing-b3c96b`, based on `origin/main` (714db36).

> **Before you merge to `main`:** this repo *is* the live site (GitHub Pages, `.nojekyll`). Everything under `docs/` would be public at
> `pranadentalmiami.com/docs/...`, including the competitor research and this TODO list. Merge only `lp/emergency-dentist.html` and
> `doctor-headshot-320.webp`, or move `docs/emergency-landing/` somewhere private first.

## Files

| File | What it is |
|---|---|
| `lp/emergency-dentist.html` | The page. Self-contained (inline CSS/JS, system fonts), `noindex`. Final URL: `https://pranadentalmiami.com/lp/emergency-dentist.html` |
| `doctor-headshot-320.webp` | 9 KB crop of the existing Dr. Rana headshot for the hero (made from `doctor-headshot.jpg`) |
| [copy.md](copy.md) | All page copy, the 5 headline options, and the pre-open vs. open wording |
| [competitor-research.md](competitor-research.md) | 10 Miami emergency dentists compared, with conversion opportunities |
| [tracking-checklist.md](tracking-checklist.md) | Events, conversions, GHL, call tracking, offline "attended" import, launch checklist |
| [ab-test-plan.md](ab-test-plan.md) | The three tests, how to run them with URL params, what to measure |
| [stress-test.md](stress-test.md) | 10-criteria score, what was fixed, score after fixes, test and Lighthouse results |
| [todo-verify.md](todo-verify.md) | **Every fact the owner must confirm before launch** |
| `screenshots/` | 375 / 768 / 1280 px, above-the-fold (`-fold.png`) and full page (`-full.jpg`), pre-open, open and variant states |

## How the page behaves

- **Pre-open vs. open.** The practice opens Monday, Nov 16, 2026. Until then the page says so everywhere, takes appointment requests
  for Nov 16 onward, and tells people in pain today to see an open dentist or the ER. From Nov 16 (Eastern time) it switches by itself
  to "Open now · until 8pm" / "Closed now · opens Monday at 8am" and the same-day wording. No redeploy needed.
  Preview any moment with `?now=2026-11-17T10:00`.
- **No unverified claims.** No reviews, ratings, testimonials, emergency price, "free" offer, 24/7 or walk-in promise.
  The free emergency exam was dropped by the owner (commit 842a782), so it is not on this page.
- **ER / 911 warning** sits right under the hero and is repeated in the FAQ.
- **Form → GHL.** Name, mobile, optional reason. Posts JSON to the same GHL inbound webhook `book.js` uses, with
  `source: lp-emergency`, `service_interest: Emergency` (exact GHL option label from `book.js`), the A/B variant, and gclid/UTM attribution.
  If the webhook fails, the existing GHL form (`mDpUSOrNwxC8qu8w8aRH`) appears with a call link.
- **On localhost the form never sends** to GHL (it logs the payload instead) unless you add `?live_submit=1`.
- **Spam:** honeypot field, 2.5 s minimum fill time, max 3 requests per browser per 30 minutes. (GitHub Pages has no server, so there is
  no server-side rate limit; see the checklist for a GHL-side filter.)
- **Tracking** reuses the site's IDs via `/pl-events.js` (GA4 `G-6KP15B68YK`, Google Ads `AW-18455800227` Lead/Contact conversions,
  GHL external tracking) and `/prana-attribution.js`. They load just after the first paint so they don't slow the page.

## Preview locally

```bash
python3 -m http.server 8937 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8937/lp/emergency-dentist.html`. Useful params: `?now=2026-11-17T10:00`, `?hero=book`, `?img=tx`,
`?info=price`, `?h=1..5`, `?debug=1` (logs every event to the console), `?sim_fail=1` (shows the webhook-failure fallback).

## Not changed

No existing page, script or style was edited. `pl-events.js`, `prana-attribution.js` and `book.js` are untouched.
The page is not in `sitemap.xml` and not linked from the nav (same as `/lp/all-on-4.html`).
