import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getRazorpayClient, toPaise } from '@/lib/payments/razorpay';

const schema = z.object({ membershipId: z.string().uuid() });

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
    return NextResponse.json({ error: 'You must be signed in to purchase a membership.' }, { status: 401 });
  }

  const { data: membership, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('id', parsed.data.membershipId)
    .eq('is_active', true)
    .single();

  if (error || !membership) {
    return NextResponse.json({ error: 'Membership plan not found.' }, { status: 404 });
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: toPaise(membership.price),
      currency: 'INR',
      receipt: `membership-${membership.tier}-${user.id.slice(0, 8)}`,
      notes: { membership_id: membership.id, profile_id: user.id },
    });

    await supabase.from('transactions').insert({
      profile_id: user.id,
      type: 'membership_purchase',
      amount: membership.price,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
      notes: `${membership.display_name} purchase`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Membership order creation failed:', err);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 });
  }
}
