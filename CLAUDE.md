---
project: silver-creek-logistics
category: nextjs-supabase-saas
deploy: vercel
lifecycle: active
last_verified: 2026-05-21
deployment_url: https://silvercreeklogistics.worker-bee.app
---

# Silver Creek Logistics

Freight and logistics company site with dispatch automation, customer portal, and QuickBooks integration.

See `~/.claude/categories/nextjs-supabase-saas.md` for shared stack patterns.
**This file documents deviations and project-specific decisions only.**

---

## Deviations from Category

- **Cloudflare Worker** (`cloudflare-worker/`) runs separately from Vercel — dispatch automation cron
- **Twilio SMS** for dispatch notifications
- **QuickBooks OAuth** for invoice sync
- **Gmail integration** for email notifications
- **CRON_SECRET** must match between Vercel env AND Cloudflare Worker dashboard — they are independent deployments
- **`vercel.json` has a daily cron** at `/api/cron/dispatch` — separate from the CF Worker 30-min cron

## Before Touching

Read `lib/shopInfo.ts` (business facts), `lib/drivers.ts` (dispatch data), and determine whether the change belongs in **Vercel** (main app) or the **Cloudflare Worker** (`cloudflare-worker/`) before writing anything.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | localhost:3000 — use `-H 0.0.0.0` for Tailscale (ADR-0007) |
| `npm run build` | production build |
| `npm run lint` | ESLint |

No test script. Cloudflare Worker deployed separately — see `cloudflare-worker/`.

---

## Architecture

### Auth — dual system, never mix (ADR-0006)

**Admin** (`/admin`) — cookie `admin_session`, signed with `ADMIN_SECRET`, logic in `lib/adminAuth.ts`

**Portal** (`/portal`) — Supabase JWT via `lib/supabase/server.ts`, refreshed in `proxy.ts`

### Supabase Clients (ADR-0002) — same as jrs-auto-repair

| File | Where | Bypasses RLS? |
|---|---|---|
| `lib/supabase/client.ts` | Client Components | No |
| `lib/supabase/server.ts` | Server Components, Route Handlers | No |
| `lib/supabase/admin.ts` | Privileged server ops only | YES — never client-side |

### Routes

| Area | Path | Auth |
|---|---|---|
| Marketing | `/(site)/` | Public |
| Calculator | `/(site)/calculator` | Public |
| Order form | `/(site)/order` | Public |
| Public invoice | `/invoice/[id]` | Public token |
| Admin CRM | `/admin/crm` | Admin cookie |
| Admin clients | `/admin/clients` | Admin cookie |
| Admin invoices | `/admin/invoices` | Admin cookie |
| Admin dispatch | `/admin/dispatch` | Admin cookie |
| Admin marketing | `/admin/marketing` | Admin cookie |
| Admin settings | `/admin/settings` | Admin cookie |
| Customer portal | `/portal/dashboard` | Supabase JWT |
| Customer invoices | `/portal/invoices` | Supabase JWT |

### Dispatch — Two Separate Systems

**Vercel cron** (`vercel.json`): daily at `/api/cron/dispatch` — handles daily summaries
**Cloudflare Worker** (`cloudflare-worker/silvercreek-dispatch`): 30-min cron — real-time dispatch automation

When debugging dispatch: determine which system is responsible before touching anything.
`CRON_SECRET` must match in BOTH Vercel env vars AND Cloudflare Worker env vars — set separately.

### Static Data

- `lib/shopInfo.ts` — business info (single source of truth)
- `lib/materials.ts` — freight materials list
- `lib/drivers.ts` — driver data for dispatch

---

## Env Vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_SECRET
ANTHROPIC_API_KEY
CRON_SECRET                     # shared — must match Vercel AND Cloudflare Worker
GMAIL_USER / GMAIL_APP_PASSWORD # email notifications
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM / TWILIO_DISPATCH_PHONES
QB_CLIENT_ID / QB_CLIENT_SECRET / QB_REDIRECT_URI / QB_ENVIRONMENT
```

---

## Vocabulary

- "Dispatch" = the automated driver notification system — runs in CF Worker + Vercel cron
- "Admin" = internal operations area at /admin (cookie auth)
- "Portal" = customer-facing invoices at /portal (Supabase JWT)
- "CF Worker" = cloudflare-worker/ directory — deployed separately from Vercel

---

## Decision Defaults

| User says / context | Default action |
|---|---|
| "fix dispatch" | Ask: Vercel cron (/api/cron/dispatch) or CF Worker? |
| "add auth" | Ask: /admin (cookie) or /portal (Supabase)? — ADR-0006 |
| "update driver list" | Edit lib/drivers.ts |
| "update business info" | Edit lib/shopInfo.ts only |
| "CRON_SECRET not matching" | Update in BOTH Vercel AND Cloudflare Worker dashboard |
| "QuickBooks not connecting" | Check QB_CLIENT_ID, QB_REDIRECT_URI matches OAuth app settings |
| "Twilio not sending" | Check TWILIO_DISPATCH_PHONES format + Twilio account balance |

---

## Failure Patterns

- Mixing /admin and /portal auth → silent 401s (ADR-0006)
- lib/supabase/admin.ts in Client Component → service role key exposed (ADR-0002)
- CRON_SECRET updated in Vercel but not Cloudflare → dispatch cron silently rejected
- CF Worker change deployed without Vercel env var update → CRON_SECRET mismatch
- `npm run dev` without `-H 0.0.0.0` → Tailscale breaks silently (ADR-0007)
- QuickBooks redirect URI mismatch → OAuth flow fails at callback with no useful error

---

## Delegation Matrix

| Decision | Default |
|---|---|
| Add route, component, API endpoint | Just do it |
| Edit shopInfo.ts / materials.ts / drivers.ts | Just do it |
| Dispatch logic changes | Confirm which system (Vercel vs CF Worker) first |
| CRON_SECRET rotation | Ask — must update two platforms simultaneously |
| QuickBooks OAuth config changes | Ask — affects live invoice sync |
| Delete portal user data | Ask |

---

## Output Contract

1. List files changed (path:line for key changes)
2. State which system was modified: Vercel app, CF Worker, or both
3. Note if CRON_SECRET or any shared env var changed — both platforms need update
4. State what was deferred
5. Suggest next step — don't take it without being asked
