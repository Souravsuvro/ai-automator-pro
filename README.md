# AI Automator Pro

**One-Click Business Autopilot for Wix**

A polished, self-contained web app that turns a short “Business DNA” profile into ready-to-paste Wix AI instructions, SEO blueprints, content calendars, automation recipes, email sequences, brand-voice checks, and weekly digests.

Ship it **today** as a standalone web app that any Wix subscriber can embed via an HTML/iframe element. Monetize with Stripe Checkout links. Optionally package it later as a real Wix Blocks / App Market app.

---

## Why this path is faster than the Wix App Market

| Approach | Time to first paying customer | Approval | Billing |
|----------|-------------------------------|----------|---------|
| **Standalone web app + iframe embed** | Same day | None | Your Stripe account |
| Wix App Market (Blocks / CLI) | Weeks–months | Required | Wix billing or external |

This repository gives you both: a production-ready embeddable app **and** the documentation to turn it into a native Wix app later.

---

## Features

| Feature | What it does |
|---------|--------------|
| **Business DNA Profile** | One-time quiz (industry, tone, audience, goals, USP) that powers every generation |
| **One-Click Wix AI Instructions** | Flagship — complete, tailored prompts for Wix’s site/content AI |
| **SEO Blueprint Generator** | Keyword targets, meta descriptions, page structure, on-page checklist |
| **Content Calendar Generator** | 30 days of blog/social ideas + caption starters |
| **Automation Recipe Builder** | Plain-English Wix Automations / Velo triggers ready to set up |
| **Email Sequence Generator** | Welcome series, abandoned-cart recovery, re-engagement |
| **Brand Voice Checker** | Flags copy that drifts from the Business DNA |
| **Weekly Digest** | Auto-summarized “what to automate next” |

### Pricing tiers (simulated in the UI)

- **Free** — 1 profile, 3 generations/month, watermarked output  
- **Pro (~$15/mo)** — unlimited generations, all features, clean export  
- **Business (~$39/mo)** — team seats, white-label export, priority support  

Stripe Payment Link placeholders are included. Replace them with your real links.

---

## Quick start (no build step)

```bash
git clone https://github.com/Souravsuvro/ai-automator-pro.git
cd ai-automator-pro

# Option A — open locally
# Just open index.html in a browser (or use any static server)

# Option B — Vercel (recommended for production)
npx vercel --prod
```

The app is pure HTML + Tailwind CDN + vanilla JS. No Node build required.

---

## Embed on a Wix site

1. Deploy the app (Vercel, Netlify, Cloudflare Pages, or any static host).
2. In Wix Editor → **Add** → **Embed Code** → Custom Embed / HTML iframe.
3. Paste:

```html
<iframe
  src="https://YOUR-DEPLOYED-URL.vercel.app"
  width="100%"
  height="900"
  style="border:0;border-radius:12px;"
  title="AI Automator Pro"
  loading="lazy"
  allow="clipboard-write"
></iframe>
```

4. Publish. Done.

See the in-app **Embed Guide** or `docs/DEPLOYMENT.md` for more detail.

---

## Project structure

```
ai-automator-pro/
├── index.html              # App shell + Tailwind
├── js/
│   ├── app.js              # SPA navigation, wizard, dashboard, pricing
│   ├── generators.js       # All generation logic (template + rules engine)
│   └── storage.js          # localStorage profile / usage / tier
├── docs/
│   ├── DEPLOYMENT.md
│   └── WIX_APP_MARKET.md   # Step-by-step App Market + billing checklist
├── wix-blocks/             # Notes & scaffold for future Blocks packaging
└── README.md
```

---

## Connecting a real LLM (optional)

The current generators produce high-quality, structured output from the Business DNA using carefully designed templates and logic. For production-grade AI:

1. Create a small backend (Vercel serverless, Cloudflare Worker, etc.).
2. In `js/generators.js`, replace the body of each `generate*` function with a `fetch` to your API.
3. Keep the same return shape (`{ title, sections: [{ heading, content }], meta }`) so the UI does not need changes.
4. Pass the full profile + feature type as the system/user prompt.

---

## Monetization

1. Create Stripe products / prices (or Payment Links) for Pro and Business.
2. Replace the placeholder `https://buy.stripe.com/...` URLs in the Pricing view (`js/app.js`).
3. For real subscription enforcement, add a lightweight backend that:
   - Creates Checkout Sessions
   - Listens to `customer.subscription.*` webhooks
   - Exposes a simple “current plan” endpoint the frontend can call (or use Stripe Customer Portal)

Demo tier buttons in the UI only change `localStorage` so you can test limits without paying.

---

## Future: Wix Blocks / App Market

A full checklist lives in [`docs/WIX_APP_MARKET.md`](docs/WIX_APP_MARKET.md). High-level path:

1. Scaffold a Wix Blocks app or use the Wix CLI.
2. Wrap this UI as a dashboard page or custom element.
3. Implement Wix OAuth + (optionally) Wix Billing, or keep Stripe.
4. Submit for review.

The current standalone version already delivers the core value and revenue path while you wait.

---

## License

MIT — use it, sell it, white-label it. Attribution appreciated but not required.

---

Built for Wix site owners who want results without spending 20 minutes on every prompt.
