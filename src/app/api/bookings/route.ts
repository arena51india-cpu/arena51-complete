import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBookingSchema } from '@/lib/booking/schemas';
import { calculatePrice, isValidAdvanceAmount, computeBalance, MIN_ADVANCE_AMOUNT } from '@/lib/pricing/calculator';
import { assignBestStation, type ExistingBookingWindow } from '@/lib/booking/stationAssignment';
import type { Membership, PricingRule } from '@/lib/types/database.types';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(`booking:${getClientIp(request)}`, { limit: 10, windowMs: 5 * 60_000 });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many booking attempts. Please wait a few minutes and try again.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Staff-only sources
  if (input.source !== 'online') {
    const { data: profile } = user
      ? await supabase.from('profiles').select('role').eq('id', user.id).single()
      : { data: null };

    const isStaff = profile && ['owner', 'manager', 'reception'].includes(profile.role);
    if (!isStaff) {
      return NextResponse.json(
        { error: 'Only staff can create walk-in or admin bookings.' },
        { status: 403 }
      );
    }
  }

  // ---- 1. Load pricing plan --------------------------------------------
  const { data: plan, error: planError } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('id', input.pricingPlanId)
    .eq('is_active', true)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: 'Selected pricing plan is unavailable.' }, { status: 404 });
  }

  if (input.players > plan.players) {
    return NextResponse.json(
      { error: `This plan supports up to ${plan.players} player(s).` },
      { status: 400 }
    );
  }

  // ---- 2. Resolve promo code + membership -------------------------------
  let promo = null;
  if (input.promoCode) {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .ilike('code', input.promoCode)
      .single();
    promo = data ?? null;
  }

  let membership: Membership | null = null;
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

  const { data: rules } = await supabase.from('pricing_rules').select('*').eq('is_active', true);

  const pricing = calculatePrice({
    plan,
    durationMinutes: input.durationMinutes,
    bookingDate: new Date(input.bookingDate),
    activeRules: (rules ?? []) as PricingRule[],
    promoCode: promo,
    membership,
  });

  if (!isValidAdvanceAmount(input.advanceAmount, pricing.totalAmount)) {
    return NextResponse.json(
      { error: `Choose ₹0 to reserve without paying, or at least ₹${MIN_ADVANCE_AMOUNT}.` },
      { status: 400 }
    );
  }

  const advanceAmount = input.advanceAmount;
  const balanceAmount = computeBalance(pricing.totalAmount, advanceAmount);

  // ---- 3. Auto-assign the best available station ------------------------
  const requestedStart = new Date(`${input.bookingDate}T${input.startTime}`);
  const requestedEnd = new Date(requestedStart.getTime() + input.durationMinutes * 60_000);

  const { data: stations } = await supabase.from('gaming_stations').select('*').eq('is_active', true);

  const { data: dayBookings } = await supabase
    .from('bookings')
    .select('assigned_station_id, booking_date, start_time, duration_minutes, status')
    .eq('booking_date', input.bookingDate)
    .in('status', ['confirmed', 'in_progress']);

  const existingBookings: ExistingBookingWindow[] = (dayBookings ?? [])
    .filter((b) => b.assigned_station_id)
    .map((b) => {
      const start = new Date(`${b.booking_date}T${b.start_time}`);
      const end = new Date(start.getTime() + b.duration_minutes * 60_000);
      return { stationId: b.assigned_station_id as string, startsAt: start, endsAt: end };
    });

  let preferredGame = null;
  if (input.preferredGameId) {
    const { data } = await supabase.from('games').select('*').eq('id', input.preferredGameId).single();
    preferredGame = data ?? null;
  }

  const assignment = assignBestStation({
    stations: stations ?? [],
    existingBookings,
    players: input.players,
    requestedStart,
    requestedEnd,
    preferredGame,
  });

  if (!assignment.stationId) {
    return NextResponse.json(
      { error: assignment.reason || 'No gaming station is available for this slot.' },
      { status: 409 }
    );
  }

  // ---- 4. Generate a human-friendly booking reference --------------------
  const { data: refData, error: refError } = await supabase.rpc('generate_booking_reference');
  if (refError || !refData) {
    return NextResponse.json({ error: 'Could not generate a booking reference. Try again.' }, { status: 500 });
  }

  // ---- 5. Insert the booking ----------------------------------------------
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      booking_reference: refData as string,
      profile_id: user?.id ?? null,
      source: input.source,
      players: input.players,
      booking_date: input.bookingDate,
      start_time: input.startTime,
      duration_minutes: input.durationMinutes,
      preferred_game_id: input.preferredGameId ?? null,
      pricing_plan_id: plan.id,
      assigned_station_id: assignment.stationId,
      base_amount: pricing.baseAmount,
      surcharge_amount: pricing.surchargeAmount,
      discount_amount: pricing.discountAmount,
      promo_code_id: promo?.id ?? null,
      total_amount: pricing.totalAmount,
      advance_amount: advanceAmount,
      balance_amount: balanceAmount,
      status: 'pending_payment',
      payment_status: 'pending',
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail ?? null,
      notes: input.notes ?? null,
      created_by: input.source === 'online' ? null : user?.id ?? null,
    })
    .select()
    .single();

  if (insertError || !booking) {
    return NextResponse.json({ error: insertError?.message ?? 'Failed to create booking.' }, { status: 500 });
  }

  return NextResponse.json({
    booking,
    pricing,
    advanceAmount,
    balanceAmount,
    requiresPayment: advanceAmount > 0,
    assignedStation: assignment.station,
    stationAssignmentNote:
      'Preferred Game (Optional): Your selected game is only a preference. You may choose any available game when you arrive at Arena 51, subject to availability.',
    unpaidDisclaimer:
      advanceAmount === 0
        ? "This slot isn't locked yet — since you haven't paid anything, another customer who pays can still book this same time slot. Pay any amount (min ₹50) from your dashboard any time before your session to secure it."
        : null,
  });
}
