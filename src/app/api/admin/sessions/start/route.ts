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

  const now = new Date().toISOString();

  const { data, error } = await auth.supabase
    .from('sessions')
    .update({ status: 'active', actual_start: now })
    .eq('id', parsed.data.sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Could not start the session.' }, { status: 500 });

  await auth.supabase.from('bookings').update({ status: 'in_progress' }).eq('id', data.booking_id);
  await auth.supabase.from('gaming_stations').update({ status: 'occupied' }).eq('id', data.station_id);

  return NextResponse.json({ session: data });
}
