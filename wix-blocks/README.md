# Wix Blocks Scaffold Notes

This folder is a placeholder for the future native Wix Blocks packaging of AI Automator Pro.

## Recommended structure (when you create the Blocks app)

```
ai-automator-blocks/
├── src/
│   ├── dashboard/          # Main Automator dashboard page
│   │   └── page.tsx (or .js)
│   ├── settings/           # App settings panel
│   ├── components/         # Shared UI (profile form, result cards…)
│   └── backend/            # Optional web methods for LLM proxy / Stripe
├── wix.config.json
└── package.json
```

## Fastest path to a “native” feel

1. Host the current SPA on Vercel (or similar).
2. In Blocks, create a Dashboard Page that contains a single **HTML Component / Custom Element** loading the SPA in an iframe (or via `srcdoc` if size allows).
3. Pass the current site ID / instance ID as a query param so the SPA can later call your backend with the correct tenant.
4. Add a Settings panel for branding and plan info.

This gives you an App Market listing and in-dashboard presence with almost zero rewrite of the working product.

## When you are ready to go fully native

- Port the Business DNA wizard and generators into Blocks design system components.
- Move storage to Wix Data or your own database keyed by `instanceId`.
- Replace the Stripe demo buttons with Wix Billing or a proper Checkout flow.

Until then, the root of this repository remains the production source of truth.
