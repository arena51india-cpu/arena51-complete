import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/require-staff';

const schema = z.object({ sessionId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const auth = await requireStaff();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('sessions')
    .update({ status: 'paused', paused_at: new Date().toISOString() })
    .eq('id', parsed.data.sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Could not pause the session.' }, { status: 500 });

  return NextResponse.json({ session: data });
}
