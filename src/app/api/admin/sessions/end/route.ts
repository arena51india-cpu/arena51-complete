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
    .select('*, bookings(*)')
    .eq('id', parsed.data.sessionId)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const now = new Date().toISOString();

  const { data, error } = await auth.supabase
    .from('sessions')
    .update({ status: 'ended', actual_end: now })
    .eq('id', parsed.data.sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Could not end the session.' }, { status: 500 });

  const booking = existing.bookings as any;

  await auth.supabase
    .from('bookings')
    .update({ status: 'completed', payment_status: 'paid' })
    .eq('id', existing.booking_id);

  await auth.supabase.from('gaming_stations').update({ status: 'available' }).eq('id', existing.station_id);

  if (booking?.profile_id) {
    await auth.supabase.rpc('record_completed_visit', {
      p_profile_id: booking.profile_id,
      p_hours: booking.duration_minutes / 60,
      p_amount: booking.total_amount,
    });
  }

  return NextResponse.json({ session: data });
}
