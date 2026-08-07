# Google Login Setup

The "Continue with Google" button on `/login` and `/register` uses
Supabase Auth's built-in Google OAuth provider. It won't work until you
enable it — this is a dashboard configuration step, not something that
can be turned on from code.

## 1. Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) →
   create a project (or use an existing one).
2. **APIs & Services → OAuth consent screen** — configure it (External,
   fill in app name/support email — this is what users see on the
   Google sign-in screen).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs — add exactly:
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
     (find `YOUR-PROJECT-REF` in Supabase → Project Settings → API →
     Project URL)
4. Copy the generated **Client ID** and **Client Secret**.

## 2. Enable the provider in Supabase

1. Supabase Dashboard → **Authentication → Providers → Google**.
2. Toggle it **on**.
3. Paste in the Client ID and Client Secret from step 1.
4. Save.

## 3. Confirm your redirect URLs are registered

Supabase → **Authentication → URL Configuration** should already
include (from the main deployment guide):
- Site URL: your production domain
- Redirect URLs: `https://your-domain/auth/callback` (and
  `http://localhost:3000/auth/callback` for local dev)

## 4. Test it

Go to `/login`, click **Continue with Google**, sign in with a Google
account. You should land back on `/dashboard` as a logged-in customer.
The same `handle_new_user` trigger from `supabase/schema.sql` creates
their `profiles` row automatically — Google sign-ins are treated
exactly like email sign-ups (`role: customer` by default).

No code changes are needed for local vs. production — the app always
redirects to `${window.location.origin}/auth/callback`, so it works on
`localhost:3000` and your real domain automatically as long as both are
registered in Supabase's Redirect URLs list.
