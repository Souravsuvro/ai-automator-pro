# Wix Partner / App Market Submission (2026)

Aligned with Wix App Market Guidelines, Blocks publish flow, and automated AI review.

## Positioning

AI Automator Pro integrates with Wix workflows (Wix AI prompts, Automations/Velo, SEO, content). Distributable as a self-hosted Dashboard iframe today and as a Blocks/Market app after review. Blocks apps are not supported in Wix Harmony.

## Requirements we implement

- HTTPS iframe URLs
- Dashboard query params: instance, locale, viewMode, siteUrl, isPublish
- Free tier includes core features (freemium pattern)
- Privacy policy URL (`/privacy.html`)
- Graceful API errors with template fallback
- Plan-aware UX (free limits vs Pro unlimited)

## Market listing

**Name:** AI Automator Pro  
**Teaser:** One-click Wix AI & growth playbooks  
**Features:** Business DNA profile; Wix AI prompts; SEO, calendars, automations & citations

## Publish steps

1. Wix Studio → Custom Apps / Blocks
2. Dashboard page extension → iframe `https://ai-automator-pro.vercel.app/`
3. Complete Market Listing; resolve Blockers
4. Submit & Publish (automated AI review)
5. Fix any new blockers and resubmit

See: https://dev.wix.com/docs/build-apps/develop-your-app/develop-an-app-with-blocks/publish-blocks-apps-to-the-app-market/publish-a-blocks-app-to-the-app-market

Partner Center final submit cannot be automated from this repository tooling.
