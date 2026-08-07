import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({ bookingId: z.string().uuid() });

const MIN_HOURS_BEFORE_CANCEL = 2;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

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
    .eq('id', parsed.data.bookingId)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isStaff = profile && ['owner', 'manager', 'reception'].includes(profile.role);

  if (booking.profile_id !== user.id && !isStaff) {
    return NextResponse.json({ error: 'You can only cancel your own bookings.' }, { status: 403 });
  }

  if (!['pending_payment', 'confirmed'].includes(booking.status)) {
    return NextResponse.json({ error: 'This booking can no longer be cancelled.' }, { status: 409 });
  }

  if (!isStaff) {
    const start = new Date(`${booking.booking_date}T${booking.start_time}`);
    const hoursUntilStart = (start.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < MIN_HOURS_BEFORE_CANCEL) {
      return NextResponse.json(
        { error: `Bookings can only be cancelled at least ${MIN_HOURS_BEFORE_CANCEL} hours before the start time.` },
        { status: 409 }
      );
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Could not cancel the booking.' }, { status: 500 });
  }

  return NextResponse.json({ booking: updated });
}
