# Flow: Billing — The Council

_Last updated: July 2026_

---

## Purpose

Define the planned billing model and subscription flow for a future premium tier of The Council.

---

## Current State

**No billing or payment system exists.** The app is free, rate-limited only by IP (3 debates/min). There is no subscription, no payment gateway, and no premium feature gate.

---

## Planned Premium Tier

### Features

| Feature | Free | Pro |
|---|---|---|
| Debates per day | Limited by IP rate limit | Higher limit (e.g. 20/day) |
| Council personas | 9 standard | 9 standard + custom persona |
| Debate history | localStorage only | Unlimited server-side history |
| History export | No | PDF / JSON export |
| Voice output (TTS) | No | Yes (via `/api/tts`) |
| Life Mode | Yes (basic) | Yes (expanded, daily) |
| Share card | Standard | Premium branded |
| Priority queue | No | Yes (lower latency) |

### Pricing Model

Planned: $5–$9/month (USD). Annual discount. No freemium lockout — core debate experience always free.

---

## Planned Technical Flow

### Step 1 — Upgrade CTA

- User clicks "Pro" button in the profile dashboard Billing tab.
- Redirected to Stripe Checkout session.

### Step 2 — Stripe Checkout

- Backend creates a Stripe Checkout session via `POST /api/billing/checkout`.
- User completes payment on Stripe-hosted page.

### Step 3 — Webhook

- Stripe sends `checkout.session.completed` webhook to `POST /api/billing/webhook`.
- Backend verifies Stripe signature.
- Updates user profile in KV: `{ plan: "pro", stripeCustomerId, stripeSubscriptionId }`.

### Step 4 — Feature Gates

- `api/council.js` checks user profile for `plan === "pro"` to relax rate limits.
- Frontend checks `user.plan` to show/hide premium UI.

### Step 5 — Cancellation

- User cancels via Stripe Customer Portal (linked from Billing tab).
- Stripe sends `customer.subscription.deleted` webhook.
- Backend downgrades profile to free tier.

---

## Environment Variables (Planned)

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API key for backend calls |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_ID` | Stripe Price ID for the pro plan |

---

## Security Notes

- Stripe secret key never exposed to the frontend.
- All Stripe webhooks verified via `stripe.webhooks.constructEvent()`.
- Plan status always read from the server-side KV profile, never trusted from client state.

---

## Future Improvements

- Implement Stripe integration (see ROADMAP.md).
- Add invoice history in the Billing tab.
- Add grace period on failed payments before downgrading.
- Consider Lemon Squeezy or Paddle as Stripe alternatives for VAT handling.
- Add team/group plans.
