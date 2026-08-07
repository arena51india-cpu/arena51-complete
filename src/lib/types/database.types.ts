// Hand-authored to match supabase/schema.sql for Phase 1.
// Once the Supabase project is live, regenerate with:
//   npm run db:types
// and this file will be overwritten with the canonical generated types.

export type UserRole = 'owner' | 'manager' | 'reception' | 'customer';
export type StationDeviceType =
  | 'ps5'
  | 'gaming_pc'
  | 'vr'
  | 'racing_simulator'
  | 'xbox'
  | 'nintendo_switch'
  | 'other';
export type StationStatus = 'available' | 'occupied' | 'maintenance' | 'offline';
export type BookingSource = 'online' | 'walk_in' | 'admin';
export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';
export type SessionStatus = 'not_started' | 'active' | 'paused' | 'ended';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
export type DiscountType = 'percentage' | 'flat';
export type MembershipTier = 'silver' | 'gold' | 'platinum';
export type OfferType =
  | 'homepage_banner'
  | 'festival'
  | 'weekend'
  | 'flash_sale'
  | 'student'
  | 'combo';
export type PricingRuleType = 'base' | 'weekend' | 'festival';
export type TransactionType =
  | 'booking_payment'
  | 'refund'
  | 'wallet_topup'
  | 'wallet_debit'
  | 'membership_purchase'
  | 'loyalty_redeem';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  role: UserRole;
  avatar_url: string | null;
  visit_count: number;
  total_hours_played: number;
  total_money_spent: number;
  favourite_game_id: string | null;
  last_visit_at: string | null;
  loyalty_points: number;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  internal_notes: string | null;
  wallet_balance: number;
  membership_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GamingStation {
  id: string;
  station_name: string;
  station_number: number;
  device_type: StationDeviceType;
  status: StationStatus;
  controllers: number;
  max_players: number;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  category: 'multiplayer' | 'single_player';
  min_players: number;
  max_players: number;
  description: string | null;
  cover_image_url: string | null;
  banner_image_url: string | null;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  compatible_device_types: StationDeviceType[];
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  tier: MembershipTier;
  display_name: string;
  price: number;
  duration_days: number;
  discount_percent: number;
  free_hours: number;
  birthday_benefit_text: string | null;
  priority_booking: boolean;
  reward_multiplier: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  plan_name: string;
  slug: string;
  players: number;
  controllers: number;
  base_price_per_hour: number;
  extra_30_min_price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: string;
  rule_type: PricingRuleType;
  name: string;
  multiplier: number;
  applies_days_of_week: number[] | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  expiry_date: string | null;
  max_uses: number | null;
  used_count: number;
  min_booking_amount: number;
  applicable_membership_tiers: MembershipTier[] | null;
  auto_apply: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string | null;
  offer_type: OfferType;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  linked_promo_code_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  profile_id: string | null;
  source: BookingSource;
  players: number;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  preferred_game_id: string | null;
  pricing_plan_id: string | null;
  assigned_station_id: string | null;
  base_amount: number;
  surcharge_amount: number;
  discount_amount: number;
  promo_code_id: string | null;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  booking_id: string;
  station_id: string;
  status: SessionStatus;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  paused_at: string | null;
  total_paused_seconds: number;
  extended_minutes: number;
  moved_from_station_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  profile_id: string | null;
  booking_id: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
}

export interface CmsSetting {
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}

// Minimal Supabase `Database` shape sufficient for typed client calls.
// Extend as additional tables are consumed by the UI in later phases.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      gaming_stations: { Row: GamingStation; Insert: Partial<GamingStation>; Update: Partial<GamingStation> };
      games: { Row: Game; Insert: Partial<Game>; Update: Partial<Game> };
      memberships: { Row: Membership; Insert: Partial<Membership>; Update: Partial<Membership> };
      pricing_plans: { Row: PricingPlan; Insert: Partial<PricingPlan>; Update: Partial<PricingPlan> };
      pricing_rules: { Row: PricingRule; Insert: Partial<PricingRule>; Update: Partial<PricingRule> };
      promo_codes: { Row: PromoCode; Insert: Partial<PromoCode>; Update: Partial<PromoCode> };
      offers: { Row: Offer; Insert: Partial<Offer>; Update: Partial<Offer> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      sessions: { Row: SessionRow; Insert: Partial<SessionRow>; Update: Partial<SessionRow> };
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> };
      cms_settings: { Row: CmsSetting; Insert: Partial<CmsSetting>; Update: Partial<CmsSetting> };
    };
  };
}
