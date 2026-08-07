import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { sendMembershipConfirmation } from '@/lib/email/resend';

const schema = z.object({
  membershipId: z.string().uuid(),
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

  const { membershipId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

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

  if (!signatureValid) {
    await supabase
      .from('transactions')
      .update({ status: 'failed', razorpay_payment_id, razorpay_signature })
      .eq('razorpay_order_id', razorpay_order_id);
    return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
  }

  const { data: membership } = await supabase.from('memberships').select('*').eq('id', membershipId).single();
  if (!membership) {
    return NextResponse.json({ error: 'Membership plan not found.' }, { status: 404 });
  }

  await supabase
    .from('transactions')
    .update({ status: 'paid', razorpay_payment_id, razorpay_signature })
    .eq('razorpay_order_id', razorpay_order_id);

  // Deactivate any existing subscription, then create the new one.
  await supabase
    .from('membership_subscriptions')
    .update({ is_active: false })
    .eq('profile_id', user.id)
    .eq('is_active', true);

  const expiresAt = new Date(Date.now() + membership.duration_days * 24 * 60 * 60 * 1000);

  await supabase.from('membership_subscriptions').insert({
    profile_id: user.id,
    membership_id: membership.id,
    expires_at: expiresAt.toISOString(),
    amount_paid: membership.price,
    is_active: true,
  });

  await supabase.from('profiles').update({ membership_id: membership.id }).eq('id', user.id);

  try {
    const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
    if (profile?.email) {
      await sendMembershipConfirmation(profile.email, {
        customerName: profile.full_name,
        membershipName: membership.display_name,
        price: membership.price,
        expiresAt: expiresAt.toLocaleDateString('en-IN'),
      });
    }
  } catch (err) {
    console.error('Membership confirmation email failed:', err);
  }

  return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
}
