# Deployment Guide — AI Automator Pro

## 1. Static hosting (fastest)

The app has **no build step**. You only need to serve:

- `index.html`
- `js/` folder (app.js, generators.js, storage.js)

### Vercel

```bash
npx vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard → Deploy.

### Netlify

Drag-and-drop the project folder, or:

```bash
npx netlify deploy --prod --dir=.
```

### Cloudflare Pages

Connect the repo or upload the folder. Framework preset: None. Build command: (empty). Output directory: `/`.

### GitHub Pages

Push to `main`, enable Pages from root (or `/docs` if you prefer). Note: some browsers treat `file://` or certain origins strictly for `localStorage` and clipboard — always test the live HTTPS URL.

---

## 2. Embedding in Wix

1. Deploy the app and copy the public HTTPS URL.
2. In Wix Editor:
   - Add → Embed Code → **Custom Embed** or **HTML iframe**
3. Paste:

```html
<iframe
  src="https://your-app.vercel.app"
  width="100%"
  height="900"
  style="border:0;border-radius:12px;min-height:700px;"
  title="AI Automator Pro"
  loading="lazy"
  allow="clipboard-write"
></iframe>
```

4. Stretch the element to the desired width. Set a generous height (800–1100 px) so the wizard and results feel comfortable.
5. Publish the site.

**Tips**

- Use `allow="clipboard-write"` so the Copy buttons work inside the iframe.
- If you later add a backend, make sure CORS allows your Wix site origin (or serve the API from the same domain).
- For a more “native” feel you can later convert the app into a Wix Blocks custom element (see `docs/WIX_APP_MARKET.md`).

---

## 3. Environment & secrets

Currently everything runs client-side. When you add:

- Real LLM calls → put the API key on a **serverless function**, never in the frontend.
- Stripe → use Checkout Sessions created on the server; never expose the secret key.
- Auth → Supabase, Clerk, Firebase, or your own JWT.

---

## 4. Custom domain

Point a subdomain (e.g. `app.yourdomain.com` or `automator.yourdomain.com`) at the host. Then update the iframe `src` on your Wix sites.

---

## 5. Performance & UX

- The app is already lightweight (Tailwind CDN + three JS files).
- For even faster first paint you can self-host the Tailwind build later, but CDN is fine for v1.
- Consider adding a simple service-worker cache for the JS files if you expect heavy repeat use.

---

## 6. Testing checklist before launch

- [ ] Create Business DNA on desktop and mobile
- [ ] Run the flagship “One-Click Wix AI Instructions”
- [ ] Confirm free-tier limit (3 generations) blocks further runs
- [ ] Simulate Pro/Business via the demo buttons and verify unlimited + no watermark
- [ ] Copy and Download buttons work inside the Wix iframe
- [ ] Stripe placeholder links open (replace with real ones before charging)
- [ ] Clear local data and re-onboard works

You’re ready to embed and sell.
