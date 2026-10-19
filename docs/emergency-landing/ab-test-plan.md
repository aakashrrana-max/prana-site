# A/B test plan

All variants are built into the page and switched by URL parameters, so each Google Ads ad (or a Google Ads *Experiment*) can point at a
different final URL. Every GA4 event and every GHL lead carries `lp_variant` (e.g. `hero-call|img-doc|info-process|h1`), so results can be
split by variant for **calls, leads and, through GHL, attended visits**.

| Param | Values (default first) | What changes |
|---|---|---|
| `hero` | `call`, `book` | **call**: teal Call button first, form after the hours/location block on mobile, form on the right on desktop. **book**: Request button first and dark, form moves right under the buttons on mobile and to the left column on desktop, with a navy border. |
| `img` | `doc`, `tx` | **doc**: Dr. Rana's photo in the hero. **tx**: treatment-room image in the hero (doctor section lower down stays). |
| `info` | `process`, `price` | **process**: hero bullet "Clear answers…", "What happens at your visit" comes before "Cost". **price**: hero bullet "Cost first… insurance accepted", "Cost" section moves above "Your visit". |
| `h` | `1`–`5` | Headline (see [copy.md](copy.md)). Use for message match, not as a test, unless volume is high. |

## Test 1: call-first vs. booking-first hero (run first)

- **URLs:** A `…/lp/emergency-dentist.html` · B `…/lp/emergency-dentist.html?hero=book`
- **Hypothesis:** emergency searchers want to talk now, so call-first wins on *attended* visits, even if booking-first gets more form leads.
  After-hours traffic may favor booking-first.
- **Primary metric:** attended emergency visits per 100 clicks (offline import). Proxy until then: (calls 60 s+ + form leads) per click.
- **Watch:** share of leads that are forms vs. calls, show rate of each, and results by `page_state` (open vs. closed hours).
- **Follow-up idea:** if B wins only when closed, make the hero switch itself: call-first in open hours, booking-first when closed.

## Test 2: doctor photo vs. treatment imagery

- **URLs:** A default · B `?img=tx`
- **Hypothesis:** a real face builds trust for a new practice with no reviews, so A wins.
- **Caution:** check whether the office images are 3D renders before running B (see todo-verify.md). Don't present a render as a real photo.
- **Primary metric:** contact rate (call taps + form submits) per session. It's a small change, so expect to need more traffic.

## Test 3: price transparency vs. process explanation

- **URLs:** A default · B `?info=price`
- **Blocked on:** a confirmed emergency exam fee. Without a number, B only moves "Know the cost before any treatment" higher, which is a weak test.
  Once the owner confirms a fee, set `PE_CONFIG.emergencyExamPrice = '$…'` and B shows it in the cost section.
- **Hypothesis:** a clear exam price lowers fear of surprise bills and raises booked and attended visits, at the risk of filtering out price shoppers.
- **Primary metric:** attended visits per click, plus treatment acceptance (does a price-anchored visitor accept treatment at the same rate?).

## How to run

1. Use a **Google Ads Experiment** (custom experiment, 50/50 split, cookie-based) on the emergency campaign, changing only the final URL.
   This keeps bidding and audiences equal. Ad-level splits inside one ad group are biased by ad rotation.
2. **One test at a time,** in the order above. Keep the other params at their defaults.
3. **How long:** at least 2 full weeks (to cover weekdays and Saturdays), and at least about 100 conversions per arm for a 20% lift
   to show up reliably. A new practice may not reach that. If not, treat results as directional and judge by attended visits, not taps.
4. **Report** in GA4 by `lp_variant` and in GHL by the `lp_variant` field on contacts (map it in the webhook workflow).
5. **Stop rule:** stop early only if one arm is clearly worse on *attended* visits after 2+ weeks, or if a variant creates complaints or no-shows.
