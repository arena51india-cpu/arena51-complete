import { createClient } from '@/lib/supabase/server';

const STAFF_ROLES = new Set(['owner', 'manager', 'reception']);
const MANAGEMENT_ROLES = new Set(['owner', 'manager']);

export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: 'You must be signed in.' };
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || !STAFF_ROLES.has(profile.role)) {
    return { ok: false as const, status: 403, error: 'Staff access required.' };
  }

  return { ok: true as const, supabase, profile };
}

export async function requireManagement() {
  const result = await requireStaff();
  if (!result.ok) return result;

  if (!MANAGEMENT_ROLES.has(result.profile.role)) {
    return { ok: false as const, status: 403, error: 'Owner or manager access required.' };
  }

  return result;
}
