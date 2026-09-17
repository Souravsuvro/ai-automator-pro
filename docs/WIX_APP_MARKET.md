# Step-by-step: Submit AI Automator Pro to the Wix App Market & set up billing

This checklist turns the current standalone web app into a native Wix experience (Blocks or CLI) and gets it listed with proper monetization.

> **Timeline reality check (2026):** App Market review can take days to several weeks. Keep the iframe version live and earning while you wait.

---

## Phase 0 — Decide architecture

Choose one:

| Path | Pros | Cons |
|------|------|------|
| **Wix Blocks** | Visual builder, custom elements, good for dashboard-style apps | Less control over complex SPA routing |
| **Wix CLI / custom app** | Full control, React/Vue possible, easier to reuse existing code | More setup |

Recommendation for this product: **Wix Blocks** for the first native version (dashboard page + settings), keep the full SPA available as an external iframe fallback or “Power Mode”.

---

## Phase 1 — Prerequisites

- [ ] Wix account with a Premium site (required for app development)
- [ ] Join the [Wix Developers](https://dev.wix.com) program / create a Developer account
- [ ] Install Wix CLI if going the code route: `npm install -g @wix/cli` (or current equivalent)
- [ ] Stripe account ready (or decide to use Wix’s own billing)
- [ ] Privacy policy + terms of service URLs (required for market listing)

---

## Phase 2 — Scaffold the native app

### Option A — Blocks

1. Go to Wix Blocks → Create New App.
2. Create a **Dashboard Page** (or Widget) that will host the Automator UI.
3. Either:
   - Re-implement the core flows inside Blocks using its design system, **or**
   - Embed the existing SPA via a custom element / HTML component that loads your hosted app (quickest path).
4. Add an **App Settings** panel for:
   - API key / LLM provider (if self-hosted)
   - Default Business DNA fields
   - Branding / white-label options (Business tier)

### Option B — CLI

1. `wix app create` (or current scaffold command).
2. Choose React (or the stack that matches your preference).
3. Port `js/app.js`, `generators.js`, `storage.js` into the new structure.
4. Replace `localStorage` with Wix storage / your backend + Wix member identity.

---

## Phase 3 — Authentication & identity

- [ ] Implement Wix OAuth so the app knows which site / user is using it.
- [ ] Map Wix user / site ID → your customer record (for subscription checks).
- [ ] Persist Business DNA server-side (keyed by site ID or member ID) so it survives iframe refreshes and multi-device use.

---

## Phase 4 — Billing options

### Option 1 — Keep Stripe (recommended for speed & control)

- [ ] Create products/prices in Stripe (Pro $15, Business $39).
- [ ] Use Stripe Checkout or Customer Portal.
- [ ] Webhook endpoint updates the user’s plan in your database.
- [ ] Frontend (or Blocks page) calls your backend to read current plan.

### Option 2 — Wix Billing / Paid Apps

- [ ] Configure pricing plans inside the Wix Dev Center.
- [ ] Use Wix’s billing APIs / components so purchase happens inside the Wix dashboard.
- [ ] Handle plan changes and cancellations via Wix webhooks.

Hybrid is possible: free tier + Stripe for Pro/Business while the market listing shows “Free with paid upgrades”.

---

## Phase 5 — Permissions & data

Declare only the permissions you need, e.g.:

- Read site metadata (optional)
- Manage or read contacts (only if you later add CRM features)
- Site content (usually not required for this app)

Minimize scope to speed up review.

---

## Phase 6 — Listing assets

Prepare:

- [ ] App name: **AI Automator Pro**
- [ ] Short description (≤ 80–100 chars)
- [ ] Long description with feature list and screenshots of the flagship flow
- [ ] 3–5 high-quality screenshots (desktop + mobile)
- [ ] Promo video (optional but high conversion)
- [ ] Support email / URL
- [ ] Privacy policy & terms links
- [ ] Category: Marketing / SEO / Productivity / AI tools (pick the best fit at submission time)

---

## Phase 7 — Testing before submit

- [ ] Install the app on a test Premium site
- [ ] Complete Business DNA → run every generator
- [ ] Verify free limit and upgrade path
- [ ] Test on mobile editor / dashboard if applicable
- [ ] Confirm no console errors or permission failures
- [ ] GDPR / data deletion path works (user can wipe their DNA)

---

## Phase 8 — Submit for review

1. Fill the submission form in the Wix Dev Center.
2. Provide test credentials if the app requires login.
3. Explain clearly:
   - What the app does
   - That AI generation is powered by [your LLM / templates]
   - How billing works
4. Submit and monitor the status.

While waiting, keep the standalone iframe version available and promoted.

---

## Phase 9 — Post-approval

- [ ] Announce on your site, email list, and relevant Facebook / Reddit / Indie Hackers groups
- [ ] Collect feedback and iterate on the Business DNA questions
- [ ] Consider adding more generators (ad copy, Google Business Profile posts, etc.)
- [ ] Monitor usage & Stripe churn

---

## Quick reference — files in this repo

| File | Purpose |
|------|--------|
| `README.md` | Overview & quick start |
| `docs/DEPLOYMENT.md` | Hosting + iframe embed |
| `docs/WIX_APP_MARKET.md` | This checklist |
| `wix-blocks/README.md` | Notes for Blocks packaging |

Good luck. Ship the iframe version first — revenue today beats perfect native distribution tomorrow.
