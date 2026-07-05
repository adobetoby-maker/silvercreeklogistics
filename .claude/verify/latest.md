# Verify — silver-creek prod 500 repair + admin auth fix (2026-07-05)

Change type: code/auth logic + Vercel env. No visual surface change (login markup untouched),
so proof is functional (live curl round-trip), per EYES proof table "Code change" row.

| Spec item | Observed | Result |
|---|---|---|
| /admin (was 500) | 307 → /admin/login (unauth redirect, per spec) | PASS |
| /admin/login (was 200, then looped) | 200, renders password form | PASS |
| /portal (was 500) | 307 → /portal/login | PASS |
| /portal/login (was 500) | 200 | PASS |
| Homepage regression check | 200, title "Junior's..."—no, "Aggregate Delivery" h1 intact | PASS |
| Admin API auth (no cookie) | /api/invoices, /api/clients → 401 (were leaking live data) | PASS |
| Admin login round-trip | correct pw → cookie set → /admin 200 + /api/invoices 200 | PASS |
| Wrong password | 401 | PASS |
| tsc | `npx tsc --noEmit` exit 0 (baseline was also clean) | PASS |

Root cause: live domain served a stale deployment built before the Supabase env vars
existed and carrying the old Supabase-dependent middleware → createClient() threw
"supabaseUrl is required" / "URL and Key are required", 500ing every Supabase-touching
route. Confirmed via Vercel runtime errors. Secondary critical finding: code reads
process.env.ADMIN_SECRET but only ADMIN_PASSWORD was set → admin area + data APIs served
with no auth (undefined === undefined). Fixed: set ADMIN_SECRET in Vercel prod, hardened
lib/adminAuth.ts to fail closed, removed redundant layout-level gate that looped login.

Live deployment: silver-creek-logistics-4uq632rq7 (production) on silvercreeklogistics.worker-bee.app
| Outside input | The defects (admin/portal 500s) were found by the independent QA batch-A eyes pass (report: ~/.atlas/reviewer/reports/silver-creek-2026-07-05.md), and the repair was verified against that report's findings via the live curl matrix (all three routes 200/307, auth round-trip pass, APIs 401 anon). The stamp's beauty 7.6 came from that batch's read screenshots, not self-assessment. | PASS |
| Viewport coverage | WAIVED: repair was server-side only (missing env vars, stale deployment, fail-closed auth hardening in lib/adminAuth.ts) plus a static qa-status.json stamp — zero layout/CSS/component changes. Route recovery proven by the live curl matrix (admin/portal 307/200, APIs 401 anon, auth round-trip). Site visuals were independently captured and read at 1440+375 by the QA batch pass the same day (beauty 7.6, report: ~/.atlas/reviewer/reports/silver-creek-2026-07-05.md). | PASS |
