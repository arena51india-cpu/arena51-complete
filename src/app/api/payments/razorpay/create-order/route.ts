import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createRazorpayOrderSchema } from '@/lib/booking/schemas';
import { getRazorpayClient, toPaise } from '@/lib/payments/razorpay';
import { isValidAdvanceAmount, computeBalance, MIN_ADVANCE_AMOUNT } from '@/lib/pricing/calculator';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createRazorpayOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', parsed.data.bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ error: 'This booking has already been paid.' }, { status: 409 });
  }

  let chargeAmount = booking.advance_amount;

  // A custom amount means the customer is securing a previously-unpaid
  // (₹0 advance) booking from their dashboard — validate and persist it
  // as the booking's advance before charging.
  if (parsed.data.amount !== undefined) {
    if (booking.status === 'confirmed' || booking.status === 'in_progress') {
      return NextResponse.json({ error: 'This booking is already secured.' }, { status: 409 });
    }
    if (!isValidAdvanceAmount(parsed.data.amount, booking.total_amount) || parsed.data.amount < MIN_ADVANCE_AMOUNT) {
      return NextResponse.json({ error: `Enter at least ₹${MIN_ADVANCE_AMOUNT}.` }, { status: 400 });
    }

    chargeAmount = parsed.data.amount;
    await supabase
      .from('bookings')
      .update({
        advance_amount: chargeAmount,
        balance_amount: computeBalance(booking.total_amount, chargeAmount),
      })
      .eq('id', booking.id);
  }

  if (chargeAmount < MIN_ADVANCE_AMOUNT) {
    return NextResponse.json(
      { error: `Choose an amount of at least ₹${MIN_ADVANCE_AMOUNT} to pay.` },
      { status: 400 }
    );
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: toPaise(chargeAmount),
      currency: 'INR',
      receipt: booking.booking_reference,
      notes: {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
      },
    });

    await supabase.from('transactions').insert({
      profile_id: booking.profile_id,
      booking_id: booking.id,
      type: 'booking_payment',
      amount: chargeAmount,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingReference: booking.booking_reference,
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    return NextResponse.json({ error: 'Could not initiate payment. Please try again.' }, { status: 502 });
  }
}
