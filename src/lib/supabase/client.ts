import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database.types';

/**
 * Client-side Supabase client for use in Client Components.
 * Uses the anon/public key — safe to expose in the browser.
 * Row Level Security policies (see supabase/schema.sql) control access.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
