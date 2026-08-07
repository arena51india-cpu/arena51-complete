'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Users,
  CalendarDays,
  Clock,
  Gamepad2,
  UserCircle,
  CreditCard,
  PartyPopper,
  Info,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GlowCard } from '@/components/shared/glow-card';
import { StepProgress } from './step-progress';
import { cn, formatCurrencyINR } from '@/lib/utils';
import { SUPPORTED_DURATIONS_MINUTES, MIN_ADVANCE_AMOUNT } from '@/lib/pricing/calculator';
import type { PricingPlan, Game } from '@/lib/types/database.types';

const STEPS = ['Setup', 'Date', 'Duration', 'Time', 'Game', 'Details', 'Review'];

const DURATION_LABELS: Record<number, string> = {
  30: '30 min',
  60: '1 hour',
  90: '1.5 hours',
  120: '2 hours',
  180: '3 hours',
  240: '4 hours',
};

interface PricingBreakdown {
  baseAmount: number;
  surchargeAmount: number;
  surchargeLabel: string | null;
  membershipDiscountAmount: number;
  promoDiscountAmount: number;
  discountAmount: number;
  totalAmount: number;
  appliedRules: string[];
}

interface SlotAvailability {
  time: string;
  available: boolean;
  freeStations: number;
  totalEligibleStations: number;
}

export function BookingWizard({ plans, games }: { plans: PricingPlan[]; games: Game[] }) {
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [pricing, setPricing] = React.useState<PricingBreakdown | null>(null);
  const [pricingLoading, setPricingLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    reference: string;
    stationName: string;
    note: string;
    secured: boolean;
    disclaimer: string | null;
    bookingId: string;
  } | null>(null);

  const [planId, setPlanId] = React.useState<string | null>(null);
  const [bookingDate, setBookingDate] = React.useState('');
  const [durationMinutes, setDurationMinutes] = React.useState<number | null>(null);
  const [startTime, setStartTime] = React.useState('');
  const [preferredGameId, setPreferredGameId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState('');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [promoCode, setPromoCode] = React.useState('');

  const [slots, setSlots] = React.useState<SlotAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = React.useState(false);

  const [payNow, setPayNow] = React.useState(true);
  const [payAmount, setPayAmount] = React.useState<number>(MIN_ADVANCE_AMOUNT);

  const selectedPlan = plans.find((p) => p.id === planId) ?? null;
  const todayStr = new Date().toISOString().slice(0, 10);

  React.useEffect(() => {
    if (!planId || !durationMinutes || !bookingDate) {
      setPricing(null);
      return;
    }

    const controller = new AbortController();
    setPricingLoading(true);

    fetch('/api/pricing/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pricingPlanId: planId,
        durationMinutes,
        bookingDate,
        promoCode: promoCode || null,
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPricing(null);
        } else {
          setPricing(data);
        }
      })
      .catch(() => {})
      .finally(() => setPricingLoading(false));

    return () => controller.abort();
  }, [planId, durationMinutes, bookingDate, promoCode]);

  // Fetch live slot availability once we know date + duration + party size —
  // duration has to be picked before time so we can check the full window.
  React.useEffect(() => {
    if (!bookingDate || !durationMinutes || !selectedPlan) {
      setSlots([]);
      return;
    }

    const controller = new AbortController();
    setSlotsLoading(true);
    setStartTime('');

    fetch(
      `/api/availability?bookingDate=${bookingDate}&durationMinutes=${durationMinutes}&players=${selectedPlan.players}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => {})
      .finally(() => setSlotsLoading(false));

    return () => controller.abort();
  }, [bookingDate, durationMinutes, selectedPlan]);

  // Keep the pay-now amount sane whenever the total changes.
  React.useEffect(() => {
    if (pricing && payAmount > pricing.totalAmount) {
      setPayAmount(Math.max(MIN_ADVANCE_AMOUNT, Math.round(pricing.totalAmount)));
    }
  }, [pricing]); // eslint-disable-line react-hooks/exhaustive-deps

  const canProceed = (() => {
    switch (step) {
      case 0: return !!planId;
      case 1: return !!bookingDate;
      case 2: return !!durationMinutes;
      case 3: return !!startTime;
      case 4: return true; // optional
      case 5: return customerName.trim().length > 1 && /^[0-9+\-\s]{7,15}$/.test(customerPhone);
      default: return true;
    }
  })();

  async function handleSubmit() {
    if (!planId || !bookingDate || !startTime || !durationMinutes) return;
    if (payNow && (payAmount < MIN_ADVANCE_AMOUNT || (pricing && payAmount > pricing.totalAmount))) {
      toast.error(`Enter an amount between ₹${MIN_ADVANCE_AMOUNT} and the total.`);
      return;
    }

    setSubmitting(true);

    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: selectedPlan?.players ?? 1,
          bookingDate,
          startTime,
          durationMinutes,
          pricingPlanId: planId,
          preferredGameId: preferredGameId || undefined,
          promoCode: promoCode || undefined,
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          source: 'online',
          notes: notes || undefined,
          advanceAmount: payNow ? payAmount : 0,
        }),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        toast.error(bookingData.error || 'Could not create your booking.');
        setSubmitting(false);
        return;
      }

      const { booking, assignedStation, stationAssignmentNote, requiresPayment, unpaidDisclaimer } = bookingData;

      if (!requiresPayment) {
        setResult({
          reference: booking.booking_reference,
          stationName: assignedStation?.station_name ?? 'Assigned station',
          note: stationAssignmentNote,
          secured: false,
          disclaimer: unpaidDisclaimer,
          bookingId: booking.id,
        });
        setSubmitting(false);
        return;
      }

      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Could not start payment. Please try again.');
        setSubmitting(false);
        return;
      }

      if (typeof window === 'undefined' || !window.Razorpay) {
        toast.error('Payment is still loading — please try again in a moment.');
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Arena 51 Gaming Lounge',
        description: `Booking ${booking.booking_reference} — advance payment`,
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        theme: { color: '#dcae32' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            toast.error(verifyData.error || 'Payment verification failed. Contact support with your booking reference.');
            setSubmitting(false);
            return;
          }

          setResult({
            reference: booking.booking_reference,
            stationName: assignedStation?.station_name ?? 'Assigned station',
            note: stationAssignmentNote,
            secured: true,
            disclaimer: null,
            bookingId: booking.id,
          });
          setSubmitting(false);
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card className="mx-auto max-w-lg p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
          {result.secured ? (
            <PartyPopper className="h-7 w-7 text-gold-400" />
          ) : (
            <ShieldAlert className="h-7 w-7 text-gold-400" />
          )}
        </div>
        <h2 className="font-display text-2xl font-bold text-gradient-gold">
          {result.secured ? 'Booking Confirmed' : 'Booking Requested'}
        </h2>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{result.reference}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          You're assigned to <span className="text-foreground font-medium">{result.stationName}</span>.
        </p>

        {result.disclaimer && (
          <div className="mt-6 flex gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-left text-xs text-gold-300">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {result.disclaimer}
          </div>
        )}

        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left text-xs text-muted-foreground">
          <Info className="mb-2 h-4 w-4 text-neon-400" />
          {result.note}
        </div>

        <Button asChild variant="gold" className="mt-8 w-full">
          <a href={`/dashboard/bookings/${result.bookingId}`}>
            {result.secured ? 'View Booking' : 'Secure This Booking'}
          </a>
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <StepProgress steps={STEPS} currentStep={step} />

      <Card className="p-6 sm:p-8">
        {step === 0 && (
          <StepBlock icon={Users} title="Choose your setup">
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setPlanId(plan.id)}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    planId === plan.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  )}
                >
                  <p className="font-display font-semibold">{plan.plan_name}</p>
                  <p className="mt-1 font-mono text-sm text-gold-300">
                    {formatCurrencyINR(plan.base_price_per_hour)}/hr
                  </p>
                </button>
              ))}
            </div>
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock icon={CalendarDays} title="Pick a date">
            <Input
              type="date"
              min={todayStr}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="max-w-xs"
            />
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock icon={Clock} title="How long?">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {SUPPORTED_DURATIONS_MINUTES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDurationMinutes(d)}
                  className={cn(
                    'rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                    durationMinutes === d
                      ? 'border-primary/50 bg-primary/15 text-gold-300'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  )}
                >
                  {DURATION_LABELS[d]}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Picking your duration first lets us show you exactly which start times are free.
            </p>
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock icon={Clock} title="Pick a start time">
            {slotsLoading ? (
              <p className="text-sm text-muted-foreground">Checking live availability…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots to show yet.</p>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/60" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" /> Fully booked
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setStartTime(slot.time)}
                      title={
                        slot.available
                          ? `${slot.freeStations} of ${slot.totalEligibleStations} stations free`
                          : 'Fully booked'
                      }
                      className={cn(
                        'relative rounded-lg border px-2 py-2 font-mono text-xs transition-colors',
                        !slot.available && 'cursor-not-allowed border-white/5 bg-white/[0.02] text-muted-foreground/40 line-through',
                        slot.available && startTime === slot.time && 'border-primary/50 bg-primary/15 text-gold-300',
                        slot.available && startTime !== slot.time && 'border-white/10 bg-white/[0.02] hover:border-white/25'
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock icon={Gamepad2} title="Preferred game (optional)">
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-secondary/20 bg-secondary/5 p-3 text-xs text-neon-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Your selected game is only a preference. You may choose any available game when
              you arrive at Arena 51, subject to availability.
            </div>
            <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              <button
                onClick={() => setPreferredGameId(null)}
                className={cn(
                  'rounded-lg border p-3 text-left text-sm transition-colors',
                  preferredGameId === null
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                )}
              >
                No preference
              </button>
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setPreferredGameId(game.id)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors',
                    preferredGameId === game.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  )}
                >
                  {game.title}
                  <Badge variant={game.category === 'multiplayer' ? 'neon' : 'outline'}>
                    {game.category === 'multiplayer' ? 'MP' : 'SP'}
                  </Badge>
                </button>
              ))}
            </div>
          </StepBlock>
        )}

        {step === 5 && (
          <StepBlock icon={UserCircle} title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customerName">Full name</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email (optional)</Label>
                <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="promoCode">Promo code (optional)</Label>
                <Input id="promoCode" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Notes for reception (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </StepBlock>
        )}

        {step === 6 && (
          <StepBlock icon={CreditCard} title="Review & confirm">
            <div className="space-y-2 text-sm">
              <Row label="Setup" value={selectedPlan?.plan_name ?? '-'} />
              <Row label="Date" value={bookingDate} />
              <Row label="Duration" value={durationMinutes ? DURATION_LABELS[durationMinutes] : '-'} />
              <Row label="Time" value={startTime} />
              <Row
                label="Preferred game"
                value={games.find((g) => g.id === preferredGameId)?.title ?? 'No preference'}
              />
            </div>

            <div className="scanline-divider my-5" />

            {pricingLoading && <p className="text-sm text-muted-foreground">Calculating price…</p>}

            {pricing && (
              <div className="space-y-2 font-mono text-sm">
                <Row label="Base amount" value={formatCurrencyINR(pricing.baseAmount)} />
                {pricing.surchargeAmount > 0 && (
                  <Row label={pricing.surchargeLabel ?? 'Surcharge'} value={`+ ${formatCurrencyINR(pricing.surchargeAmount)}`} />
                )}
                {pricing.discountAmount > 0 && (
                  <Row label="Discounts" value={`- ${formatCurrencyINR(pricing.discountAmount)}`} className="text-neon-400" />
                )}
                <div className="scanline-divider my-2" />
                <Row label="Total" value={formatCurrencyINR(pricing.totalAmount)} className="text-base font-bold text-gold-300" />
              </div>
            )}

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold">Pay now to lock your slot</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Any amount, minimum ₹{MIN_ADVANCE_AMOUNT} — the rest is due at the lounge.
                  </p>
                </div>
                <Switch checked={payNow} onCheckedChange={setPayNow} />
              </div>

              {payNow ? (
                <div className="mt-4">
                  <Label htmlFor="payAmount">Amount to pay now</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    min={MIN_ADVANCE_AMOUNT}
                    max={pricing?.totalAmount ?? undefined}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="max-w-[160px] font-mono"
                  />
                  {pricing && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-neon-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Balance due at lounge: {formatCurrencyINR(Math.max(0, pricing.totalAmount - payAmount))}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-gold-300">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  Without paying anything now, this slot isn't locked — another customer who
                  pays can still book the same time. You can secure it any time before your
                  session from your dashboard.
                </div>
              )}
            </div>

            <GlowCard className="mt-6 rounded-lg">
              <Button
                variant="gold"
                size="lg"
                className="w-full rounded-lg"
                disabled={!pricing || submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? 'Processing…'
                  : payNow
                    ? `Pay ${formatCurrencyINR(payAmount)} & Confirm`
                    : 'Reserve Without Paying'}
              </Button>
            </GlowCard>
          </StepBlock>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < 6 && (
            <Button variant="gold" onClick={() => setStep((s) => Math.min(6, s + 1))} disabled={!canProceed}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function StepBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Icon className="h-5 w-5 text-gold-400" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={className}>{value}</span>
    </div>
  );
}
