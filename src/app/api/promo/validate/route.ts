import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePromoSchema } from '@/lib/booking/schemas';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`promo:${getClientIp(request)}`, { limit: 20, windowMs: 5 * 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ valid: false, reason: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = validatePromoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { code, bookingAmount } = parsed.data;
  const supabase = await createClient();

  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .ilike('code', code)
    .single();

  if (error || !promo) {
    return NextResponse.json({ valid: false, reason: 'Promo code not found.' }, { status: 200 });
  }

  if (!promo.is_active) {
    return NextResponse.json({ valid: false, reason: 'This promo code is no longer active.' });
  }

  if (promo.expiry_date && new Date(promo.expiry_date) < new Date()) {
    return NextResponse.json({ valid: false, reason: 'This promo code has expired.' });
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return NextResponse.json({ valid: false, reason: 'This promo code has reached its usage limit.' });
  }

  if (bookingAmount < (promo.min_booking_amount ?? 0)) {
    return NextResponse.json({
      valid: false,
      reason: `A minimum booking amount of ₹${promo.min_booking_amount} is required for this code.`,
    });
  }

  return NextResponse.json({
    valid: true,
    discountType: promo.discount_type,
    discountValue: promo.discount_value,
  });
}
