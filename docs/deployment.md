# Deployment Guide — Vercel

## 1. Prerequisites

- A GitHub (or GitLab/Bitbucket) repository containing this project
- A Supabase project with `supabase/schema.sql` and `supabase/seed.sql` run
  (see the main README's Setup section)
- The `arena51-public` Storage bucket created (see `docs/storage-setup.md`)
- A Razorpay account (test mode is fine to start) with API keys
- A Resend account with a verified sending domain and API key

## 2. Push to Git

```bash
git init
git add .
git commit -m "Arena 51 — initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/arena51.git
git push -u origin main
```

## 3. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
2. Framework preset: **Next.js** (auto-detected).
3. Leave build settings at their defaults — `npm run build` / `.next`.

## 4. Environment variables

In the Vercel project → **Settings → Environment Variables**, add every
variable from `.env.example`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret) |
| `SUPABASE_PROJECT_ID` | Supabase → Project Settings → General |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same value as `RAZORPAY_KEY_ID` |
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_FROM_EMAIL` | A verified sender, e.g. `"Arena 51 <bookings@yourdomain.com>"` |
| `CONTACT_NOTIFICATION_EMAIL` | Where Contact form messages should be emailed |
| `NEXT_PUBLIC_SITE_URL` | Your production URL, e.g. `https://arena51.vercel.app` |
| `APP_SECRET` | Any long random string |

Set these for the **Production** environment at minimum; add them to
Preview/Development too if you want branch previews to work fully.

## 5. Configure Supabase Auth redirect URLs

In Supabase → **Authentication → URL Configuration**, add your Vercel
domain to both:
- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

This is required for email confirmation links and OTP login to redirect
back correctly.

## 6. Deploy

Click **Deploy**. Vercel builds and deploys automatically on every push
to `main` from here on.

## 7. Post-deploy checklist

- [ ] Visit `/register` and create a test account — confirm the profile
      row appears in Supabase's `profiles` table (the `handle_new_user`
      trigger should create it automatically)
- [ ] Run `node -r dotenv/config scripts/seed-users.mjs dotenv_config_path=.env.local`
      locally (pointed at production env vars) to create the sample
      owner/reception/customer accounts, or create your real owner
      account directly in Supabase Auth and set its `profiles.role` to
      `owner`
- [ ] Log into `/admin` with the owner account and fill in the CMS:
      homepage hero, contact info, business hours, logo
- [ ] Make a real ₹1 test booking in Razorpay test mode to confirm the
      full payment → webhook-free verification flow works end-to-end
- [ ] Switch Razorpay from test mode to live mode keys when ready to
      accept real payments
- [ ] Rotate the sample account passwords or delete them

## 8. Custom domain

In Vercel → **Settings → Domains**, add your domain and follow the DNS
instructions. Remember to update `NEXT_PUBLIC_SITE_URL` and the Supabase
Auth redirect URLs to match the final domain.
