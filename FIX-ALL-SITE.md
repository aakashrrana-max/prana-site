# Prana site — FIX-ALL-SITE
**Owner coordination:** executor bot + website bot  
**Repo:** `aakashrrana-max/prana-site`  
**Updated:** 2026-09-06 22:05 ET (2026-09-07 02:05 UTC)  
**Brand rule:** preserve Prana look/feel; no invented merchant/prequal URLs.

---

## 2026-09-21 — SEO benchmark vs. bestdentistjerseycity.com (Limitless Dental)

**Branch:** `seo/expand-content-and-schema` (2 commits, not pushed — no `gh`/git push
credentials in that session; shipped as a bundle instead, see handoff note below).

**Context:** Kash asked for a full SEO audit of a competitor site plus execution of the
gaps against pranadentalmiami.com. Audit found Prana's technical SEO (schema, meta tags,
alt text, canonical/OG, neighborhood-page architecture, internal linking) was already at
or ahead of the competitor — most of that work had already shipped in the
2026-09-21 "SEO overhaul" commit (`6f57e2a`) earlier the same day. The one real,
measurable gap was **blog content volume**: 8 posts vs. their 142.

**Shipped in this pass:**
1. `sameAs` + `aggregateRating` added to the Dentist/MedicalProcedure JSON-LD on all 37
   pages that carry it (was missing everywhere except `aggregateRating` on
   `lp-all-on-x.html`). `sameAs` = `facebook.com/pranadentalmiami` +
   `instagram.com/pranadentalmiami` (confirmed by Kash; YouTube still pending, add once
   that channel exists). `aggregateRating` reuses the 4.9★/200-review figure already
   published in on-page text on `pricing.html` — **re-verify this number against the
   live Google Business Profile before the next content push**, review counts move.
2. 6 new blog posts (All-on-4 vs All-on-6, full-arch vs dentures, insurance, bone
   grafting, full-mouth reconstruction signs, same-day teeth), each with Article +
   FAQPage schema, linked into `blog.html`'s grid and `sitemap.xml`.

**Not done / next up (highest leverage first):**
- Keep adding posts toward parity — target 2-4/month. Backlog: neighborhood-specific
  "implant cost near me" posts (Edgewater/Wynwood/Brickell/etc.), an AI-dentistry/
  digital-lab authority post mirroring the competitor's tech-forward angle.
- Google Business Profile: push review volume (they have 517 at 4.9★; confirm Prana's
  current live count before trusting the 200 figure above) and confirm GBP categories/
  photos are optimized. Off-site, can't be done from this repo.
- Once sameAs/YouTube exists, add it; consider a Whiteboard/Sheets content calendar so
  the blog cadence doesn't stall after this one push.
- Full audit doc (competitor findings + ranked action plan) lives at:
  https://claude.ai/artifact/DPEcvR3b83VoPGP9SAnna5

---

## Status board

| # | Priority | Status | Where |
|---|---|---|---|
| 1 | All-on-4 quiz `webhookUrl` empty | **FIXED (live)** | PR #4 wired AO4/veneers/injectables → implants GHL inbound hook. This pass enriches AO4 payload (`source`, `page`, `score`, `tier`). |
| 2 | Duplicate footer in HTML | **FIXED in branch** | Homepage had main `<footer>` + second `<footer id="pd-legal-bar">`. Legal bar removed; Privacy/Terms folded into `.foot-bottom`. |
| 3 | Mobile CTA / chat / headshot / sticky / quiz jump | **PARTIAL → this PR** | PR #4/#5 sticky+Call+hero poster-first. This pass: chat-lift on 25 mbar pages; AO4 quiz scroll only when needed; headshot lazy+srcset. |
| 4 | Image weight / lazyload / srcset | **PARTIAL → this PR** | Hero → `hero-loop8.mp4` (~586KB vs ~5MB); gallery/community/headshot `srcset` 640/960; lazy+decoding on key imgs. Full WebP `<picture>` + story mp4 trim still open. |
| 5 | www DNS → AWS/Netlify vs apex GitHub Pages | **HANDED TO JUSTICE** | Confirmed split-brain; exact records below. Not shippable via gh. |

---

## 1) Quiz webhook (All-on-4)

**File:** `all-on-4.html` (also `veneers.html`, `injectables.html`, `implants.html`)

**Live CONFIG (verified 2026-09-07):**
```js
webhookUrl: "https://services.leadconnectorhq.com/hooks/qxdMI6WF2uNxt7goL1jY/webhook-trigger/cfdb9b4e-d393-48b0-920b-e9a12e91fb69"
calendarUrl: "https://api.leadconnectorhq.com/widget/booking/2e4a4Kot0lEnangN1Pfr"
```

**Source of truth:** same inbound webhook-trigger already proven on `implants.html`. Location ID `qxdMI6WF2uNxt7goL1jY` matches `/workspace/ghl-crm-golive` CRM inventory.

**GHL form (homepage/contact lead form — NOT the quiz hook):**  
`https://api.leadconnectorhq.com/widget/form/mDpUSOrNwxC8qu8w8aRH`

**Do not invent a second webhook.** If quiz answers need a dedicated GHL workflow, Justice/Valentina should clone the implants inbound trigger or map fields in the existing workflow — keep this URL until then.

**This PR:** AO4 POST body now includes `source:'all-on-4-quiz'`, `page`, `score`, `tier` so CRM can distinguish quiz vs implant capture.

**Handoff:** Website bot — smoke-test one quiz submit in GHL contacts after merge (look for source/page fields).

---

## 2) Duplicate footer

**Was:** `index.html` rendered two `<footer>` elements (main site footer + `#pd-legal-bar` repeating address/©).

**Fix:**
- Keep one `<footer>` (main).
- Add Privacy / Terms links into `.foot-bottom`.
- Remove `<footer id="pd-legal-bar">`.
- Keep privacy/terms modals + `#privacy` / `#terms` hash openers (guarded `pd-yr` script remains noop-safe).

**Handoff:** Visual QA on homepage desktop+mobile that only one footer/address block shows.

---

## 3) Mobile CTA / chat / headshot / sticky / quiz jump

### Already shipped (PRs #3–#5)
- Sticky Call dials `tel:+17865790521` (was wrongly `#book` on several pages).
- `.mbar` CSS visible ≤760px.
- Homepage `mobile-bar` Call | WhatsApp | Book; chat-lift on homepage only.
- Hero poster-first / save-data / reduced-motion (no autoplay until in view).
- Footer Book CTAs → `/#book` NPC calendar on secondary pages.

### This PR
1. **Chat vs sticky overlap:** inject `pd-mbar-chat-lift` CSS+JS on **25** pages that have mbar/mobile-bar + LeadConnector chat but lacked homepage chat-lift.
2. **AO4 quiz jump:** `headerOffset()` from live nav height; `show()` only scrolls to `.quiz-card` when clipped by sticky header or far down-viewport (stops janky re-jumps every step).
3. **Headshot:** `loading="lazy" decoding="async"` + `srcset` (`doctor-headshot-640.jpg`).

### Still open / website bot
- Reduce mid-page “Take the quiz” CTA count on AO4 (conversion audit P1 — copy/IA, not done here).
- Confirm chat bubble clears sticky on iOS Safari (shadow-root lift).
- Contact page sticky present in repo; verify live cache after Pages deploy.

---

## 4) Image weight / lazyload / srcset

### Measured (live HEAD)
| Asset | Size |
|---|---|
| `hero.mp4` | ~4971 KB |
| `hero-loop8.mp4` (new) | ~586 KB |
| `office-lobby.jpg` | ~284 KB |
| `guatemala.jpg` | ~255 KB |
| `doctor-headshot.jpg` | ~121 KB |
| Story mp4s `t0`–`t5` | 0.9–9.1 MB each (not touched) |

### This PR
- Homepage video `source` → `hero-loop8.mp4` (8s loop). Full `hero.mp4` kept in repo for optional restore.
- Generated `*-640.jpg` / `*-960.jpg` (+ `.webp` companions on disk) for gallery/community/headshot.
- Homepage gallery + community imgs: `srcset` + `sizes`; `decoding="async"`.
- Injectables `docb.jpg` lazy+decoding.

### Handoff (website bot / later)
- Optional: switch gallery to `<picture>` with WebP (files already generated: `office-*-640.webp` etc.).
- Trim/compress story videos `t0.mp4`–`t5.mp4` (largest conversion weight after hero).
- Consider deleting or gitignoring unused full-length hero if Kash signs off.

**No merchant URLs invented.** Financing apply links remain as previously shipped public portals unless Kash supplies practice-specific links.

---

## 5) DNS — Justice brief (exact records)

### Confirmed 2026-09-07 (dnspython)

| Name | Type | Current value | Notes |
|---|---|---|---|
| `pranadentalmiami.com` | **A** | `185.199.108.153` | GitHub Pages ✓ |
| `pranadentalmiami.com` | **A** | `185.199.109.153` | GitHub Pages ✓ |
| `pranadentalmiami.com` | **A** | `185.199.110.153` | GitHub Pages ✓ |
| `pranadentalmiami.com` | **A** | *(missing `185.199.111.153`)* | Add for GH completeness |
| `pranadentalmiami.com` | **NS** | `ns-cloud-c{1..4}.googledomains.com` | Google Domains / Squarespace DNS |
| `www.pranadentalmiami.com` | **CNAME** | `prana-dental-miami.netlify.app.` | **WRONG — Netlify/AWS** |
| `www.pranadentalmiami.com` | **A** | `98.84.224.111`, `18.208.88.157` | AWS (Netlify edge) |
| `www.pranadentalmiami.com` | **AAAA** | `2600:1f18:16e:df01::258/259` | AWS IPv6 |

**Behavior today:**
- Apex `https://pranadentalmiami.com` → **GitHub Pages** (200, `server: GitHub.com`) — canonical site.
- `http://www…` → 301 via Netlify to apex.
- `https://www…` → **TLS certificate mismatch** (cert not valid for `www.pranadentalmiami.com`).

Repo `CNAME` file correctly contains: `pranadentalmiami.com` (apex).

### Exact records Justice should set (GitHub Pages dual apex+www)

```
# APEX → GitHub Pages (keep / ensure all four)
pranadentalmiami.com.     A      185.199.108.153
pranadentalmiami.com.     A      185.199.109.153
pranadentalmiami.com.     A      185.199.110.153
pranadentalmiami.com.     A      185.199.111.153

# Optional IPv6 apex (GitHub Pages)
pranadentalmiami.com.     AAAA   2606:50c0:8000::153
pranadentalmiami.com.     AAAA   2606:50c0:8001::153
pranadentalmiami.com.     AAAA   2606:50c0:8002::153
pranadentalmiami.com.     AAAA   2606:50c0:8003::153

# WWW → GitHub Pages user site (REPLACE Netlify CNAME)
www.pranadentalmiami.com. CNAME  aakashrrana-max.github.io.
```

### Delete / stop
- Delete CNAME `www` → `prana-dental-miami.netlify.app`
- Delete any www A/AAAA that resolve to AWS/Netlify (`98.84…`, `18.208…`, `2600:1f18:…`)
- After DNS propagates: enable HTTPS for www in GitHub Pages (Settings → Pages → Custom domain → enforce HTTPS). Expect www cert to issue once CNAME points at `aakashrrana-max.github.io`.

### Verify commands (for Justice)
```
dig +short pranadentalmiami.com A
dig +short www.pranadentalmiami.com CNAME
curl -sI https://pranadentalmiami.com | grep -i server
curl -sI https://www.pranadentalmiami.com | grep -iE 'HTTP|server|location'
```
Expect both hosts to serve GitHub Pages without cert errors.

---

## PR / ship paths

- **Branch:** `fix/all-site-priorities` → open PR if gh auth works.
- **Patch mirror for website bot:** `/workspace/prana-audit/ship/fix-all/`
- **Do not conflict with website bot:** update this file when pushing; prefer one PR for HTML+assets.

## Fixed vs handed off (summary)

**Fixed / shipping in this pass**
1. Confirm quiz webhook live + enrich AO4 payload  
2. Remove duplicate homepage footer; Privacy/Terms in main footer  
3. Chat-lift on all sticky+chat pages; AO4 quiz jump throttle; headshot lazy/srcset  
4. Hero short loop; gallery srcset variants; lazy/decoding passes  

**Handed off**
- Justice: www DNS cutover (table above)  
- Website bot: post-merge quiz→GHL smoke test; optional WebP `<picture>`; story video compression; AO4 CTA count reduction  
- Kash: practice-specific financing merchant URLs when available (do not invent)
