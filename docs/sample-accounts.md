# Sample Accounts

Supabase Auth requires passwords to be created through the Auth Admin API
(hashing can't be done via a plain SQL `insert`), so sample accounts are
created by running `scripts/seed-users.mjs` with your service role key —
see the main README's "Create sample accounts" step.

| Role      | Email                      | Password               | Access                          |
|-----------|------------------------------|--------------------------|----------------------------------|
| Owner     | owner@arena51.example        | Arena51!Owner2026         | Full admin — all modules, employee management |
| Reception | reception@arena51.example     | Arena51!Reception2026      | Bookings, walk-ins, live sessions, CRM lookup |
| Customer  | customer@arena51.example      | Arena51!Customer2026       | Customer dashboard, own bookings/wallet |

**Before going live:** rotate every password above, and delete or reset
these accounts if you don't need them in production.

## Role permissions (enforced via Supabase RLS)

- **owner** — everything `manager` can do, plus employee management and
  full audit log access.
- **manager** — pricing, memberships, promo codes, offers, stations, games,
  CMS content, analytics.
- **reception** — bookings, walk-ins, live session start/pause/resume/
  extend/end/move, customer lookup. Cannot edit pricing or memberships.
- **customer** — their own profile, bookings, transactions, loyalty
  ledger, and membership subscription only.
