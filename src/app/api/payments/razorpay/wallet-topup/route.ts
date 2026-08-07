import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getRazorpayClient, toPaise } from '@/lib/payments/razorpay';

const schema = z.object({ amount: z.number().min(100).max(50000) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter an amount between ₹100 and ₹50,000.' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: toPaise(parsed.data.amount),
      currency: 'INR',
      receipt: `wallet-${user.id.slice(0, 8)}-${Date.now()}`,
      notes: { profile_id: user.id, purpose: 'wallet_topup' },
    });

    await supabase.from('transactions').insert({
      profile_id: user.id,
      type: 'wallet_topup',
      amount: parsed.data.amount,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Wallet top-up order creation failed:', err);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 });
  }
}
