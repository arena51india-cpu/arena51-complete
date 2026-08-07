import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { assignBestStation, type ExistingBookingWindow } from '@/lib/booking/stationAssignment';
import { z } from 'zod';

const querySchema = z.object({
  players: z.coerce.number().int().min(1).max(4),
  bookingDate: z.string(),
  startTime: z.string(),
  durationMinutes: z.coerce.number().int(),
  preferredGameId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    players: searchParams.get('players'),
    bookingDate: searchParams.get('bookingDate'),
    startTime: searchParams.get('startTime'),
    durationMinutes: searchParams.get('durationMinutes'),
    preferredGameId: searchParams.get('preferredGameId') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { players, bookingDate, startTime, durationMinutes, preferredGameId } = parsed.data;
  const supabase = await createClient();

  const requestedStart = new Date(`${bookingDate}T${startTime}`);
  const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60_000);

  const { data: stations } = await supabase
    .from('gaming_stations')
    .select('*')
    .eq('is_active', true);

  // Pull same-day bookings that are still "live" (not cancelled/no-show)
  // to check for overlaps against the requested window.
  const { data: dayBookings } = await supabase
    .from('bookings')
    .select('assigned_station_id, booking_date, start_time, duration_minutes, status')
    .eq('booking_date', bookingDate)
    .in('status', ['confirmed', 'in_progress']);

  const existingBookings: ExistingBookingWindow[] = (dayBookings ?? [])
    .filter((b) => b.assigned_station_id)
    .map((b) => {
      const start = new Date(`${b.booking_date}T${b.start_time}`);
      const end = new Date(start.getTime() + b.duration_minutes * 60_000);
      return { stationId: b.assigned_station_id as string, startsAt: start, endsAt: end };
    });

  let preferredGame = null;
  if (preferredGameId) {
    const { data } = await supabase.from('games').select('*').eq('id', preferredGameId).single();
    preferredGame = data ?? null;
  }

  const result = assignBestStation({
    stations: stations ?? [],
    existingBookings,
    players,
    requestedStart,
    requestedEnd,
    preferredGame,
  });

  return NextResponse.json(result);
}
