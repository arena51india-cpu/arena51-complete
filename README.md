# Arena 51 Gaming Lounge — Booking, CRM & Business Management System

A commercial-grade booking, CRM, and business management platform for a
gaming lounge — public website, customer dashboard, and admin dashboard,
built on Next.js 15 + Supabase + Razorpay + Resend.

## What's included

**Public website** — Home, Pricing, Games, Book Now, Membership, Offers,
Gallery, About, Contact, Privacy Policy, Terms, 404. Luxury dark theme
(black background, royal gold, neon blue, glassmorphism, a signature
rotating "LED underglow" accent styled after RGB gaming-PC lighting).

**Smart booking engine** — players → date → duration → a live,
MakeMyTrip-style slot availability grid (booked slots are visibly
disabled) → optional preferred game → flexible payment. The system
auto-assigns the best available gaming station; customers never pick a
console by number. No station is ever hardcoded — add one in the Admin
dashboard and the booking engine includes it immediately.

**Flexible payment, not a forced advance** — customers choose how much
to pay now (any amount, minimum ₹50) or reserve with ₹0 down. An unpaid
reservation is clearly marked as *not locked*: only bookings with some
payment received occupy a slot, so another customer who pays can still
take that same time. Customers can secure an unpaid booking any time
before their session from their dashboard.

**Login** — email/password, email OTP, or Google (once enabled — see
`docs/google-oauth-setup.md`).

**Customer dashboard** — login (password or email OTP), bookings with
reschedule/cancel, printable invoices, loyalty points, membership
purchase, wallet with top-up, favourite games, profile, reviews.

**Admin dashboard** — analytics (revenue, occupancy, peak hours, top
games, best customers) with live charts, live session management
(start/pause/resume/extend/move/end with countdown timers), walk-in
bookings, gaming station management, full game library CRUD, pricing +
weekend/festival surcharge rules, memberships, promo codes, offers,
gallery, FAQs, a visual CMS (homepage hero, contact info, business
hours, logo, footer, SEO), customer CRM, employee management with
role-based permissions, and audit logs.

**Integrations** — Supabase (Postgres + Auth + Storage), Razorpay
(bookings, memberships, wallet top-ups), Resend (booking confirmations,
membership/wallet receipts, contact form notifications).

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
Shadcn-style components · Framer Motion-ready · Supabase · Razorpay ·
Resend · Chart.js · React Query-ready · React Hook Form · Zod

## Setup

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required because `react-chartjs-2` (used for the
admin analytics charts) hasn't published updated peer-dependency
metadata for React 19 yet, even though it works correctly with it. This
is a metadata gap, not a real compatibility issue.

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Create the `arena51-public` Storage bucket — see
   `docs/storage-setup.md` for the exact steps and policies (required
   before any image upload in the Admin CMS will work).
4. Copy your Project URL, anon key, and service role key into
   `.env.local` (see `.env.example`).

### 3. Configure Razorpay & Resend

- **Razorpay**: create a test-mode account, copy the Key ID/Secret into
  `.env.local` as `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` /
  `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- **Resend**: create an API key and verify a sending domain, add
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_NOTIFICATION_EMAIL`
  to `.env.local`.

### 3b. (Optional) Enable Google login

The "Continue with Google" button on `/login` and `/register` needs the
Google provider turned on in Supabase — see `docs/google-oauth-setup.md`
for the exact steps. Email/password and email OTP login work without
this.

### 4. Create sample accounts

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
node -r dotenv/config scripts/seed-users.mjs dotenv_config_path=.env.local
```

See `docs/sample-accounts.md` for the created logins and what each role
can access. **Rotate these passwords before going live.**

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy

See `docs/deployment.md` for the full step-by-step Vercel guide,
including Supabase Auth redirect URL configuration and a post-deploy
checklist.

## Project structure

```
arena51/
├─ src/
│  ├─ app/
│  │  ├─ (public pages)         # /, /pricing, /games, /book-now, /membership,
│  │  │                         # /offers, /gallery, /about, /contact,
│  │  │                         # /privacy-policy, /terms, not-found
│  │  ├─ login/, register/, auth/callback/
│  │  ├─ dashboard/             # customer dashboard (bookings, loyalty,
│  │  │                         # membership, wallet, favourites, profile)
│  │  ├─ admin/                 # admin dashboard (analytics, sessions,
│  │  │                         # bookings, stations, games, pricing,
│  │  │                         # memberships, promo-codes, offers,
│  │  │                         # gallery, faqs, cms, customers, messages,
│  │  │                         # employees, audit-logs)
│  │  └─ api/                   # bookings, pricing, promo, stations,
│  │                            # payments (Razorpay), memberships,
│  │                            # contact, admin/sessions, admin/walkin,
│  │                            # admin/employees
│  ├─ components/
│  │  ├─ ui/                    # shadcn-style primitives
│  │  ├─ layout/, home/, booking/, auth/, dashboard/, admin/, shared/
│  ├─ lib/
│  │  ├─ supabase/              # client.ts, server.ts, middleware.ts
│  │  ├─ pricing/                # calculator.ts — pricing engine
│  │  ├─ booking/                # stationAssignment.ts, availability.ts,
│  │  │                          # constants.ts, schemas.ts
│  │  ├─ payments/               # razorpay.ts
│  │  ├─ email/                  # resend.ts, templates.ts
│  │  ├─ security/               # rate-limit.ts
│  │  ├─ auth/                   # require-staff.ts
│  │  ├─ data/                   # public.ts, customer.ts, admin.ts
│  │  └─ types/                  # database.types.ts, razorpay.d.ts
├─ supabase/
│  ├─ schema.sql
│  └─ seed.sql
├─ scripts/
│  └─ seed-users.mjs
├─ docs/
│  ├─ sample-accounts.md
│  ├─ storage-setup.md
│  ├─ google-oauth-setup.md
│  └─ deployment.md
├─ middleware.ts
├─ tailwind.config.ts
└─ .env.example
```

## Key design decisions

- **No hardcoded gaming stations.** `gaming_stations` is a normal table
  the admin manages entirely — the assignment algorithm
  (`src/lib/booking/stationAssignment.ts`) reads whatever rows exist at
  request time. Adding "PS5 #3" or "VR Booth 1" requires zero code
  changes.
- **Pricing is data-driven.** `pricing_plans` holds the current price
  list; `pricing_rules` holds weekend/festival surcharge multipliers
  with optional day-of-week or date-window scoping. Both are editable
  via the Admin dashboard — the calculation logic never changes.
- **RLS enforces RBAC at the database layer**, not just in the UI — even
  if a request bypasses the Next.js API routes, Supabase itself blocks
  unauthorized reads/writes based on the requester's `profiles.role`.
  Admin CRUD screens write directly to Supabase from the browser for
  this reason — the security boundary is the database, not client code.
- **Payments never trust the client.** Every Razorpay flow (booking,
  membership, wallet top-up) verifies the HMAC-SHA256 signature
  server-side before updating any balance or status.
- **Email is best-effort.** Every Resend call is wrapped so a missing
  API key or a delivery failure never blocks a booking, payment, or
  membership activation — the database state is always the source of
  truth.

## Security notes

- **Auth**: Supabase Auth (email/password + email OTP), session cookies
  managed via `@supabase/ssr` with `SameSite=Lax` by default, which
  blocks cookie submission on cross-site POST requests (baseline CSRF
  protection for the cookie-based API routes in this project).
- **RBAC**: enforced at three layers — route middleware
  (`middleware.ts`), API route guards (`src/lib/auth/require-staff.ts`),
  and Postgres RLS policies (`supabase/schema.sql`).
- **SQL injection**: not possible through normal usage — all queries go
  through the Supabase client (parameterized) or PostgREST; no raw
  string-built SQL is used anywhere in the app.
- **XSS**: React escapes all rendered content by default;
  `dangerouslySetInnerHTML` is not used anywhere in this codebase.
- **Payment integrity**: Razorpay webhooks are verified via HMAC-SHA256
  signature check (`src/lib/payments/razorpay.ts`) before any booking,
  membership, or wallet balance is updated.
- **Rate limiting**: a lightweight in-memory limiter
  (`src/lib/security/rate-limit.ts`) protects `/api/contact`,
  `/api/bookings`, and `/api/promo/validate`. This is single-instance
  best-effort — for multi-instance production traffic, swap in Upstash
  Redis + `@upstash/ratelimit` as documented in that file.
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, and HSTS are set globally in
  `next.config.js`.
- **Audit logs**: sensitive admin actions (walk-in booking creation,
  employee invites, role changes) are recorded in `audit_logs` and
  viewable at `/admin/audit-logs` (Owner/Manager only).
- **Secrets**: the Supabase service role key and Razorpay secret are
  server-only — never imported into any client component. `.env.local`
  and `.env*` are gitignored.

## What to verify before going live

- [ ] Run the full booking flow with a real (test-mode) Razorpay payment
- [ ] Make a ₹0 (no advance) test booking and confirm it does NOT block
      the slot for a second booking, then pay to secure it from the
      dashboard and confirm it now shows as unavailable to others
- [ ] Confirm booking/membership/wallet confirmation emails are arriving
- [ ] Replace all sample account passwords
- [ ] Switch Razorpay to live-mode keys
- [ ] Review and adjust the rate-limit thresholds for your expected traffic
- [ ] If you expect multi-instance/high traffic, move rate limiting to
      Upstash Redis (see `src/lib/security/rate-limit.ts`)
