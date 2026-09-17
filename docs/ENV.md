# Environment variables (Vercel)

## Required for production SaaS

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Long random string for signing auth tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_PRO` | Price ID for Pro |
| `STRIPE_PRICE_BUSINESS` | Price ID for Business |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `APP_URL` | Public URL e.g. `https://ai-automator-pro.vercel.app` |

## Wix multi-tenant

| Variable | Purpose |
|----------|---------|
| `WIX_APP_SECRET` | App Secret from Wix Dev Center → OAuth |

Without `WIX_APP_SECRET`, instance payloads are decoded but **not** signature-verified (dev only).

## Optional persistence

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token |

Without Redis, accounts use process memory (not durable across cold starts).

## AI

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | LLM generations |
| `AI_MODEL` | Default `gpt-4o-mini` |

## Stripe checklist

1. Create Products + recurring Prices → copy Price IDs
2. Webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Enable Customer Portal in Stripe Billing settings
