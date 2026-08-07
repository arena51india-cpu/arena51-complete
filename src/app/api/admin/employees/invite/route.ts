import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireManagement } from '@/lib/auth/require-staff';
import { createAdminClient } from '@/lib/supabase/server';

const schema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: z.enum(['manager', 'reception']), // owners are provisioned outside the app for safety
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const auth = await requireManagement();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { fullName, email, role, password } = parsed.data;
  const admin = createAdminClient();

  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !userData.user) {
    return NextResponse.json({ error: createError?.message ?? 'Could not create the account.' }, { status: 500 });
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ full_name: fullName, role })
    .eq('id', userData.user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  await admin.from('audit_logs').insert({
    actor_id: auth.profile.id,
    action: 'employee.invite',
    entity_type: 'profile',
    entity_id: userData.user.id,
    metadata: { role, email },
  });

  return NextResponse.json({ success: true });
}
