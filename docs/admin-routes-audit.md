# Admin Route & Production Hardening Audit

_Task #394 — generated May 2026._

This document is the single source of truth for:
1. **Every admin-only client page** and which guard protects it
2. **Every admin-only HTTP API** and which middleware enforces it
3. **The full env-var checklist** validated at server boot
4. **The release gate** that keeps un-validated content invisible to learners
5. **The dev → prod database sync procedure**

If you add a new admin page or `/api/admin/*` endpoint, **update this file in
the same PR**.

---

## 1. Admin role model

- **Source of truth**: `users.role` column (`"admin"` | `"learner"` | `"parent"`).
- **Email allowlist**: `ADMIN_EMAILS` env var, comma-separated. Defaults to
  `karlit@kthtech.co.za,kreativethinkinghub@gmail.com`.
- **Enforcement on every login** (`server/replit_integrations/auth/replitAuth.ts`):
  - If the OIDC email is on the allowlist → role is set to `"admin"`.
  - If the email is **not** on the allowlist but the row is currently `"admin"` → demoted to `"learner"`.
- **Server middleware** (`server/routes.ts`):
  - `isAuthenticated` — session/OIDC check.
  - `requireRole("admin")` — re-validates `users.role === "admin"` AND
    `isAdminEmail(users.email)` for every request.
  - **Blanket guard** at `app.use("/api/admin", isAuthenticated, requireRole("admin"))`
    covers _all_ `/api/admin/*` routes by default. Individual routes also
    re-apply `requireRole("admin")` defensively.

## 2. Admin pages (client)

Most admin pages are wrapped in `<RequireAdminRoute>` in `client/src/App.tsx`.
The guard waits for `useAuth()` to resolve before rendering, so non-admins
**never** see a flash of admin chrome — they see an "Admin Only" block.

The DBE Portal uses its own separate guard (`RequireDBEPortalAuth`) defined
in `client/src/App.tsx`. It checks the Replit OIDC session via `useAuth()`
and requires `user.role === "admin"`, but instead of showing a generic
"Admin Only" block it redirects non-authenticated or non-admin visitors to
`/dbe-portal/login` (a public route) to surface a clearer "Access Denied"
message.

| Path                              | Component                  | Guard                |
|-----------------------------------|----------------------------|----------------------|
| `/dbe-portal/login`               | `DBEPortalLoginPage`       | public (no guard)    |
| `/dbe-portal`                     | `DBEPortalPage`            | `RequireDBEPortalAuth` |
| `/learn/admin/reports`            | `AdminReportsPage`         | `RequireAdminRoute`  |
| `/learn/admin/products`           | `AdminProductsPage`        | `RequireAdminRoute`  |
| `/admin/content-studio`           | `AdminContentStudioPage`   | `RequireAdminRoute`  |
| `/learn/admin/topic-audio`        | `AdminTopicAudioPage`      | `RequireAdminRoute`  |
| `/learn/admin/emails`             | `AdminEmailsPage`          | `RequireAdminRoute`  |
| Dashboard (admin variant)         | `AdminDashboardPage`       | branched in `AdminOrLearnerDashboard` based on `user.role` |

## 3. Admin APIs (server)

Routes under `/api/admin/*` are **all** covered by the blanket guard registered
at `server/routes.ts:1264`:

```ts
app.use("/api/admin", isAuthenticated, requireRole("admin"));
```

In addition, every individual handler re-asserts `requireRole("admin")` so a
future refactor that removes the blanket guard will not silently expose them.

Other routes that act on admin-only resources (and so apply `requireRole("admin")`
explicitly):
- `/api/billing/admin/*`
- `/api/topic-audio/admin/*`

## 3a. Full admin API route inventory (auto-enumerated May 2026)

Every route below sits under `/api/admin/*` and is therefore covered by the
blanket `app.use("/api/admin", isAuthenticated, requireRole("admin"))` guard.
Each handler that does sensitive work also re-applies `requireRole("admin")`
inline (defence-in-depth). Inventory generated from `server/routes.ts` —
re-run `rg -no 'app\.(get|post|delete|put|patch)\("[^"]+"' server/routes.ts | rg "/api/(admin|billing/admin|topic-audio/admin)"`
when adding new endpoints.

| Method  | Path                                                                | Inline guard re-applied |
|---------|---------------------------------------------------------------------|-------------------------|
| POST    | /api/admin/toggle-subscription                                      | yes |
| PATCH   | /api/admin/users/:targetUserId/first-touch-source                   | yes |
| POST    | /api/admin/users/:targetUserId/force-unlock                         | yes |
| GET     | /api/admin/users/:targetUserId/lock-status                          | yes |
| GET     | /api/admin/learner-referrals/summary                                | yes |
| GET     | /api/admin/learner-referrals/recent                                 | yes |
| POST    | /api/admin/partner-schools/bulk                                     | yes |
| GET     | /api/admin/referral-flags                                           | yes |
| PATCH   | /api/admin/referral-flags/:id/review                                | yes |
| POST    | /api/admin/emergency                                                | yes |
| GET     | /api/admin/emergency/status                                         | yes |
| GET     | /api/admin/config                                                   | yes |
| PATCH   | /api/admin/config                                                   | yes |
| GET     | /api/admin/nsc-timetable                                            | yes |
| POST    | /api/admin/reseed-timetable                                         | yes |
| GET     | /api/admin/subjects-list                                            | yes |
| PATCH   | /api/admin/timetable-mapping/:id                                    | yes |
| GET     | /api/admin/is-super-admin                                           | yes |
| GET     | /api/admin/dbe-ingestion/subjects                                   | yes |
| POST    | /api/admin/dbe-ingestion/run                                        | yes |
| POST    | /api/admin/dbe-ingestion/upload                                     | yes |
| GET     | /api/admin/dbe-uploads/list                                         | yes |
| GET     | /api/admin/dbe-uploads/file                                         | yes |
| POST    | /api/admin/dbe-ingestion/run-all                                    | yes |
| GET     | /api/admin/dbe-ingestion/status                                     | yes |
| POST    | /api/admin/dbe-ingestion/verify                                     | yes |
| POST    | /api/admin/dbe-ingestion/fix-hashes                                 | yes |
| POST    | /api/admin/dbe-ingestion/rebuild-mastery                            | yes |
| POST    | /api/admin/dbe-ingestion/quality-check                              | yes |
| POST    | /api/admin/dbe-ingestion/fill-missing                               | yes |
| GET     | /api/admin/dbe-ingestion/missing-memos                              | yes |
| GET     | /api/admin/dbe-ingestion/completeness/:subject                      | yes |
| POST    | /api/admin/dbe-ingestion/qa-check                                   | yes |
| POST    | /api/admin/dbe-ingestion/simulate                                   | yes |
| POST    | /api/admin/dbe-ingestion/simulate-all                               | yes |
| GET     | /api/admin/dbe-ingestion/simulate-all/status                        | yes |
| POST    | /api/admin/dbe-ingestion/simulate-subject                           | yes |
| GET     | /api/admin/notes/seed-all/status                                    | yes |
| POST    | /api/admin/notes/seed-all/stop                                      | yes |
| POST    | /api/admin/notes/seed-all                                           | yes |
| POST    | /api/admin/dbe-ingestion/simulate-all/stop                          | yes |
| POST    | /api/admin/dbe-ingestion/validate-all                               | yes |
| GET     | /api/admin/dbe-ingestion/validate-all/status                        | yes |
| GET     | /api/admin/plans                                                    | yes |
| PATCH   | /api/admin/plans/:id                                                | yes |
| GET     | /api/admin/products                                                 | yes |
| PATCH   | /api/admin/products/:id                                             | yes |
| GET     | /api/admin/reports/stats                                            | yes |
| GET     | /api/admin/reports/parents                                          | yes |
| GET     | /api/admin/reports/learners                                         | yes |
| GET     | /api/admin/reports/schools                                          | yes |
| POST    | /api/admin/schools                                                  | yes |
| POST    | /api/admin/schools/bulk                                             | yes |
| GET     | /api/admin/schools/:id                                              | yes |
| PUT     | /api/admin/schools/:id                                              | yes |
| GET     | /api/admin/schools/:id/activity                                     | yes |
| GET     | /api/admin/schools/:id/contact-log                                  | yes |
| POST    | /api/admin/schools/:id/contact-log                                  | yes |
| GET     | /api/admin/schools/:id/export                                       | yes |
| GET     | /api/admin/reports/learners-v2                                      | yes |
| POST    | /api/admin/learners/bulk-assign-trial                               | yes |
| GET     | /api/admin/learners/export                                          | yes |
| POST    | /api/admin/dbe-ingestion/validate-csv                               | yes |
| GET     | /api/admin/dbe-ingestion/sync-status                                | yes |
| POST    | /api/admin/dbe-ingestion/sync-production                            | yes |
| GET     | /api/admin/reports/partners                                         | yes |
| GET     | /api/admin/reports/partner-stats                                    | yes |
| GET     | /api/admin/reports/monthly                                          | yes |
| GET     | /api/admin/analytics/dau                                            | yes |
| GET     | /api/admin/analytics/quiz-completion                                | yes |
| GET     | /api/admin/analytics/badge-rate                                     | yes |
| GET     | /api/admin/analytics/readiness-by-school                            | yes |
| POST    | /api/admin/analytics/inactivity-alert                               | yes |
| POST    | /api/admin/dbe-ingestion/fix-all                                    | yes |
| POST    | /api/admin/dbe-ingestion/restart                                    | yes |
| POST    | /api/admin/dbe-ingestion/clear-subject                              | yes |
| POST    | /api/admin/dbe-ingestion/clear-all                                  | yes |
| GET     | /api/admin/dbe-ingestion/sync-production/status                     | yes |
| GET     | /api/admin/dbe-ingestion/sync-production/history                    | yes |
| GET     | /api/admin/dbe-ingestion/history                                    | yes |
| POST    | /api/dbe/generate-from-paper                                        | yes (admin-gated by Task #394) |
| GET     | /api/admin/dbe-ingestion/years                                      | yes |
| POST    | /api/admin/dbe-ingestion/run-year                                   | yes |
| GET     | /api/admin/dbe-ingestion/questions                                  | yes |
| GET     | /api/admin/dbe-ingestion/source-content                             | yes |
| GET     | /api/admin/dbe-ingestion/export                                     | yes |
| GET     | /api/admin/escalations                                              | yes |
| PATCH   | /api/admin/escalations/:id                                          | yes |
| POST    | /api/admin/topics/:id/generate-audio                                | yes |
| GET     | /api/admin/preview/status                                           | yes |
| POST    | /api/admin/preview/enter                                            | yes |
| POST    | /api/admin/preview/exit                                             | yes |
| GET     | /api/admin/schools/:schoolId/prelim-timetable                       | yes |
| PUT     | /api/admin/schools/:schoolId/prelim-timetable                       | yes |
| GET     | /api/admin/timetable                                                | yes |
| PATCH   | /api/admin/timetable/mappings/:id                                   | yes |
| POST    | /api/admin/timetable/regenerate                                     | yes |
| GET     | /api/admin/timetable/cohort-pressure                                | yes |
| GET     | /api/admin/timetable/reminder-campaigns                             | yes |
| PATCH   | /api/admin/timetable/reminder-campaigns/:cohortKey                  | yes |
| POST    | /api/admin/timetable/send-reminders                                 | yes |
| POST    | /api/admin/timetable/send-custom-reminder                           | yes |
| POST    | /api/admin/comms/parent-rate-prompt                                 | yes |
| GET     | /api/admin/timetable/reminder-log                                   | yes |
| GET     | /api/admin/emails/preview                                           | yes |
| POST    | /api/admin/emails/test-send                                         | yes |

**Total: 106 admin endpoints, all guarded.**

## 4. Boot-time environment validation

Defined in `server/index.ts`:

| Group                        | Required in dev | Required in prod | Behaviour if missing |
|------------------------------|-----------------|------------------|----------------------|
| `DATABASE_URL`               | yes             | yes              | **Crash on boot**    |
| `SESSION_SECRET`             | yes             | yes              | **Crash on boot**    |
| `REPL_ID`                    | optional        | yes              | **Crash on boot in prod** |
| `REPLIT_DOMAINS`             | optional        | yes              | **Crash on boot in prod** |
| `ADMIN_EMAILS`               | optional        | yes              | **Crash on boot in prod** |
| `OPENAI_API_KEY`             | optional        | yes              | **Crash on boot in prod** |
| `YOCO_SECRET_KEY`            | optional        | recommended      | Loud `[WARN]`, feature disabled |
| `YOCO_WEBHOOK_SECRET`        | optional        | recommended      | Loud `[WARN]`, feature disabled |
| `VAPID_PUBLIC_KEY`           | optional        | recommended      | Loud `[WARN]`, feature disabled |
| `VAPID_PRIVATE_KEY`          | optional        | recommended      | Loud `[WARN]`, feature disabled |

## 5. Release Gate (Task #394)

Learner endpoints that read past-paper content **only return rows where
`dbe_verbatim_questions.released_at IS NOT NULL`**. A `(subject, year,
paperNumber, session, language)` tuple is released by `server/release-gate.ts`
when both:

- `memo_text` length ≥ 20 chars on **≥ 98 %** of rows in the tuple, **and**
- `mark_scheme.criteria` is a non-empty array on **≥ 98 %** of rows in the tuple.

The gate is invoked at the end of every ingestion pass:
- Single-subject runner: `Phase 4 — Release Gate` in `/api/admin/dbe-ingestion/run`.
- Batch runner: per-subject after `rebuildMasteryFromExisting` in `/api/admin/dbe-ingestion/run-all`.

**Learner endpoints that respect the release gate**:
- `GET /api/exam/mini-mock/subjects`
- `GET /api/exam/mini-mock/questions`
- `GET /api/exam/full/papers`
- `GET /api/exam/full/paper`
- `POST /api/exam/full/submit`
- `GET /api/dbe/available`
- `GET /api/dbe/questions`

**No lazy generation** runs in any learner path — the only writer of `released_at`
is the ingestion runner. If a paper isn't released, learners simply don't see
it; we no longer render a "Questions being prepared" placeholder.

The admin DBE dashboard surfaces three counts per subject in
`/api/admin/dbe-ingestion/subjects` (`papersIngested`, `papersValidated`,
`papersReleased`) so admins can see exactly how many papers are stuck before
the gate.

## 6. Dev → Prod database sync procedure

Replit projects use **separate** PostgreSQL databases for the workspace (dev)
and the published deployment (prod). Schema and seed data must be promoted
explicitly. **Never edit the production database manually.**

### Promote a schema change
1. Edit `shared/schema.ts` and add a matching SQL file under `migrations/` (e.g. `migrations/0011_dbe_release_gate.sql`).
2. In dev, run `npm run db:push` — `drizzle-kit push` reconciles the schema with the `DATABASE_URL` it sees (the dev DB).
3. Verify the migration applied: open the workspace DB pane and confirm the new columns/indexes exist.
4. Promote to prod via the **Database** skill: open it with `environment: "production"` and run the same SQL from the migration file (read-only `SELECT` first to confirm the columns are missing, then the `ALTER` statements).
5. Re-deploy the app so the new code reads the new columns.

### Re-seed canonical data into prod
The canonical seeders are idempotent and safe to re-run:
- `scripts/seed-exam-papers-from-catalog.ts` — repopulates `exam_papers` from
  `server/data/dbe-papers-catalog.json`.
- `scripts/seed-missing-language-subjects.ts` — adds the official language
  subject rows.
- `scripts/run-ingest-2015-2025.ts` — drives the DBE ingestion runner; the
  release gate will stamp released rows automatically.

To run a seeder against prod, set `DATABASE_URL` to the production database URL
in a one-off shell (do **not** persist it) and execute:

```bash
DATABASE_URL=<prod-url> npx tsx scripts/seed-exam-papers-from-catalog.ts
```

### Dev vs prod row-count report
Run the read-only comparison script to see exactly which tables differ
between the two databases before a sync:

```bash
DEV_DATABASE_URL=<dev-url> PROD_DATABASE_URL=<prod-url> \
  npx tsx scripts/dev-prod-row-counts.ts
```

It prints per-table counts plus the `dbe_verbatim_questions` tuple totals
(ingested vs released) for each environment. Use this before and after every
production sync to confirm the move landed.

### What never to do
- ❌ Don't `DELETE FROM dbe_verbatim_questions WHERE released_at IS NULL` on
  prod to "clean up". Un-released rows are the input to the next gate pass.
- ❌ Don't manually `UPDATE dbe_verbatim_questions SET released_at = NOW()` —
  that bypasses the coverage check and exposes broken papers to learners.
- ❌ Don't edit `users.role` manually to grant admin. Add the email to
  `ADMIN_EMAILS` and have the user re-login; the allowlist will promote them.
