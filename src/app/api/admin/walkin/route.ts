import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/require-staff';
import { calculatePrice, SUPPORTED_DURATIONS_MINUTES } from '@/lib/pricing/calculator';
import { assignBestStation, type ExistingBookingWindow } from '@/lib/booking/stationAssignment';
import type { PricingRule } from '@/lib/types/database.types';

const schema = z.object({
  players: z.number().int().min(1).max(4),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  durationMinutes: z.union(SUPPORTED_DURATIONS_MINUTES.map((d) => z.literal(d)) as any),
  pricingPlanId: z.string().uuid(),
  preferredGameId: z.string().uuid().optional().nullable(),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(7).max(15),
  markPaid: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const auth = await requireStaff();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const input = parsed.data;
  const supabase = auth.supabase;

  const { data: plan, error: planError } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('id', input.pricingPlanId)
    .single();

  if (planError || !plan) return NextResponse.json({ error: 'Pricing plan not found.' }, { status: 404 });

  const { data: rules } = await supabase.from('pricing_rules').select('*').eq('is_active', true);

  const pricing = calculatePrice({
    plan,
    durationMinutes: input.durationMinutes,
    bookingDate: new Date(input.bookingDate),
    activeRules: (rules ?? []) as PricingRule[],
    promoCode: null,
    membership: null,
  });

  // Walk-ins are staff-confirmed in person: either paid in full at the
  // counter, or left unpaid (customer pays before/at their session).
  const advanceAmount = input.markPaid ? pricing.totalAmount : 0;
  const balanceAmount = input.markPaid ? 0 : pricing.totalAmount;

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
    return NextResponse.json({ error: assignment.reason || 'No station available for this slot.' }, { status: 409 });
  }

  const { data: refData } = await supabase.rpc('generate_booking_reference');

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      booking_reference: refData as string,
      profile_id: null,
      source: 'walk_in',
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
      total_amount: pricing.totalAmount,
      advance_amount: advanceAmount,
      balance_amount: input.markPaid ? 0 : balanceAmount,
      status: 'confirmed',
      payment_status: input.markPaid ? 'paid' : 'pending',
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      created_by: auth.profile.id,
    })
    .select()
    .single();

  if (insertError || !booking) {
    return NextResponse.json({ error: insertError?.message ?? 'Failed to create walk-in booking.' }, { status: 500 });
  }

  await supabase.from('sessions').insert({
    booking_id: booking.id,
    station_id: assignment.stationId,
    status: 'not_started',
    scheduled_start: requestedStart.toISOString(),
    scheduled_end: requestedEnd.toISOString(),
  });

  if (input.markPaid) {
    await supabase.from('transactions').insert({
      booking_id: booking.id,
      type: 'booking_payment',
      amount: pricing.totalAmount,
      status: 'paid',
      notes: 'Walk-in — paid in full at counter',
    });
  }

  await supabase.from('audit_logs').insert({
    actor_id: auth.profile.id,
    action: 'booking.walk_in_create',
    entity_type: 'booking',
    entity_id: booking.id,
    metadata: { customer_name: input.customerName, total_amount: pricing.totalAmount },
  });

  return NextResponse.json({ booking, assignedStation: assignment.station, pricing });
}
