# Environment variables (Vercel)

## Required for production SaaS

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Required: cryptographically random secret of at least 32 bytes for signing auth tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_PRO` | Price ID for Pro |
| `STRIPE_PRICE_BUSINESS` | Price ID for Business |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `APP_URL` | Public URL e.g. `https://ai-automator-pro.vercel.app` |

## Wix multi-tenant

| Variable | Purpose |
|----------|---------|
| `WIX_APP_SECRET` | App Secret from Wix Dev Center → OAuth |

`WIX_APP_SECRET` is mandatory whenever Wix instance payloads are accepted. Missing configuration fails closed; unsigned instance payloads are never trusted.

## Production persistence

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token |

Upstash Redis is mandatory in production for durable account storage and webhook idempotency. Process memory is permitted only for local development; production requests fail closed if Redis is missing.

## AI

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | LLM generations |
| `AI_MODEL` | Default `gpt-4o-mini` |

## Stripe webhook security

- Configure `STRIPE_WEBHOOK_SECRET` for the exact Stripe endpoint and mode (test/live).
- The webhook endpoint verifies the raw request body and signature; it rejects requests when the secret is missing.
- Durable event deduplication requires Upstash Redis in production.

## Stripe checklist

1. Create Products + recurring Prices → copy Price IDs
2. Webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Enable Customer Portal in Stripe Billing settings
