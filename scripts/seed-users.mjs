/**
 * Arena 51 — Sample account seeder.
 *
 * Supabase Auth passwords must be created through the Auth Admin API
 * (they can't be inserted via plain SQL), so this script creates the
 * three sample accounts referenced in the README and links each one
 * to a `public.profiles` row with the correct role.
 *
 * Usage:
 *   1. Copy .env.example to .env.local and fill in:
 *        NEXT_PUBLIC_SUPABASE_URL
 *        SUPABASE_SERVICE_ROLE_KEY   (Project Settings → API → service_role)
 *   2. node -r dotenv/config scripts/seed-users.mjs dotenv_config_path=.env.local
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SAMPLE_ACCOUNTS = [
  {
    email: 'owner@arena51.example',
    password: 'Arena51!Owner2026',
    full_name: 'Arena 51 Owner',
    role: 'owner',
  },
  {
    email: 'reception@arena51.example',
    password: 'Arena51!Reception2026',
    full_name: 'Arena 51 Reception',
    role: 'reception',
  },
  {
    email: 'customer@arena51.example',
    password: 'Arena51!Customer2026',
    full_name: 'Sample Customer',
    role: 'customer',
  },
];

async function run() {
  for (const account of SAMPLE_ACCOUNTS) {
    console.log(`Creating ${account.role}: ${account.email} ...`);

    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      });

    if (createError) {
      console.error(`  ✗ Auth create failed: ${createError.message}`);
      continue;
    }

    const userId = userData.user.id;

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: account.full_name,
      email: account.email,
      role: account.role,
    });

    if (profileError) {
      console.error(`  ✗ Profile upsert failed: ${profileError.message}`);
      continue;
    }

    console.log(`  ✓ Created with password: ${account.password}`);
  }

  console.log('\nDone. Store these credentials securely and rotate them before going live.');
}

run();
