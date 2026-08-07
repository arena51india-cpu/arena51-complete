import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireStaff } from '@/lib/auth/require-staff';

const schema = z.object({
  sessionId: z.string().uuid(),
  additionalMinutes: z.number().int().positive().multipleOf(30).max(240),
});

export async function POST(request: NextRequest) {
  const auth = await requireStaff();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sessionId, additionalMinutes } = parsed.data;

  const { data: existing, error: fetchError } = await auth.supabase
    .from('sessions')
    .select('*, bookings(*, pricing_plans(*))')
    .eq('id', sessionId)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const newScheduledEnd = new Date(new Date(existing.scheduled_end).getTime() + additionalMinutes * 60_000);

  const { data, error } = await auth.supabase
    .from('sessions')
    .update({
      scheduled_end: newScheduledEnd.toISOString(),
      extended_minutes: existing.extended_minutes + additionalMinutes,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Could not extend the session.' }, { status: 500 });

  const plan = (existing.bookings as any)?.pricing_plans;
  const extraCharge = plan ? (plan.extra_30_min_price * additionalMinutes) / 30 : null;

  if (existing.booking_id) {
    await auth.supabase
      .from('bookings')
      .update({ duration_minutes: (existing.bookings as any).duration_minutes + additionalMinutes })
      .eq('id', existing.booking_id);
  }

  return NextResponse.json({
    session: data,
    extraChargeDue: extraCharge,
    note: extraCharge
      ? `Collect an additional ₹${extraCharge} from the customer for the extension.`
      : 'Extension applied — no pricing plan linked to compute an extra charge.',
  });
}
