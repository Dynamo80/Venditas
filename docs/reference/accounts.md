# Accounts and infrastructure

**Names and locations only. No secret value is ever written here** — the live
inventory is `node ops/status.mjs`, which reports whether each is set without
printing it.

| Service | Purpose | Notes |
|---|---|---|
| Vercel | Hosting, `venditas.in` | Executes in `iad1`. Auto-deploys from `main` |
| GitHub | `Dynamo80/Venditas` | Public. Prospect list and send log are gitignored |
| Supabase | Leads, usage metering, customers | Region **unconfirmed** — needed for the DPA |
| Google AI Studio | Gemini extraction | **Unpaid tier** — see decision 003 |
| GoDaddy | `founder@venditas.in` | SMTP `smtpout.secureserver.net:465` |
| Razorpay | Payments | Registered for a **dropshipping** business — category change needed |
| Skydo | International payments | Interim rail for the first customers |

## Environment variables

| Name | Where |
|---|---|
| `GEMINI_API_KEY` | Vercel, `.env.local` |
| `SUPABASE_URL` | Vercel, `.env.local` |
| `SUPABASE_SECRET` | Vercel, `.env.local` — preferred over `SUPABASE_SERVICE_KEY` |
| `CRON_SECRET` | Vercel only |
| `SMTP_HOST` `SMTP_USER` `SMTP_PASS` | `.env.local` only, never deployed |

`.env.local` is gitignored and exists on one machine. **It is not backed up.**

## Email authentication — all three legs pass

```
SPF    v=spf1 include:secureserver.net -all
DKIM   secureserver1 + secureserver2, valid 2048-bit keys
DMARC  p=quarantine, relaxed alignment
```

Verified by a live send landing in the inbox on the domain's first ever message.

## Database migrations

Applied by pasting into the Supabase SQL editor. All are idempotent.

| File | Status |
|---|---|
| `sql/001_leads.sql` | run |
| `sql/002_retention.sql` | run |
| `sql/003_customers.sql` | **not run** — no way to record a paying customer until it is |
