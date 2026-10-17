# Implementation Plan — School Management System (SMS)

## Reality check on scope

The original brief lists 31 database entities, 5 portals, Mobile Money payment
integration, SMS/WhatsApp notifications, transportation management, and a
future Flutter app — and asks for all of it in one day. That's not achievable
as literally stated by one engineer in one session. Instead this plan follows
the brief's own fallback priority list (its "Execution Rules" item 16) and
builds a genuinely working, secure, tested MVP on that subset. Everything
deferred is listed explicitly at the bottom, not hidden.

**Single-school, not multi-tenant (2026-10-17 decision):** a multi-tenant
version (schools sign up, pay, get approved by a platform owner, with full
per-school data isolation) was built and verified working, then explicitly
reverted at the owner's request — see commit `33acb7c`. The owner's actual
need right now is one school, Sovereign Grace School; multi-tenancy adds
real complexity (a schools table, approval gating, and eventually full
per-resource data isolation across ~18 policy files) that isn't worth
carrying for a single customer. If multi-tenancy is wanted later, the
reverted commit (`7fc61a7`) is a working starting point to cherry-pick from,
but the stated plan is a separate build for that case, not toggling this
one. Do not reintroduce schools/platform_admin without being asked again.

## Stack (as specified)

- Backend: PHP 8.3, Laravel (latest stable), Sanctum, PostgreSQL
- Frontend: React + TypeScript (strict) + Vite + Tailwind CSS
- Testing: Pest (backend), Vitest (frontend)
- Monorepo layout: `/backend` (Laravel API), `/frontend` (React SPA)

## MVP scope (building this)

1. Auth & RBAC — Sanctum SPA auth, 5 roles (admin, teacher, student, parent,
   accountant) via spatie/laravel-permission, policies on every endpoint.
2. Core school data — academic years/terms, classes, subjects,
   class-subject map, teacher-class-subject assignments.
3. People — students, teachers, guardians, student-guardian links with
   relationship type, enrolments per class/year.
4. Timetable — weekly period grid per class/subject/teacher, basic
   teacher/class double-booking conflict detection.
5. Examinations — scheduled exams (date/time/venue/instructions) with
   draft/published state.
6. Assessments & results — scored assessments (max mark, weight), results
   entry, draft vs published visibility, audit trail on changes.
7. Attendance — per class/day/student register.
8. Finance — fee structures by class+term, invoices, invoice line items,
   manual payment recording with allocation to invoices, outstanding
   balance calculation, receipts. No live Mobile Money integration (no
   provider credentials available) — a clean integration boundary
   (`PaymentGatewayInterface`) is built and documented instead.
9. Role dashboards — admin, teacher, student, parent, accountant, each
   showing only data they're authorized to see, computed from real queries.
10. Audit log for financial and result changes.
11. Tests — Pest feature tests for auth boundaries (student/parent
    isolation, teacher scoping, IDOR attempts) and financial integrity
    (no negative balances, no duplicate payment allocation, transactional
    invoice math).
12. Deployment docs — README, `.env.example`, migration/seed instructions,
    production checklist.

## Explicitly deferred (documented, not pretended)

- Transportation management (bus/routes) — not implemented.
- Payment provider (Paystack/Hubtel) live integration — interface + manual
  fallback only, by deliberate choice (see 2026-10-17 update below), no
  account credentials exist to test against.
- CSV import/export — students only (export + import with per-row error
  reporting); not built for teachers, guardians, invoices, or anything else.
- SMS/WhatsApp notifications — interface only
  (`SmsGatewayInterface`/`WhatsAppGatewayInterface`), bound to stub
  implementations that throw if called; no paid provider account exists.
  Email notifications are real (see 2026-10-17 update).
- Flutter app — not started; API is versioned (`/api/v1`) and documented
  so it can be consumed later.

## Update 2026-10-17: password reset, CSV, email, tests, login redesign

Added in the same session as the single-school decision above, after the
owner explicitly chose manual-only payments ("this is actually... I want
to use this to surprise my mama") and asked to continue with the rest of
the originally-deferred list:

- **Password reset** — `POST /forgot-password` + `/reset-password`, using
  Laravel's built-in password broker, pointed at the SPA's own
  `/reset-password` page. Verified live end-to-end with a real token from
  the log-driver email, including a full login with the new password
  afterward. Mail defaults to `MAIL_MAILER=log`; switches to real Gmail
  SMTP by `.env` values alone once the owner provides an app password —
  see README "Email setup".
- **CSV import/export (students)** — verified live: export produces a
  correct CSV, import creates valid rows and reports per-row errors
  (duplicate admission number, missing required field) without failing
  the whole batch.
- **Email notifications** — publishing an announcement emails everyone in
  its audience (role-based, creator excluded). Verified live against all
  4 other seeded accounts in `storage/logs/laravel.log`.
- **SMS/WhatsApp gateway stub** — `app/Services/Messaging/`, same
  intentionally-unusable pattern as `PaymentGatewayInterface`, ready to
  wire to a real provider later.
- **Frontend automated tests** — Vitest + React Testing Library, 20 tests
  across utils, PasswordInput, ThemeToggle, and LoginPage. Not exhaustive
  (see README "Known limitations").
- **Login page redesign** — two-panel layout with a placeholder
  `SchoolLogo` component (swap for a real logo file with no other code
  changes), reused on login/forgot-password/reset-password/app sidebar.

One real, previously-unknown bug caught and fixed while testing the CSV
export route live: any unauthenticated API request without an
`Accept: application/json` header (e.g. a browser hitting an expired
session on a plain download link) crashed with a 500 — Laravel's default
guest-redirect tried to resolve a `login` web route that doesn't exist in
this API-only app. Fixed via `redirectGuestsTo(fn () => null)` in
`bootstrap/app.php`, verified with a clean 401 afterward.

## Status tracking

Granular task status is tracked inline in this file as the build proceeds
(checkboxes below), updated as each phase completes rather than in a
separate ticket system.

### Checklist

- [x] Toolchain installed (PHP 8.3, Composer, Node LTS, PostgreSQL, Git)
- [x] Laravel app scaffolded, Postgres connected, Sanctum configured
- [ ] Roles/permissions seeded
- [x] Core migrations: academic years/terms, classes, subjects
- [x] People migrations: students, teachers, guardians, links, enrolments
- [x] Scheduling migrations: timetable, exams
- [x] Assessment migrations: assessments, results, attendance
- [x] Finance migrations: fee structures, invoices, line items, payments,
      allocations
- [x] Audit log migration + model observer

  Note: PostgreSQL runs on this dev machine as a direct `pg_ctl` background
  process, not as the registered Windows service — the silent installer's
  service-control permissions didn't allow Start/Stop from this session.
  See README "Known limitations" before relying on auto-start-on-reboot.
- [x] Factories + seeders (dev data: 5 role accounts, Ghana-plausible names)
- [x] Auth endpoints (login, logout, me) — password reset NOT implemented
- [x] Policies for every protected resource (17 policy classes, attribute-wired)
- [x] Service layer: InvoiceService, PaymentService (locked/transactional
      allocation), TimetableConflictService, UserProvisioningService,
      PaymentGatewayInterface + PaystackGateway (untested, no credentials)
- [x] 93 API routes across academics/people/scheduling/assessments/finance/
      announcements/dashboard — full CRUD + role-scoped queries
- [x] Full critical-path end-to-end test run against the live API (admin
      creates class → registers student → links guardian → assigns teacher
      → teacher attendance+results → publish → accountant invoice+payment
      → balance math verified correct → cross-role access denied): 0
      failures. Script: see scratchpad e2e_test.ps1 (not yet ported to Pest)
- [x] Ported into 43 automated Pest tests, all passing (auth, IDOR/role
      isolation for student/parent/teacher scoping, cross-role write
      denial, invoice generation math, payment allocation/locking/
      duplicate-reference integrity). Caught and fixed one real bug in the
      process: GuardianController::linkStudent/unlinkStudent were gated by
      the same `update` ability a parent legitimately has on their own
      profile, which would have let a parent self-link to any student by
      ID — now a separate admin-only `linkStudents` ability.
- [x] React: real pages per portal wired to live endpoints (~35 page/
      component files; Admin has full CRUD for all core resources, Teacher
      has attendance+assessment entry, Student/Parent have read views,
      Accountant has fee/invoice/payment management)
- [x] Frontend build (type-check + production build) passes, 0 errors
- [x] Backend Pest test suite passes (43/43)
- [x] README, .env.example, deployment docs finalized
- [x] Final honest status report (implemented/tested/partial/not done)

This file is the single source of truth for progress — update checkboxes
in place rather than creating new status documents.

## Final status report (2026-10-17)

Verified by re-running everything below against the live local dev
database and a clean build, not just reading code:

**Implemented and tested:**
- Roles seeded and verified in the database (`admin`, `teacher`,
  `student`, `parent`, `accountant` all present via
  `Role::all()->pluck('name')`). Authorization in this codebase is
  role-based (`hasRole()` in all 18 policy classes under
  `backend/app/Policies/`), not granular-permission-based, so seeding
  roles is the complete requirement — there is no separate permissions
  table to populate.
- All 27 migrations applied cleanly (`php artisan migrate:status`: all
  `Ran`), including the Sanctum personal-access-tokens and
  spatie/laravel-permission tables added on 2026-10-17.
- Dev seed data present and verified in the database: 5 role accounts
  plus one class, two subjects, one student enrolment, one
  guardian-student link — all queried live via `tinker`, not assumed.
- Backend Pest suite: 43/43 passing, 76 assertions, re-run clean
  (`php artisan test`).
- Frontend build: `tsc -b && vite build` — 0 type errors, 0 build
  errors, re-run clean.
- README.md and `backend/.env.example` were already complete and
  committed in the initial commit (setup, deployment, API conventions,
  known limitations) — confirmed by reading both in full rather than
  trusting the earlier unchecked checklist state.

**Partial (documented, not hidden):**
- Paystack gateway: interface + signature verification implemented,
  no HTTP endpoint wired up, never tested against a real account (no
  credentials available). Manual payment recording is the only tested
  payment path.
- A handful of `FormRequest`-validated endpoints run validation before
  the authorization check (422 instead of 403 for unauthorized+invalid
  requests — the write is still correctly blocked either way).

**Not done (deferred at MVP scope, per the brief's own fallback
priority list — see "Explicitly deferred" above):**
- Transportation management, live SMS/WhatsApp/email notification
  delivery, CSV import/export, Flutter app, password reset flow,
  frontend automated tests (no Vitest/RTL — manual E2E only), timetable
  draft/publish state.

No feature in this report is marked done without either a passing
automated test or a live, reproducible check performed just now
(migration status, DB role/seed query, test run, build run) — not a
re-statement of what an earlier session believed was true.
