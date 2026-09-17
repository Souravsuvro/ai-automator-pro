# AI Automator Pro

AI-powered Business Autopilot SaaS for **Wix** site owners and Partners (2026-ready).

## Live

- App: https://ai-automator-pro.vercel.app
- Repo: https://github.com/Souravsuvro/ai-automator-pro
- Privacy: https://ai-automator-pro.vercel.app/privacy.html

## What it does

One **Business DNA** profile powers Wix AI instructions, SEO, content calendars, automations, email sequences, brand voice checks, external citations, and mobile/PWA packs.

## Stack

| Layer | Detail |
|-------|--------|
| Frontend | Static HTML/JS SPA, iframe-safe (`frame-ancestors *`) |
| Backend | Vercel `/api/generate`, `/api/health` |
| AI | OpenAI-compatible when `OPENAI_API_KEY` set; template fallback always on |
| Wix | Reads dashboard `instance` query param; embed or Dashboard page extension |
| Compliance | Privacy page, local data clear, freemium limits |

## Env (Vercel)

- `OPENAI_API_KEY` or `AI_API_KEY` — optional LLM
- `OPENAI_BASE_URL` — optional
- `AI_MODEL` — default `gpt-4o-mini`

## Embed

```html
<iframe
  src="https://ai-automator-pro.vercel.app"
  width="100%"
  height="900"
  style="border:0;border-radius:12px;"
  title="AI Automator Pro"
  loading="lazy"
  allow="clipboard-write"
></iframe>
```

## Partner / App Market

See docs/PARTNER_SUBMISSION.md

## License

MIT
