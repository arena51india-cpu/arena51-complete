import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { computeSlotAvailability } from '@/lib/booking/availability';
import type { ExistingBookingWindow } from '@/lib/booking/stationAssignment';

const querySchema = z.object({
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.coerce.number().int().positive(),
  players: z.coerce.number().int().min(1).max(4),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    bookingDate: searchParams.get('bookingDate'),
    durationMinutes: searchParams.get('durationMinutes'),
    players: searchParams.get('players'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bookingDate, durationMinutes, players } = parsed.data;
  const supabase = await createClient();

  const { data: stations } = await supabase.from('gaming_stations').select('*').eq('is_active', true);

  // Only bookings that have actually secured payment occupy a slot —
  // see the comment on computeSlotAvailability for why pending_payment
  // (₹0 advance) bookings are excluded here.
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

  const slots = computeSlotAvailability({
    stations: stations ?? [],
    existingBookings,
    bookingDate,
    durationMinutes,
    players,
  });

  return NextResponse.json({ slots });
}
