# Implementation Plan — School Management System (SMS)

## Reality check on scope

The original brief lists 31 database entities, 5 portals, Mobile Money payment
integration, SMS/WhatsApp notifications, transportation management, and a
future Flutter app — and asks for all of it in one day. That's not achievable
as literally stated by one engineer in one session. Instead this plan follows
the brief's own fallback priority list (its "Execution Rules" item 16) and
builds a genuinely working, secure, tested MVP on that subset. Everything
deferred is listed explicitly at the bottom, not hidden.

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
- Real-time notifications (email/SMS/WhatsApp) — in-app `notifications`
  table + model only; no delivery channel wired up.
- Payment provider (Paystack/Hubtel) live integration — interface + manual
  fallback only, no account credentials exist to test against.
- CSV import/export — not implemented in MVP pass.
- Announcements/calendar UI — backend model only if time allows; may not
  get a frontend screen.
- Flutter app — not started; API is versioned (`/api/v1`) and documented
  so it can be consumed later.

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
- [ ] README, .env.example, deployment docs finalized
- [ ] Final honest status report (implemented/tested/partial/not done)

This file is the single source of truth for progress — update checkboxes
in place rather than creating new status documents.
