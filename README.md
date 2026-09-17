# AI Automator Pro v1.4

Multi-tenant SaaS for Wix: Business DNA → Wix AI prompts, SEO, FAQ schema, automations.

## v1.4 upgrades

- **Real auth** — register/login JWT (`/api/auth/*`), scrypt password hashing
- **Stripe Checkout** — `/api/stripe/checkout`, Customer Portal, webhooks → tier sync
- **Wix instance verification** — HMAC-SHA256 of `instance` query param (`WIX_APP_SECRET`)
- **Tenant binding** — `wixInstanceId` on user + Stripe metadata
- **Optional Redis** — Upstash REST for durable multi-instance storage

## Env

See [docs/ENV.md](docs/ENV.md)

## API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/register` | — | Create account |
| `POST /api/auth/login` | — | Login |
| `GET /api/auth/me` | Bearer | Current user |
| `POST /api/wix/verify` | — | Verify Wix instance |
| `POST /api/stripe/checkout` | Bearer | Start Checkout |
| `POST /api/stripe/portal` | Bearer | Billing portal |
| `POST /api/stripe/webhook` | Stripe sig | Subscription lifecycle |

## License

MIT
