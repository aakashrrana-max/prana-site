# Prana Check-in Kiosk

A one-screen check-in for the front-desk iPad (also works on iPhone). The patient types their last name, and Emily's phone gets a push alert within a couple of seconds.

**Files:** `kiosk/index.html` (the whole app) and `kiosk/manifest.webmanifest`. There's no server, no App Store, and nothing to install on the iPad except a Home Screen icon.

---

## What the patient sees

1. **Welcome**: Prana logo, "Check in" button, plus three tiles: *I need help* · *Video with our team* · *Make a payment*. EN/ES toggle in the corner.
2. **Last name**: one big field and a "Check me in" button.
3. **Done**: "You're checked in, Rana. Please have a seat. Emily will be right with you." A live status line shows *Emily has been notified*, and it switches to *Someone is on the way* when Emily taps the button on her phone. The screen resets after 20 seconds.

Any screen returns to Welcome after 60 seconds of no touches, and the language resets to English for the next patient.

## What Emily sees

A push notification from the free **ntfy** app (iOS/Android):

> ✅ **Checked in: Rana**: Rana checked in at the kiosk at 10:42 AM. **[On my way]**

Tapping **On my way** clears the alert and updates the iPad screen. The other alerts:

| Patient taps | Alert | Priority |
|---|---|---|
| Check in | "Checked in: {name}" (+ "prefers Spanish" if they used ES) | High |
| I need help | "Patient needs help at the kiosk" | Max (breaks through Focus) |
| Video | "Patient started a video call" + **Join video** button | Max |
| Pay with the team | "Patient wants to pay" | Normal |

Anyone on the team can subscribe to the same channel: Emily, the remote team, Dr. Rana.

---

## Setup (about 15 minutes)

1. **Host it.** The folder already sits in the website repo, so after the next deploy it's live at `https://<site>/kiosk/`. It's `noindex`, and no secrets live in the code. The alert channel is stored on the iPad only.
2. **On the iPad:** open that URL in Safari, then Share → **Add to Home Screen**. Open it from the icon, not from Safari.
3. **First launch opens Kiosk setup.** It auto-generates a secret alert channel (e.g. `prana-desk-k3m9…`). Fill in:
   - Front-desk person: `Emily`
   - Patient video link (see below)
   - Card payment link (optional)
   - **Change the PIN** (the default is `2580`)
   - Tap **Send test alert**.
4. **On Emily's phone:** install **ntfy** from the App Store, tap **+**, and type the same channel name. Allow notifications. Do the same on every phone that should get alerts.
5. **Lock the iPad to the app:** Settings → Accessibility → **Guided Access** → On, and set a passcode. Settings → Display → **Auto-Lock: Never**. Open the kiosk and triple-click the side button to start Guided Access. Put it on a stand with a charger.

**Staff menu later:** press and hold the Prana logo for 2 seconds and enter the PIN. You can change settings, send a test alert, or see **today's check-ins**. That list is stored on the iPad only and clears every day, as a backup if a notification was missed.

---

## Virtual consult / remote help

The **Video** tile opens whatever link you paste in setup. Recommendation: **doxy.me** (free tier, HIPAA-compliant, runs in Safari with no app, and patients wait in a virtual waiting room).

- Patient video link: `https://doxy.me/pranadental` (your room)
- Team video link: the doxy.me sign-in page. The alert's **Join video** button opens it on the remote person's phone.

From the Home Screen app, iOS opens the call in an in-app browser. Tapping **Done** returns to the kiosk. If no video link is set, the tile pings the team instead, so nobody gets stuck.

## Payments (bare bones)

- **Now:** paste a **Stripe Payment Link** or **Square checkout link**. "Pay by card / Apple Pay" opens it right on the iPad, and the patient types in the amount. "Pay with the team" just pings the front desk.
- **Later (phase 2):** a card reader at the kiosk (**Stripe Terminal / Tap to Pay on iPhone** or **Square Reader**) needs a small native app or Square's own app. It isn't worth building before there's real volume.

---

## What the top kiosk apps do, and what we copied

Phreesia, Yosi, NexHealth, Weave, and visitor apps like Envoy/Qminder have the same few patterns in common:

- **Fewest possible inputs.** Most ask for name + DOB. We ask for **last name only**, per your brief. If two patients with the same last name ever cause confusion, adding "first initial" is a one-line change.
- **Bilingual toggle on the first screen**, which matters a lot in Miami.
- **Instant staff notification with acknowledgment**, so the patient knows a human saw it. That's our "On my way" loop.
- **Never show other patients' names** on the shared screen, and **auto-reset** between patients.
- **An escape hatch** ("I need help" / call a person) on every screen.
- **Locked-down hardware**: Guided Access, stand, always on.
- What we skipped on purpose: intake forms, insurance card photos, and ID scans. Those belong in the PMS (Dentrix/Open Dental/etc.) pre-visit text link, not at the kiosk.

## Privacy note (read before go-live)

An alert contains the patient's **last name + check-in time**, and it passes through the public ntfy.sh server. The channel name works like a password, but ntfy.sh doesn't sign a HIPAA BAA. Options, from simplest:

1. **Accept for soft launch.** Last name + "checked in" is minimal, but it is still PHI.
2. **Send initials only** ("Checked in: R."): a one-line change.
3. **Self-host ntfy** (a $5/month server or a spare Mac; it's the same app and same setup, just change the server field). Or move alerts to a tool you already have a BAA with (Weave, Slack Enterprise, Google Workspace).

## Roadmap ideas (not built)

- Match the last name against today's schedule from the PMS and show "Hi Maria! 10:30 with Dr. Rana": needs a PMS API.
- Text the patient "We're ready for you".
- A wait-time display.
- Auto-pick the language from the patient record.
