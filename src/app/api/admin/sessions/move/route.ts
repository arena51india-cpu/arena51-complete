import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/require-staff';

const schema = z.object({ sessionId: z.string().uuid(), newStationId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const auth = await requireStaff();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sessionId, newStationId } = parsed.data;

  const { data: existing, error: fetchError } = await auth.supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const { data: newStation } = await auth.supabase
    .from('gaming_stations')
    .select('*')
    .eq('id', newStationId)
    .single();

  if (!newStation || newStation.status !== 'available') {
    return NextResponse.json({ error: 'The selected station is not available.' }, { status: 409 });
  }

  const oldStationId = existing.station_id;

  const { data, error } = await auth.supabase
    .from('sessions')
    .update({ station_id: newStationId, moved_from_station_id: oldStationId })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Could not move the session.' }, { status: 500 });

  await auth.supabase.from('gaming_stations').update({ status: 'available' }).eq('id', oldStationId);
  await auth.supabase.from('gaming_stations').update({ status: 'occupied' }).eq('id', newStationId);
  await auth.supabase.from('bookings').update({ assigned_station_id: newStationId }).eq('id', existing.booking_id);

  return NextResponse.json({ session: data });
}
