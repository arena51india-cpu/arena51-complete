import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireManagement } from '@/lib/auth/require-staff';

const schema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(['owner', 'manager', 'reception', 'customer']),
});

export async function POST(request: NextRequest) {
  const auth = await requireManagement();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.profileId === auth.profile.id) {
    return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await auth.supabase.from('audit_logs').insert({
    actor_id: auth.profile.id,
    action: 'employee.role_change',
    entity_type: 'profile',
    entity_id: parsed.data.profileId,
    metadata: { new_role: parsed.data.role },
  });

  return NextResponse.json({ success: true });
}
