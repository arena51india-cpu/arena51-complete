import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { sendWalletTopupConfirmation } from '@/lib/email/resend';

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const authed = await createClient();
  const {
    data: { user },
  } = await authed.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  let signatureValid = false;
  try {
    signatureValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Payment verification is not configured correctly.' }, { status: 500 });
  }

  const supabase = createAdminClient();

  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('razorpay_order_id', razorpay_order_id)
    .single();

  if (!transaction || transaction.profile_id !== user.id) {
    return NextResponse.json({ error: 'Transaction not found.' }, { status: 404 });
  }

  if (!signatureValid) {
    await supabase
      .from('transactions')
      .update({ status: 'failed', razorpay_payment_id, razorpay_signature })
      .eq('razorpay_order_id', razorpay_order_id);
    return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
  }

  await supabase
    .from('transactions')
    .update({ status: 'paid', razorpay_payment_id, razorpay_signature })
    .eq('razorpay_order_id', razorpay_order_id);

  await supabase.rpc('increment_wallet_balance', {
    p_profile_id: user.id,
    p_amount: transaction.amount,
  });

  try {
    const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
    if (profile?.email) {
      await sendWalletTopupConfirmation(profile.email, {
        customerName: profile.full_name,
        amount: transaction.amount,
      });
    }
  } catch (err) {
    console.error('Wallet top-up confirmation email failed:', err);
  }

  return NextResponse.json({ success: true, amount: transaction.amount });
}
