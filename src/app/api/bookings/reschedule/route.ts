import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { assignBestStation, type ExistingBookingWindow } from '@/lib/booking/stationAssignment';

const schema = z.object({
  bookingId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

const MIN_HOURS_BEFORE_RESCHEDULE = 2;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bookingId, bookingDate, startTime } = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isStaff = profile && ['owner', 'manager', 'reception'].includes(profile.role);

  if (booking.profile_id !== user.id && !isStaff) {
    return NextResponse.json({ error: 'You can only reschedule your own bookings.' }, { status: 403 });
  }

  if (!['pending_payment', 'confirmed'].includes(booking.status)) {
    return NextResponse.json({ error: 'This booking can no longer be rescheduled.' }, { status: 409 });
  }

  if (!isStaff) {
    const currentStart = new Date(`${booking.booking_date}T${booking.start_time}`);
    const hoursUntilStart = (currentStart.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < MIN_HOURS_BEFORE_RESCHEDULE) {
      return NextResponse.json(
        { error: `Bookings can only be rescheduled at least ${MIN_HOURS_BEFORE_RESCHEDULE} hours before the start time.` },
        { status: 409 }
      );
    }
  }

  const requestedStart = new Date(`${bookingDate}T${startTime}`);
  const requestedEnd = new Date(requestedStart.getTime() + booking.duration_minutes * 60_000);

  const { data: stations } = await supabase.from('gaming_stations').select('*').eq('is_active', true);

  const { data: dayBookings } = await supabase
    .from('bookings')
    .select('id, assigned_station_id, booking_date, start_time, duration_minutes, status')
    .eq('booking_date', bookingDate)
    .in('status', ['confirmed', 'in_progress'])
    .neq('id', bookingId);

  const existingBookings: ExistingBookingWindow[] = (dayBookings ?? [])
    .filter((b) => b.assigned_station_id)
    .map((b) => {
      const start = new Date(`${b.booking_date}T${b.start_time}`);
      const end = new Date(start.getTime() + b.duration_minutes * 60_000);
      return { stationId: b.assigned_station_id as string, startsAt: start, endsAt: end };
    });

  let preferredGame = null;
  if (booking.preferred_game_id) {
    const { data } = await supabase.from('games').select('*').eq('id', booking.preferred_game_id).single();
    preferredGame = data ?? null;
  }

  const assignment = assignBestStation({
    stations: stations ?? [],
    existingBookings,
    players: booking.players,
    requestedStart,
    requestedEnd,
    preferredGame,
  });

  if (!assignment.stationId) {
    return NextResponse.json(
      { error: assignment.reason || 'No station is available for the new time slot.' },
      { status: 409 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({
      booking_date: bookingDate,
      start_time: startTime,
      assigned_station_id: assignment.stationId,
      status: 'confirmed',
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Could not reschedule the booking.' }, { status: 500 });
  }

  // Keep the linked live-session row in sync, if one exists.
  const newScheduledEnd = new Date(requestedStart.getTime() + booking.duration_minutes * 60_000);
  await supabase
    .from('sessions')
    .update({
      station_id: assignment.stationId,
      scheduled_start: requestedStart.toISOString(),
      scheduled_end: newScheduledEnd.toISOString(),
    })
    .eq('booking_id', bookingId);

  return NextResponse.json({ booking: updated, assignedStation: assignment.station });
}
