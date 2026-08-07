import { z } from 'zod';
import { SUPPORTED_DURATIONS_MINUTES } from '@/lib/pricing/calculator';

export const createBookingSchema = z.object({
  players: z.number().int().min(1).max(4),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'bookingDate must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'startTime must be HH:MM'),
  durationMinutes: z.union(SUPPORTED_DURATIONS_MINUTES.map((d) => z.literal(d)) as any),
  pricingPlanId: z.string().uuid(),
  preferredGameId: z.string().uuid().optional().nullable(),
  promoCode: z.string().trim().min(1).max(32).optional().nullable(),

  customerName: z.string().trim().min(2).max(120),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number'),
  customerEmail: z.string().trim().email().optional().nullable(),
  advanceAmount: z.number().min(0),

  source: z.enum(['online', 'walk_in', 'admin']).default('online'),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const calculatePricingSchema = z.object({
  pricingPlanId: z.string().uuid(),
  durationMinutes: z.union(SUPPORTED_DURATIONS_MINUTES.map((d) => z.literal(d)) as any),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  promoCode: z.string().trim().min(1).max(32).optional().nullable(),
});

export const validatePromoSchema = z.object({
  code: z.string().trim().min(1).max(32),
  bookingAmount: z.number().nonnegative(),
});

export const createRazorpayOrderSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().min(0).optional(),
});

export const verifyRazorpayPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
