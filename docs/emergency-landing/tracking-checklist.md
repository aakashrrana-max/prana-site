# Tracking and optimization checklist

**Primary KPI:** cost per *attended* emergency appointment. **Secondary:** treatment acceptance, contribution margin.
The browser can only see calls and form requests. "Attended" and "accepted" only exist in GHL and the practice software,
so the most important item below is the **offline conversion import** (section 4).

## 1. What the page sends today (verified by automated test, see [stress-test.md](stress-test.md))

| Visitor action | GA4 event (all carry `lp_variant`, `page_state`, `cta_location` where relevant) | Google Ads conversion | Meta |
|---|---|---|---|
| Page load | `lp_view` (+ GA4 page_view from config) | – | PageView |
| Tap any `tel:` link (header, hero, sticky, cards, final, footer, form) | `click_to_call` + `contact` (method=phone) | **Contact** `AW-18455800227/gq-zCNGmy6EdEKPTtOBE` ("Website call / WhatsApp tap"), via `pl-events.js` | Contact |
| Tap "Text us" | `click_to_text` + `contact` (method=sms) | **Contact** | Contact |
| Tap "Get directions" | `directions_click` | – | – |
| Tap "Request an appointment" / "Request visit" | `request_click` | – | – |
| First keystroke in the form | `form_start` | – | – |
| Form sent and webhook returned 2xx | `form_submit` + `generate_lead` | **Lead** `AW-18455800227/7b4lCJCMy6EdEKPTtOBE` ("Website lead form"), `transaction_id` = event id | Lead (same event id, for CAPI dedupe) |
| Validation error / webhook error | `form_error` (reason) | – | – |
| Honeypot / too fast / rate limit | `form_blocked` (reason) | – | – |
| Tap "Show map" | `map_open` | – | – |

IDs come from `/pl-events.js` (owner settings block). Nothing new was invented. `privacy: true` keeps Google signals and ad personalization off.

## 2. Before launch (owner / marketing)

- [ ] In GA4 (G-6KP15B68YK), register custom dimensions: `lp_variant`, `cta_location`, `page_state`, `reason_selected` (event scope).
- [ ] In GA4, mark `form_submit` as a key event. Keep `generate_lead` too, or pick one so you don't count leads twice in reports.
- [ ] In Google Ads, use the **Lead** and **Contact** conversions as primary for the emergency campaign. Set Contact to "count one per click".
      Consider a lower value for Contact (a tap is not a call) until call tracking (section 3) gives real call data.
- [ ] Google Ads final URL: `https://pranadentalmiami.com/lp/emergency-dentist.html`. Turn on auto-tagging (gclid). Add a final URL suffix,
      e.g. `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`.
- [ ] Add a **call asset** with a Google forwarding number and a "Calls from ads" conversion (60 s+). Most emergency leads call straight from the ad.
- [ ] Ad schedule: Mon to Sat, about 7:30am to 7:30pm Eastern, so calls land while someone can answer. Don't run before Nov 16, or run a
      small pre-open campaign with "Opening Nov 16" in the ad text, because the page tells people in pain today to go elsewhere.
- [ ] Confirm someone answers (786) 579-0521 during ad hours. Missed calls are the most expensive leak for emergency ads.
- [ ] Smoke test one real submission from the live URL (with an obviously fake name like "Test Fakeperson" and a 555-01xx number), then delete
      the contact in GHL. **Not done yet** (see todo-verify.md, item 9).

## 3. Call tracking

- **Hook is built, off by default.** In the page's `PE_CONFIG`:
  - `callTrackingNumber: { e164: '+1305…', display: '(305) …' }` swaps every `tel:` link and shown number (e.g. a GHL / CallRail tracking number).
  - `adsWebsiteCallConversion: 'AW-18455800227/LABEL'` turns on Google's website call conversion (Google forwarding number swap via `_googWcmGet`).
    Create a "Calls from a website" conversion in Google Ads first and paste its label.
  - `onCallClick: function (location) {}` runs on every call tap, for any other vendor.
- Pick **one** system. Using a GHL number *and* a Google forwarding number on the same page will fight over the swap.
- Recommended: Google forwarding number on the page (free, ties calls to gclid), and a GHL number in the call asset only if you need GHL call recordings.

## 4. Offline conversions: measure *attended* visits (primary KPI)

The webhook payload already carries `gclid` / `gbraid` / `wbraid`, first- and last-touch UTMs, `lp_variant`, `event_id` and `source: lp-emergency`.

- [ ] In GHL, map those payload keys to contact custom fields (`gclid`, `lp_variant`, `source`, `event_id`). Confirm the inbound webhook workflow keeps them.
- [ ] Pipeline stages for emergency leads: *New → Contacted → Booked → **Attended** → Treatment accepted*.
- [ ] Create Google Ads conversions (import, "from clicks"): **Emergency booked**, **Emergency attended** (primary for bidding once volume allows),
      **Treatment accepted** (value = accepted fee, or contribution margin if you can export it).
- [ ] Upload weekly (Google Ads > Conversions > Uploads, or GHL's Google Ads integration if it's on your plan): gclid + conversion name + time + value.
      Calls from the call asset can be matched with the Google forwarding-number call conversion.
- [ ] Once you have ~30 attended conversions a month, switch the campaign's primary goal from Lead/Contact to **Emergency attended**
      (Maximize conversions, then tCPA). Until then keep Lead + Contact as primary and attended as secondary.
- [ ] Report weekly: spend ÷ attended = **cost per attended emergency appointment**; attended ÷ leads (show rate); accepted ÷ attended (acceptance);
      (accepted fees − lab/material − chair-time cost − ad spend) ÷ attended (contribution margin per visit).

## 5. Enhanced conversions (built, off)

- `PE_CONFIG.enhancedConversions = true` sends the visitor's phone (E.164; gtag hashes it) with the Lead conversion via `gtag('set','user_data')`.
- Turn it on only after: (1) accepting Google's customer data terms in Google Ads, (2) enabling enhanced conversions for leads on the Lead
  conversion, and (3) checking the Privacy Policy covers sharing hashed contact data with Google. It sends no health information, only the phone.
- It helps most when you import attended conversions (section 4) by phone instead of gclid.

## 6. Spam protection

- Built: honeypot field, 2.5 s minimum fill time, 3 requests per browser per 30 min, digits-only phone validation. Bots get a fake "thank you" and nothing is sent.
- Not possible on GitHub Pages: a server-side rate limit or secret. If spam gets through, add a GHL workflow filter (drop contacts whose name has URLs,
  or duplicate phone within 24 h) or put the existing GHL form (with its captcha) in front instead of the webhook.

## 7. Optimization backlog (after 2–4 weeks of data)

1. Compare `click_to_call` by `cta_location`. If the sticky bar takes most taps, test making it bigger or call-only.
2. Check `form_start` → `form_submit` drop-off. If it's high, test removing "Reason for visit".
3. Add a Spanish version (`/lp/es-emergencia-dentista.html`) for Spanish ad groups. The competitor review found only 2 of 10 serve Spanish well.
4. Add real reviews once the Google profile has them (never an `aggregateRating` without a verified source).
5. Add an exam price once confirmed (`PE_CONFIG.emergencyExamPrice`), then run the price test (see [ab-test-plan.md](ab-test-plan.md)).
6. After opening, replace the office renders (if they are renders) with real photos of the treatment rooms.
7. When the pre-open period ends, the page switches by itself. Remove the pre-open copy in a cleanup pass after Nov 16 so no-JS visitors see the open copy.
