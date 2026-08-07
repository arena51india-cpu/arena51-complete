import type {
  PricingPlan,
  PricingRule,
  PromoCode,
  Membership,
  MembershipTier,
} from '@/lib/types/database.types';

export const SUPPORTED_DURATIONS_MINUTES = [30, 60, 90, 120, 180, 240] as const;
export type SupportedDurationMinutes = (typeof SUPPORTED_DURATIONS_MINUTES)[number];

export interface PricingInput {
  plan: PricingPlan;
  durationMinutes: SupportedDurationMinutes;
  bookingDate: Date; // used to evaluate weekend/festival rules
  activeRules: PricingRule[]; // pre-filtered to is_active = true
  promoCode?: PromoCode | null;
  membership?: Membership | null;
}

export interface PricingBreakdown {
  baseAmount: number;
  surchargeAmount: number;
  surchargeLabel: string | null;
  membershipDiscountAmount: number;
  promoDiscountAmount: number;
  discountAmount: number; // membership + promo combined
  totalAmount: number;
  appliedRules: string[];
}

/**
 * Computes the base amount for a duration from a plan's hourly rate plus
 * 30-minute increments, e.g.:
 *   60 min  -> 1x base_price_per_hour
 *   90 min  -> 1x base_price_per_hour + 1x extra_30_min_price
 *   120 min -> 2x base_price_per_hour
 *   180 min -> 3x base_price_per_hour
 *   240 min -> 4x base_price_per_hour
 *   30 min  -> 1x extra_30_min_price (half-hour only booking)
 */
export function computeBaseAmount(plan: PricingPlan, durationMinutes: number): number {
  if (durationMinutes === 30) {
    return plan.extra_30_min_price;
  }

  const fullHours = Math.floor(durationMinutes / 60);
  const remainderMinutes = durationMinutes % 60;

  let amount = fullHours * plan.base_price_per_hour;
  if (remainderMinutes === 30) {
    amount += plan.extra_30_min_price;
  }
  return amount;
}

/**
 * Determines whether a weekend/festival pricing rule applies to a given
 * booking date, based on day-of-week and/or a festival date window.
 */
export function ruleApplies(rule: PricingRule, bookingDate: Date): boolean {
  if (!rule.is_active) return false;

  if (rule.rule_type === 'festival') {
    if (!rule.starts_at || !rule.ends_at) return false;
    const start = new Date(rule.starts_at);
    const end = new Date(rule.ends_at);
    return bookingDate >= start && bookingDate <= end;
  }

  // weekend / other day-of-week based rules
  if (rule.applies_days_of_week && rule.applies_days_of_week.length > 0) {
    return rule.applies_days_of_week.includes(bookingDate.getDay());
  }

  return false;
}

/**
 * Picks the single highest-priority applicable surcharge rule.
 * Festival pricing takes precedence over weekend pricing when both apply
 * (e.g. a festival that falls on a weekend uses the festival rate only,
 * rules are not stacked multiplicatively to avoid runaway pricing).
 */
export function selectApplicableRule(
  rules: PricingRule[],
  bookingDate: Date
): PricingRule | null {
  const applicable = rules.filter((r) => ruleApplies(r, bookingDate));
  if (applicable.length === 0) return null;

  const festival = applicable.find((r) => r.rule_type === 'festival');
  if (festival) return festival;

  return applicable.reduce((best, r) => (r.multiplier > best.multiplier ? r : best), applicable[0]);
}

function computeMembershipDiscount(amount: number, membership?: Membership | null): number {
  if (!membership || !membership.is_active) return 0;
  return round2((amount * membership.discount_percent) / 100);
}

function computePromoDiscount(
  amountAfterMembershipDiscount: number,
  promoCode: PromoCode | undefined | null,
  membershipTier: MembershipTier | undefined
): { amount: number; valid: boolean; reason?: string } {
  if (!promoCode) return { amount: 0, valid: true };

  if (!promoCode.is_active) return { amount: 0, valid: false, reason: 'Promo code is not active.' };

  if (promoCode.expiry_date && new Date(promoCode.expiry_date) < new Date()) {
    return { amount: 0, valid: false, reason: 'Promo code has expired.' };
  }

  if (promoCode.max_uses !== null && promoCode.used_count >= promoCode.max_uses) {
    return { amount: 0, valid: false, reason: 'Promo code has reached its usage limit.' };
  }

  if (amountAfterMembershipDiscount < (promoCode.min_booking_amount ?? 0)) {
    return {
      amount: 0,
      valid: false,
      reason: `Minimum booking amount of ₹${promoCode.min_booking_amount} required for this promo code.`,
    };
  }

  if (
    promoCode.applicable_membership_tiers &&
    promoCode.applicable_membership_tiers.length > 0 &&
    (!membershipTier || !promoCode.applicable_membership_tiers.includes(membershipTier))
  ) {
    return { amount: 0, valid: false, reason: 'Promo code is not applicable to your membership tier.' };
  }

  const amount =
    promoCode.discount_type === 'percentage'
      ? round2((amountAfterMembershipDiscount * promoCode.discount_value) / 100)
      : round2(Math.min(promoCode.discount_value, amountAfterMembershipDiscount));

  return { amount, valid: true };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Full pricing computation: base amount -> surcharge -> membership discount
 * -> promo discount -> final total. Order matters and is documented inline.
 */
export function calculatePrice(input: PricingInput): PricingBreakdown {
  const { plan, durationMinutes, bookingDate, activeRules, promoCode, membership } = input;

  const baseAmount = computeBaseAmount(plan, durationMinutes);

  const rule = selectApplicableRule(activeRules, bookingDate);
  const surchargeAmount = rule ? round2(baseAmount * (rule.multiplier - 1)) : 0;

  const amountAfterSurcharge = baseAmount + surchargeAmount;

  const membershipDiscountAmount = computeMembershipDiscount(amountAfterSurcharge, membership);
  const amountAfterMembership = amountAfterSurcharge - membershipDiscountAmount;

  const promoResult = computePromoDiscount(amountAfterMembership, promoCode, membership?.tier);
  const promoDiscountAmount = promoResult.valid ? promoResult.amount : 0;

  const discountAmount = round2(membershipDiscountAmount + promoDiscountAmount);
  const totalAmount = round2(amountAfterSurcharge - discountAmount);

  const appliedRules: string[] = [];
  if (rule) appliedRules.push(rule.name);
  if (membershipDiscountAmount > 0 && membership) appliedRules.push(`${membership.display_name} discount`);
  if (promoDiscountAmount > 0 && promoCode) appliedRules.push(`Promo: ${promoCode.code}`);

  return {
    baseAmount: round2(baseAmount),
    surchargeAmount,
    surchargeLabel: rule?.name ?? null,
    membershipDiscountAmount,
    promoDiscountAmount,
    discountAmount,
    totalAmount: Math.max(totalAmount, 0),
    appliedRules,
  };
}

/**
 * Flexible advance payment: the customer chooses how much to pay now,
 * anywhere from ₹0 (pay nothing, reserve provisionally) up to the full
 * total. If they pay something, it must be at least MIN_ADVANCE_AMOUNT —
 * partial payments below that aren't worth the payment-gateway overhead.
 *
 * Bookings with an advance of ₹0 do NOT lock a station: the booking
 * engine only treats `confirmed`/`in_progress` bookings as occupying a
 * slot (see stationAssignment.ts and the `existingBookings` queries in
 * the booking API routes), and a booking only becomes `confirmed` once
 * some payment has been verified. So a ₹0 booking stays visible to the
 * customer in their dashboard, but the slot itself remains bookable by
 * anyone else until this customer pays something.
 */
export const MIN_ADVANCE_AMOUNT = 50;

export function isValidAdvanceAmount(amount: number, totalAmount: number): boolean {
  if (amount === 0) return true;
  return amount >= MIN_ADVANCE_AMOUNT && amount <= totalAmount;
}

export function computeBalance(totalAmount: number, advanceAmount: number): number {
  return Math.max(0, round2(totalAmount - advanceAmount));
}
