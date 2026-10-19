# Google Ads — "Dental Implants – Miami – Search" (PAUSED, $0 spend)

**Status:** Draft only. Nothing has been created in a live Google Ads account. Import `dental-implants-campaign.csv` into Google Ads Editor, review, and keep the campaign **Paused** until the user approves.
**Landing page:** `https://pranadentalmiami.com/lp-implants.html` (noindex, ad-only)
**Offer:** $1,999 single implant = implant + abutment + zirconia crown. Free consult. Extractions, grafting, sedation extra if needed.

---

## 1. Campaign settings

| Setting | Value |
|---|---|
| Type | Search only (uncheck Search Partners and Display Network) |
| Status | **Paused** |
| Budget | $0 intended. Google requires a value, so the CSV uses **$0.01/day** while paused. Suggested launch budget: $50–$75/day. |
| Bidding | Maximize Conversions (no tCPA for the first ~30 conversions, then set tCPA) |
| Conversion goal | Primary: "Implant consult form submit" (`AW_LABEL`). Secondary: phone clicks / calls from ads. Set GA4 import as secondary only. |
| Location | 10 mi radius around 3050 Biscayne Blvd, Miami FL 33137. **Presence: "People in or regularly in"** (not "interested in") |
| Language | English + Spanish |
| Schedule | Mon–Sat 7AM–8PM (bid down/off Sunday; calls go unanswered) |
| Ad rotation | Optimize |
| Final URL suffix | handled per ad: `utm_source=google&utm_medium=cpc&utm_campaign=dental-implants-miami&utm_content={adgroup-variant}&utm_term={keyword}`. Turn on **auto-tagging** (gclid). |

## 2. Ad groups & keywords (Phrase + Exact)

| Ad group | Keywords |
|---|---|
| implants-miami | dental implants miami · dental implant miami · tooth implant miami · dental implants miami fl · implant dentist miami |
| affordable | affordable dental implants miami · affordable dental implants · low cost dental implants miami · dental implant specials miami · dental implant deals miami |
| cost | dental implant cost miami · how much is a dental implant · single tooth implant cost · dental implant price miami · tooth implant cost |
| single-tooth | single tooth implant · single tooth implant miami · replace missing tooth · missing tooth replacement · one tooth implant |
| near-me | dental implants near me · implant dentist near me · tooth implant near me · dental implant dentist near me |

**Campaign negatives:** free, free dental implants, school, dental school, university, jobs, job, career, salary, hiring, course, training, certification, diy, how to make, cheapest, mexico, tijuana, cancun, colombia, costa rica, turkey, medicaid, clinical trial, dentures only, denture repair, veterinary, dog, cat, for kids, grants, charity, lawsuit, attorney, wholesale, supplies, kit, youtube, pdf.
*"cheap" is intentionally **not** negative: at $1,999 all-in, price shoppers are the target. Watch the search terms report weekly and add negatives there.*

## 3. Responsive search ads (2 per group, in the CSV)

- **Ad A — price-led:** H1 pinned = group headline (e.g. "Dental Implants Miami"), H2 pinned = "$1,999 Implant + Crown".
- **Ad B — doctor-trust-led:** H1 pinned = group headline, H2 pinned = "Dr. Rana: 3,000+ Implants".
- 15 headlines each (≤30 chars, validated by script), 4 descriptions (≤90 chars). All match LP claims.

Shared headlines: $1,999 Implant + Crown · Implant, Abutment & Crown · Zirconia Crown Included · Dr. Rana: 3,000+ Implants · Free Implant Consultation · Written Quote Up Front · Same Doctor Every Visit · Crowns Made in Our Own Lab · Edgewater, Miami Office · Financing on Approved Credit · Se Habla Español · 5-Year Workmanship Guarantee · Call (786) 579-0521

## 4. Assets (add in Editor/UI — not in CSV)

- **Sitelinks** (all to LP anchors so traffic stays on the ad page):
  - What's Included → `/lp-implants.html#included` — "Implant, abutment and crown" / "Extras quoted in writing"
  - Book Free Consult → `/lp-implants.html#book` — "Free, no obligation" / "Written quote up front"
  - Meet Dr. Rana → `/lp-implants.html#doctor` — "3,000+ implants placed" / "NYU-trained"
  - All-on-X Full Arch → `/lp-all-on-x.html` — "$9,999 per arch" / "For many missing teeth"
- **Callouts:** $1,999 All-In · Zirconia Crown Included · Free Consult · In-House Dental Lab · Same Doctor Every Visit · Se Habla Español · Financing on Approved Credit · Open Mon–Sat
- **Structured snippets:** *Services:* Single Tooth Implants, Implant Crowns, All-on-X, Bone Grafting, Sedation · *Amenities:* In-House Lab, 3D Scans, Bilingual Team
- **Call asset:** (786) 579-0521, show during business hours, count calls ≥60 s as conversion.
- **Location asset:** link the Google Business Profile for 3050 Biscayne Blvd, Ste 703.
- **Price asset (optional):** "Single Tooth Implant — $1,999" with "Implant, abutment, crown" description.

## 5. Competitor differentiation

Miami competitors advertise $1,789–$2,195. Our edge is **clarity, not the lowest number**:
1. **All-in:** $1,999 includes abutment + zirconia crown. Many low ad prices are implant-only. Say "all-in", never "cheapest".
2. **Same doctor:** Dr. Rana places every implant (3,000+ placed), vs rotating associates.
3. **In-house lab:** faster adjustments and shade matching.
4. **Written quote up front**, bilingual team.
Do not name competitors in ads or bid on competitor brand names without legal/brand review.

## 6. Compliance check

| Rule | How we comply | Status |
|---|---|---|
| Google Healthcare & medicines policy | Dental services aren't restricted; no prescription-drug terms. No before/after or "guaranteed results" claims in ads. | OK |
| Google personalized-ads health restriction | No remarketing/customer-match audiences based on health condition. Observation audiences only. | OK — keep it so |
| Google misrepresentation / destination | Ad price ($1,999) matches LP; LP discloses exclusions; phone number works; privacy policy linked. | OK |
| FL §456.062 / Rule 64B5-4.002 F.A.C. — free/discounted services | LP footer carries the required 72-hour "right to refuse to pay" disclaimer (all caps). **Ads say "Free Consult"** → keep the disclaimer on the LP and in any print. | OK — legal to confirm |
| FL Board of Dentistry — fee advertising | Fee is a specific service set; exclusions (extraction, grafting, sedation) stated on LP and in FAQ. Honor the advertised fee for ≥90 days after the ad stops. | Needs user confirmation of inclusions |
| FL Board — specialty claims | Dr. Rana is listed as "general dentist"; no "specialist" or "implantologist" wording. | OK |
| FL Board — no false/misleading claims | "3,000+ implants" owner-confirmed; keep records on file. No testimonials used. "5-year workmanship guarantee" links to terms. | OK |
| Fake urgency / reviews | None used. No countdown, no fabricated reviews. | OK |

## 7. A/B test plan (one test at a time, ~2–4 weeks or 30+ conversions per arm)

**Primary metric:** cost per *qualified, attended* consultation (Ads cost ÷ consults that showed and were implant candidates — tracked in GHL by `source=lp-implants` + gclid). Secondary: CTR, LP conversion rate, cost per lead.

1. **Price vs doctor-trust headline** — Ad A vs Ad B (already built). Judge on cost per attended consult, not CTR.
2. **Form vs booking CTA** — current GHL form vs GHL booking calendar (`widget/booking/2e4a4Kot0lEnangN1Pfr`) embedded on a `lp-implants-b.html` variant. Split with a Google Ads custom experiment (50/50).
3. **Video vs static hero** — static (current) vs a 20–30 s Dr. Rana video. Needs the doctor video.

## 8. Launch checklist (needs the user)

- [ ] Real `AW_ID`, `AW_LABEL` (and optional `AW_CALL_LABEL`), `GA4_ID` in the top of `lp-implants.html`.
- [ ] Create the conversion action "Implant consult form submit" in Google Ads.
- [ ] Map GHL form hidden fields to `gclid`, `utm_*`, `source` (they're passed as URL params).
- [x] $1,999 = implant + abutment + crown (owner confirmed 2026-10-18). Site pricing pages still say **$1,850** and need updating.
- [x] 3,000+ implants placed (owner confirmed 2026-10-18).
- [ ] Set budget, then un-pause.
