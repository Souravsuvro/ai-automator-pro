# AI Automator Pro

**AI-powered SaaS Business Autopilot for Wix users & Partners**

Turns a one-time Business DNA profile into Wix AI instructions, SEO blueprints, content calendars, automations, email sequences, external citation plans, and mobile/PWA guidance.

## Live

- Production: https://ai-automator-pro.vercel.app
- Repo: https://github.com/Souravsuvro/ai-automator-pro

## Stack

- Frontend: HTML + Tailwind + vanilla JS SPA (iframe-ready)
- Backend: Vercel serverless `/api/generate`, `/api/health`
- AI: OpenAI-compatible when `OPENAI_API_KEY` is set; template fallback always works
- SEO: meta, OG, JSON-LD, robots.txt, sitemap.xml
- Mobile: responsive + PWA manifest

## Env vars (Vercel)

| Variable | Purpose |
|----------|--------|
| `OPENAI_API_KEY` or `AI_API_KEY` | Real LLM |
| `OPENAI_BASE_URL` | Optional custom endpoint |
| `AI_MODEL` | Default `gpt-4o-mini` |

## Embed on Wix

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

## Wix Partner submission

See `docs/PARTNER_SUBMISSION.md`. Submission is completed in the Wix Dev Center (not available via API).

## License

MIT
