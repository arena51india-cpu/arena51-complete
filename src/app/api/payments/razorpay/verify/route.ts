import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyRazorpayPaymentSchema } from '@/lib/booking/schemas';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { sendBookingConfirmation } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = verifyRazorpayPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  let signatureValid = false;
  try {
    signatureValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
  } catch (err) {
    console.error('Signature verification error:', err);
    return NextResponse.json({ error: 'Payment verification is not configured correctly.' }, { status: 500 });
  }

  // Use the admin client (service role) here because this route performs
  // a trusted state transition (payment confirmed) that must not be
  // blocked by the customer-scoped RLS policy on `bookings`.
  const supabase = createAdminClient();

  if (!signatureValid) {
    await supabase
      .from('transactions')
      .update({ status: 'failed', razorpay_payment_id, razorpay_signature })
      .eq('razorpay_order_id', razorpay_order_id);

    return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  await supabase
    .from('transactions')
    .update({ status: 'paid', razorpay_payment_id, razorpay_signature })
    .eq('razorpay_order_id', razorpay_order_id);

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: booking.balance_amount > 0 ? 'partial' : 'paid',
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Payment verified but booking update failed. Contact support.' }, { status: 500 });
  }

  // Create the corresponding live-session row so reception can start it
  // when the customer arrives.
  const scheduledStart = new Date(`${booking.booking_date}T${booking.start_time}`);
  const scheduledEnd = new Date(scheduledStart.getTime() + booking.duration_minutes * 60_000);

  await supabase.from('sessions').insert({
    booking_id: booking.id,
    station_id: booking.assigned_station_id,
    status: 'not_started',
    scheduled_start: scheduledStart.toISOString(),
    scheduled_end: scheduledEnd.toISOString(),
  });

  // Award loyalty points: 1 point per ₹10 spent (adjust via CMS later).
  if (booking.profile_id) {
    const pointsEarned = Math.floor(booking.total_amount / 10);
    if (pointsEarned > 0) {
      await supabase.from('loyalty_ledger').insert({
        profile_id: booking.profile_id,
        booking_id: booking.id,
        points: pointsEarned,
        reason: `Booking ${booking.booking_reference}`,
      });

      await supabase.rpc('increment_loyalty_points', {
        p_profile_id: booking.profile_id,
        p_points: pointsEarned,
      });
    }
  }

  if (booking.customer_email) {
    try {
      const { data: station } = await supabase
        .from('gaming_stations')
        .select('station_name')
        .eq('id', booking.assigned_station_id)
        .single();

      await sendBookingConfirmation(booking.customer_email, {
        customerName: booking.customer_name,
        bookingReference: booking.booking_reference,
        bookingDate: booking.booking_date,
        startTime: booking.start_time.slice(0, 5),
        durationMinutes: booking.duration_minutes,
        stationName: station?.station_name ?? 'Assigned on arrival',
        totalAmount: booking.total_amount,
        advanceAmount: booking.advance_amount,
        balanceAmount: booking.balance_amount,
      });
    } catch (err) {
      console.error('Booking confirmation email failed:', err);
    }
  }

  return NextResponse.json({ booking: updatedBooking });
}
