# School Management System (SMS)

A school management platform for Sovereign Grace School (Ghana): administrators,
teachers, students, parents/guardians, and accountants each get a
role-specific portal backed by one documented, versioned REST API.

Built for a single school. Not a multi-tenant/SaaS product — every account
belongs to this one school, with no sign-up flow or per-school data
isolation. A separate multi-tenant build is a possible future project, not
a mode this codebase switches into.

**Read [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the detailed,
honest build log and scope decisions.** This file is the practical
setup/reference guide.

## Stack

| Layer    | Technology |
|----------|------------|
| Backend  | PHP 8.3, Laravel 13, Sanctum (SPA session auth), spatie/laravel-permission |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form + Zod |
| Database | PostgreSQL |
| Testing  | Pest (backend, 43 tests), `tsc` strict type-check (frontend) |

Monorepo layout: `backend/` (Laravel API) and `frontend/` (React SPA), each
independently runnable.

## Prerequisites

- PHP 8.3+ with extensions: `pdo_pgsql`, `mbstring`, `openssl`, `curl`,
  `fileinfo`, `zip`, `intl`, `sodium`, `gd` (and `pdo_sqlite` if you want to
  run the test suite, which uses SQLite in-memory for speed)
- Composer 2.x
- Node.js 20+ and npm
- PostgreSQL 14+
- Git

## Local setup

### 1. Database

Create a database and a least-privilege role for the app (do **not** use
the Postgres superuser for the application connection):

```sql
CREATE ROLE sms_user LOGIN PASSWORD 'choose-a-real-password';
CREATE DATABASE school_management OWNER sms_user;
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` — at minimum set `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` to
match what you created above, and `FRONTEND_URL`/`SANCTUM_STATEFUL_DOMAINS`
if the frontend won't be on `localhost:5173`.

```bash
php artisan migrate --seed   # creates schema + 5 local dev accounts (see below)
php artisan serve            # http://127.0.0.1:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Open `http://localhost:5173` and log in with one of the seeded accounts
below. The Vite dev server proxies `/api/*` and `/sanctum/*` to the Laravel
backend on port 8000 (see `frontend/vite.config.ts`) — in production these
would instead be served from the same origin, or CORS configured for a
separate frontend origin (already wired up via `config/cors.php` and
`SANCTUM_STATEFUL_DOMAINS`).

### Seeded local dev accounts

`php artisan db:seed` (bundled into `migrate --seed` above) creates one
account per role, all with password `Passw0rd!2026` unless you override it
via the `DEV_SEED_PASSWORD` environment variable:

| Role | Email |
|---|---|
| Administrator | admin@school.test |
| Teacher | teacher@school.test |
| Student | student@school.test |
| Parent | parent@school.test |
| Accountant | accountant@school.test |

**This seeder is for local development only.** See "Admin account setup"
under Deployment for production.

## Running tests

```bash
cd backend
php artisan test              # 43 Pest tests: auth, authorization boundaries, financial integrity
```

```bash
cd frontend
npm run test                  # Vitest + React Testing Library — 20 tests
npm run build                 # tsc --strict type-check, then production build
```

Frontend tests cover the pure utility functions (`lib/utils.ts`), the
password-visibility toggle, the dark-mode theme toggle (including
localStorage persistence), and the login form's validation and error
states (mocking the API layer — no real network calls). This is
intentionally not exhaustive coverage of every page; the rest of the
frontend is type-checked and was manually exercised against the live
backend for the critical end-to-end workflow (see
`IMPLEMENTATION_PLAN.md`).

## API documentation

All endpoints are versioned under `/api/v1`. Full endpoint list: `php
artisan route:list --path=api/v1` from `backend/`.

**Authentication** is Laravel Sanctum's SPA (cookie + session) flow, not
bearer tokens — this is what the React app uses and is also the recommended
approach for the future Flutter app's *web* consumption, but Flutter mobile
will more likely want token auth (Sanctum supports both; token issuance for
mobile is not yet implemented — see Known limitations):

1. `GET /sanctum/csrf-cookie` — sets the `XSRF-TOKEN` cookie. Required once
   before any state-changing request.
2. `POST /api/v1/login` — body `{ email, password }`. Rate-limited to 5
   attempts/minute. Sets the session cookie on success.
3. Subsequent requests must send the `X-XSRF-TOKEN` header (read from the
   `XSRF-TOKEN` cookie) and `credentials: include`/`withCredentials: true`.
4. `GET /api/v1/me` — current user: `{ id, name, email, roles: string[],
   permissions: string[] }`.
5. `POST /api/v1/logout`.
6. `POST /api/v1/forgot-password` — body `{ email }`. Always returns the
   same message regardless of whether the email exists, so it can't be
   used to enumerate accounts. Rate-limited to 3/minute.
7. `POST /api/v1/reset-password` — body `{ token, email, password }`, where
   `token` comes from the link in the reset email.

**CSV import/export (students)**: `GET /api/v1/students/export` streams a
CSV of every student the caller can see (same scoping as the list
endpoint). `POST /api/v1/students/import` accepts a `file` (multipart,
`.csv`) with columns `admission_number, first_name, last_name,
date_of_birth, gender, admission_date, status, class_name` — processes
one row at a time, creates what it validly can, and returns
`{ created: number, errors: [{ row, messages }] }` for the rest rather
than failing the whole batch on one bad row. `class_name` is optional and
only auto-enrols if it matches an existing class in the current academic
year.

**Authorization**: every protected endpoint is gated by a Laravel Policy
(see `backend/app/Policies/`) checked server-side — the frontend's
role-based navigation is a UI convenience only, never the security
boundary. A student, for example, gets a 403 from the API even if they
craft the request by hand.

**Response conventions**: list endpoints are either a plain JSON array or
a Laravel paginator shape (`{ data, total, per_page, current_page,
last_page, ... }`) — check the controller if unsure. Validation errors are
422 with `{ message, errors: { field: [messages] } }`. Authorization
failures are 403 with `{ message }`. All money fields are integers in
**pesewas** (1 GHS = 100 pesewas) — never floats — both in the database and
over the API; the frontend divides by 100 only for display
(`frontend/src/lib/utils.ts#formatCurrency`).

**Money / financial integrity**: invoice totals are always recalculated
from `invoice_items` inside a DB transaction (`InvoiceService`); payment
allocation locks both the payment and invoice rows (`lockForUpdate`) inside
a transaction and refuses to over-allocate past either side's remaining
balance (`PaymentService`) — see
`backend/tests/Feature/Finance/PaymentAllocationTest.php` for the exact
guarantees this makes and tests.

## Deployment

### Environment

- Set `APP_ENV=production`, `APP_DEBUG=false`, generate a fresh `APP_KEY`.
- Serve over HTTPS; set `SESSION_SECURE_COOKIE=true` implicitly via
  Sanctum's `configureSecureCookieSessions()` once `APP_ENV` isn't local.
- Point `DB_*` at a managed PostgreSQL instance with a dedicated
  least-privilege role (not the superuser).
- Set `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS` to the real frontend
  domain(s).
- `.env` is never committed — `.env.example` documents every variable with
  no real secrets.

### Build

```bash
# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force      # review migrations first on a prod DB
php artisan config:cache
php artisan route:cache
php artisan event:cache

# Frontend
cd frontend
npm ci
npm run build                     # outputs frontend/dist — serve as static files
```

Serve `backend/public` with nginx/Apache + PHP-FPM (not `artisan serve`,
which is a single-threaded dev server). Serve `frontend/dist` as static
files, or let the same web server reverse-proxy `/api` and `/sanctum` to
the Laravel app if hosting both from one origin.

### Admin account setup (production)

The seeded `admin@school.test` account is for local development only —
**do not run `db:seed` against production.** Instead, create the first
administrator with `php artisan tinker`:

```php
$user = \App\Models\User::create([
    'name' => 'Real Admin Name',
    'email' => 'admin@realschool.com',
    'password' => \Illuminate\Support\Facades\Hash::make('a-strong-generated-password'),
]);
$user->assignRole('admin');
```

Change the password on first login (password-change-on-first-login is not
yet built — see Known limitations).

### Email setup

Password reset and "announcement published" emails are real, working
features — but `MAIL_MAILER=log` by default, which writes emails to
`storage/logs/laravel.log` instead of actually sending them. To send real
email (e.g. via Gmail SMTP with an app password — requires 2-Step
Verification on the Google account, generated at
myaccount.google.com/apppasswords):

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=youraddress@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=youraddress@gmail.com
```

No code changes are needed — only these `.env` values.

### SMS / WhatsApp

Not implemented — no paid provider account exists (Twilio, Hubtel SMS, and
Meta's WhatsApp Business API all require one). `SmsGatewayInterface` and
`WhatsAppGatewayInterface` (`backend/app/Services/Messaging/`) exist as a
ready-to-wire abstraction, bound to `Unconfigured*Gateway` implementations
that throw if actually called — the same pattern as
`PaymentGatewayInterface`/`PaystackGateway` for payments. Swap the binding
in `AppServiceProvider` once a real provider account exists.

### Queue / scheduled tasks

Not currently required — nothing in this MVP is queued; announcement and
password-reset emails send synchronously on the request that triggers
them. If you wire up the Paystack integration or a real SMS/WhatsApp
provider, you'll want `php artisan queue:work` running as a supervised
process and the scheduler cron entry per Laravel's standard deployment
docs.

### Backup and restore

Standard PostgreSQL backup applies — this app adds no special storage:

```bash
pg_dump -U sms_user -Fc school_management > backup.dump
# restore:
pg_restore -U sms_user -d school_management --clean backup.dump
```

Back up the `.env` file's `APP_KEY` separately and securely — losing it
makes existing encrypted session/cookie data unreadable (no application
data is encrypted at rest with it in this MVP, so this is low-stakes, but
still worth keeping).

## Known limitations (honest, as of this build)

See `IMPLEMENTATION_PLAN.md` for the full implemented/partial/not-done
breakdown. Highlights:

- **Mobile Money / Paystack integration**: the gateway interface and
  signature verification are implemented (`PaystackGateway`), but there is
  no HTTP endpoint wiring it up yet, and it has never been tested against
  a real Paystack account (no credentials available in this environment).
  Manual payment recording is the only working payment path — and that's
  the deliberate choice for now, not just a gap (see "Email setup" /
  "SMS / WhatsApp" above for what *is* real).
- **Transportation management** (buses/routes) is not implemented.
- **SMS/WhatsApp notifications** are not implemented — see "SMS / WhatsApp"
  above. Email notifications (password reset, announcements) are real and
  working, defaulting to a log-only mail driver until real SMTP
  credentials are provided.
- **Timetable publish/draft state**: unlike exams and assessments,
  timetable entries are always immediately visible once created (no
  draft state) — a deliberate scope cut, documented in
  `IMPLEMENTATION_PLAN.md`.
- **Frontend automated tests exist but are not exhaustive** — 20 Vitest/RTL
  tests cover utilities, the password toggle, dark mode, and the login
  form; most pages are still only manually exercised and type-checked.
- **CSV import/export exists for students only** — not for teachers,
  guardians, invoices, or anything else.
- A handful of `FormRequest`-validated endpoints run validation before the
  authorization check, so an unauthorized request with invalid data gets
  a 422 instead of a 403 (the action is still correctly blocked either
  way — this only affects which error code/detail is returned, not
  whether the fully-authorized write succeeds). Noted for a future pass.
- This system has been authorization-tested for the specific boundaries
  listed in `IMPLEMENTATION_PLAN.md`, and no feature here has been
  claimed as "complete" without a passing test or a manual verification
  documented there. It has **not** had a professional penetration test,
  and no software should ever be described as unhackable.
