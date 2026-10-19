# TODO-VERIFY: owner must confirm before launch

Each item is marked in the page source with `TODO-VERIFY` (an HTML comment or a `PE_CONFIG` setting). Nothing unverified shows on the page.
Unknowns are left out or switched off.

## Facts used on the page (from the repo / live site; please re-confirm)

| # | Fact as shown | Source | Confirm |
|---|---|---|---|
| 1 | Opening **Monday, Nov 16, 2026**; **Mon to Sat 8am to 8pm, Sun closed** | FIX-ALL-SITE.md "owner-approved", contact.html, schema (live) | Still the plan? If the date moves, change `'2026-11-16'` in the `<head>` script, plus the copy. |
| 2 | **Same-day appointments** Mon to Sat, "please call first", **no walk-ins** | commit ee322f0 "owner-approved", contact.html (live) | Are emergency slots actually held each day? How many? If not guaranteed, change to "Same-day visits when we have an opening". |
| 3 | 3050 Biscayne Blvd, **Suite 703**, Miami FL 33137, **at NE 30th St** | schema, contact.html (live) | – |
| 4 | **(786) 579-0521** answers calls and texts during ad hours | site-wide | Who answers during ad hours? Is texting monitored? |
| 5 | **Parking:** "building parking and street parking nearby" | 9 pages say "building and street parking"; contact.html says **"Free parking nearby"** | Is the building parking free or validated? Where is the entrance? The page doesn't say "free" until you confirm. |
| 6 | Most major dental insurance accepted; 0% financing on approved credit via **CareCredit, Cherry, LendingClub** | emergency.html, lp/all-on-4.html (live) | Accounts active for opening day? |
| 7 | **Oral sedation available** | emergency.html, about.html | Available for emergency visits too? |
| 8 | Dr. Rana: NYU College of Dentistry, **$100,000+ continuing education**, sees patients himself, refers to specialists | about.html, lp/all-on-4.html | – |
| 9 | Kids and teens seen for emergencies | emergency.html | – |

## Left out or switched off until confirmed

| # | Item | Where to turn it on |
|---|---|---|
| 10 | **Emergency exam fee.** The owner dropped the free emergency exam (commit 842a782). There's no confirmed price, so none is shown. | `PE_CONFIG.emergencyExamPrice = '$…'` (cost section + price test). Check Florida 456.062 fee-statement wording when a fee is advertised. |
| 11 | **Testimonials / reviews.** None verified (0 Google reviews). The section is omitted and there's no rating schema. | Add real, permissioned reviews only. |
| 12 | **Callback time.** The page says "we will call you back", with no time promise (book.js says "within minutes", which isn't verified). | Confirm a real response time, then add it to the success message. |
| 13 | **Call tracking number** | `PE_CONFIG.callTrackingNumber` or `adsWebsiteCallConversion` (see tracking-checklist.md §3) |
| 14 | **Enhanced conversions** | `PE_CONFIG.enhancedConversions = true`, after accepting Google's customer data terms and checking the privacy policy |
| 15 | **Office images.** The treatment-room and office photos (`office-*.webp`) look like 3D renders, since the office isn't open. Used only in the `?img=tx` variant, captioned "A treatment room at Prana Dental Miami". | Confirm they are real photos, or swap in real ones before running test 2. |

## Things to check in GHL (not visible from the repo)

| # | Item |
|---|---|
| 16 | The inbound webhook workflow creates a contact **without an email** (book.js always sends one; this page sends only name + phone). |
| 17 | `service_interest: "Emergency"` matches the GHL dropdown label (taken from book.js, which maps "Dental emergency" → "Emergency"). |
| 18 | Map payload keys to fields: `reason`, `source`, `lp_variant`, `page_state`, `gclid`/`gbraid`/`wbraid`, `ft_*`/`lt_*` UTMs, `event_id`. |
| 19 | **Live smoke test not run.** All form tests used a mocked webhook so no test contact landed in the CRM. With your OK, send one test (name "Test Fakeperson", phone 305-555-0123) from the deployed URL or with `?live_submit=1` locally, then delete it in GHL. |
| 20 | A staff alert (SMS/email) fires for `source = lp-emergency`, so emergency leads get a fast callback. |

## Inconsistencies found elsewhere on the site (not changed; outside this task)

- `emergency.html` (hero strip, cards, FAQ + FAQ schema) and `blog-emergency-dentist-edgewater.html` (FAQ "Is the emergency exam
  really free? Yes") still say the **emergency exam + X-ray is free**, but the owner dropped that offer
  (commit 842a782 only fixed pricing.html).
- Parking wording differs between pages ("free parking nearby" vs. "building and street parking").
- Local `main` is 44 commits behind `origin/main`; this branch was rebased onto `origin/main` first.
