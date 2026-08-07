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

  const { data: existing, error: fetchError } = await auth.supabase
    .from('sessions')
    .select('*')
    .eq('id', parsed.data.sessionId)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const pausedSeconds = existing.paused_at
    ? Math.floor((Date.now() - new Date(existing.paused_at).getTime()) / 1000)
    : 0;

  const { data, error } = await auth.supabase
    .from('sessions')
    .update({
      status: 'active',
      paused_at: null,
      total_paused_seconds: existing.total_paused_seconds + pausedSeconds,
    })
    .eq('id', parsed.data.sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Could not resume the session.' }, { status: 500 });

  return NextResponse.json({ session: data });
}
