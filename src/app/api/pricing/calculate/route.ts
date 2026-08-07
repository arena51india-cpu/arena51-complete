import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculatePricingSchema } from '@/lib/booking/schemas';
import { calculatePrice } from '@/lib/pricing/calculator';
import type { Membership, PricingRule } from '@/lib/types/database.types';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = calculatePricingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { pricingPlanId, durationMinutes, bookingDate, promoCode } = parsed.data;
  const supabase = await createClient();

  const { data: plan, error: planError } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('id', pricingPlanId)
    .eq('is_active', true)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: 'Pricing plan not found or inactive.' }, { status: 404 });
  }

  const { data: rules } = await supabase.from('pricing_rules').select('*').eq('is_active', true);

  let promo = null;
  if (promoCode) {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .ilike('code', promoCode)
      .single();
    promo = data ?? null;
  }

  // Attach membership discount if the requester is authenticated and has one
  let membership: Membership | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_id')
      .eq('id', user.id)
      .single();

    if (profile?.membership_id) {
      const { data: membershipData } = await supabase
        .from('memberships')
        .select('*')
        .eq('id', profile.membership_id)
        .single();
      membership = membershipData ?? null;
    }
  }

  const breakdown = calculatePrice({
    plan,
    durationMinutes,
    bookingDate: new Date(bookingDate),
    activeRules: (rules ?? []) as PricingRule[],
    promoCode: promo,
    membership,
  });

  return NextResponse.json(breakdown);
}
