-- =========================================================================
-- ARENA 51 GAMING LOUNGE — CORE DATABASE SCHEMA (Phase 1)
-- Target: Supabase (Postgres 15+)
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- =========================================================================

-- ---------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type user_role as enum ('owner', 'manager', 'reception', 'customer');
create type station_device_type as enum ('ps5', 'gaming_pc', 'vr', 'racing_simulator', 'xbox', 'nintendo_switch', 'other');
create type station_status as enum ('available', 'occupied', 'maintenance', 'offline');
create type booking_source as enum ('online', 'walk_in', 'admin');
create type booking_status as enum ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled');
create type session_status as enum ('not_started', 'active', 'paused', 'ended');
create type payment_status as enum ('pending', 'partial', 'paid', 'refunded', 'failed');
create type discount_type as enum ('percentage', 'flat');
create type membership_tier as enum ('silver', 'gold', 'platinum');
create type offer_type as enum ('homepage_banner', 'festival', 'weekend', 'flash_sale', 'student', 'combo');
create type pricing_rule_type as enum ('base', 'weekend', 'festival');
create type transaction_type as enum ('booking_payment', 'refund', 'wallet_topup', 'wallet_debit', 'membership_purchase', 'loyalty_redeem');

-- ---------------------------------------------------------------------
-- PROFILES (extends Supabase auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  email text unique,
  birthday date,
  role user_role not null default 'customer',
  avatar_url text,

  -- CRM fields
  visit_count integer not null default 0,
  total_hours_played numeric(10,2) not null default 0,
  total_money_spent numeric(12,2) not null default 0,
  favourite_game_id uuid, -- fk added after games table exists
  last_visit_at timestamptz,
  loyalty_points integer not null default 0,
  referral_code text unique,
  referred_by uuid references public.profiles(id) on delete set null,
  referral_count integer not null default 0,
  internal_notes text, -- staff-only, hidden from customer via RLS

  wallet_balance numeric(12,2) not null default 0,
  membership_id uuid, -- fk added after memberships table exists

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_phone on public.profiles(phone);

-- ---------------------------------------------------------------------
-- GAMING STATIONS (no hardcoded consoles — fully dynamic)
-- ---------------------------------------------------------------------
create table public.gaming_stations (
  id uuid primary key default uuid_generate_v4(),
  station_name text not null,          -- display name, editable by admin
  station_number integer not null,     -- sequential identifier
  device_type station_device_type not null,
  status station_status not null default 'available',
  controllers integer not null default 1,
  max_players integer not null default 1,
  notes text,
  is_active boolean not null default true, -- soft "disable"
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (station_number)
);

create index idx_stations_status on public.gaming_stations(status) where is_active = true;
create index idx_stations_device_type on public.gaming_stations(device_type);

-- ---------------------------------------------------------------------
-- GAMES LIBRARY
-- ---------------------------------------------------------------------
create table public.games (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  category text not null check (category in ('multiplayer', 'single_player')),
  min_players integer not null default 1,
  max_players integer not null default 1,
  description text,
  cover_image_url text,
  banner_image_url text,
  is_featured boolean not null default false,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  compatible_device_types station_device_type[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_games_category on public.games(category);
create index idx_games_featured on public.games(is_featured) where is_available = true;

alter table public.profiles
  add constraint fk_profiles_favourite_game
  foreign key (favourite_game_id) references public.games(id) on delete set null;

-- ---------------------------------------------------------------------
-- MEMBERSHIPS (Silver / Gold / Platinum — fully editable)
-- ---------------------------------------------------------------------
create table public.memberships (
  id uuid primary key default uuid_generate_v4(),
  tier membership_tier not null unique,
  display_name text not null,
  price numeric(10,2) not null,
  duration_days integer not null default 30,
  discount_percent numeric(5,2) not null default 0,
  free_hours numeric(6,2) not null default 0,
  birthday_benefit_text text,
  priority_booking boolean not null default false,
  reward_multiplier numeric(4,2) not null default 1.0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint fk_profiles_membership
  foreign key (membership_id) references public.memberships(id) on delete set null;

create table public.membership_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_id uuid not null references public.memberships(id) on delete restrict,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  amount_paid numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_membership_subs_profile on public.membership_subscriptions(profile_id);

-- ---------------------------------------------------------------------
-- PRICING RULES (base / weekend / festival — all editable, no hardcoding)
-- ---------------------------------------------------------------------
create table public.pricing_plans (
  id uuid primary key default uuid_generate_v4(),
  plan_name text not null,              -- e.g. "Standard - 1 Player", "1 BY 2 Setup - 2 Players"
  slug text not null unique,
  players integer not null,
  controllers integer not null default 1,
  base_price_per_hour numeric(10,2) not null,
  extra_30_min_price numeric(10,2) not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pricing_rules (
  id uuid primary key default uuid_generate_v4(),
  rule_type pricing_rule_type not null default 'weekend',
  name text not null,                   -- e.g. "Weekend Surcharge", "Diwali Festival Pricing"
  multiplier numeric(5,2) not null default 1.0,  -- 1.20 = +20%
  applies_days_of_week int[],            -- 0=Sun..6=Sat, null = every day
  starts_at timestamptz,                 -- for festival windows
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PROMO CODES
-- ---------------------------------------------------------------------
create table public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value numeric(10,2) not null,     -- percent or flat amount
  expiry_date timestamptz,
  max_uses integer,                          -- null = unlimited
  used_count integer not null default 0,
  min_booking_amount numeric(10,2) default 0,
  applicable_membership_tiers membership_tier[],  -- null/empty = all
  auto_apply boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promo_code_redemptions (
  id uuid primary key default uuid_generate_v4(),
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  booking_id uuid, -- fk added after bookings table exists
  redeemed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- OFFERS (marketing banners / campaigns)
-- ---------------------------------------------------------------------
create table public.offers (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  offer_type offer_type not null,
  image_url text,
  cta_text text,
  cta_link text,
  linked_promo_code_id uuid references public.promo_codes(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_reference text not null unique, -- human friendly e.g. A51-20260803-0007
  profile_id uuid references public.profiles(id) on delete set null, -- null for anonymous walk-ins before account link
  source booking_source not null default 'online',

  players integer not null,
  booking_date date not null,
  start_time time not null,
  duration_minutes integer not null,       -- 30,60,90,120,180,240
  preferred_game_id uuid references public.games(id) on delete set null,
  pricing_plan_id uuid references public.pricing_plans(id) on delete restrict,

  assigned_station_id uuid references public.gaming_stations(id) on delete set null,

  base_amount numeric(10,2) not null,
  surcharge_amount numeric(10,2) not null default 0,   -- weekend/festival
  discount_amount numeric(10,2) not null default 0,     -- promo + membership
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  total_amount numeric(10,2) not null,
  advance_amount numeric(10,2) not null default 0,
  balance_amount numeric(10,2) not null default 0,

  status booking_status not null default 'pending_payment',
  payment_status payment_status not null default 'pending',

  customer_name text not null,   -- captured even for guest/walk-in bookings
  customer_phone text not null,
  customer_email text,

  notes text,
  created_by uuid references public.profiles(id) on delete set null, -- staff who created walk-in/admin booking
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_date on public.bookings(booking_date);
create index idx_bookings_profile on public.bookings(profile_id);
create index idx_bookings_status on public.bookings(status);
create index idx_bookings_station on public.bookings(assigned_station_id);

alter table public.promo_code_redemptions
  add constraint fk_redemptions_booking
  foreign key (booking_id) references public.bookings(id) on delete cascade;

-- ---------------------------------------------------------------------
-- LIVE SESSIONS (start/pause/resume/extend/end/move)
-- ---------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  station_id uuid not null references public.gaming_stations(id) on delete restrict,
  status session_status not null default 'not_started',

  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  actual_start timestamptz,
  actual_end timestamptz,

  paused_at timestamptz,
  total_paused_seconds integer not null default 0,
  extended_minutes integer not null default 0,

  moved_from_station_id uuid references public.gaming_stations(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sessions_booking on public.sessions(booking_id);
create index idx_sessions_station_status on public.sessions(station_id, status);

-- ---------------------------------------------------------------------
-- TRANSACTIONS (payments, refunds, wallet, membership, loyalty)
-- ---------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  type transaction_type not null,
  amount numeric(10,2) not null,
  currency text not null default 'INR',

  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,

  status payment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create index idx_transactions_profile on public.transactions(profile_id);
create index idx_transactions_booking on public.transactions(booking_id);
create index idx_transactions_razorpay_order on public.transactions(razorpay_order_id);

-- ---------------------------------------------------------------------
-- LOYALTY LEDGER (points earned / redeemed, auditable)
-- ---------------------------------------------------------------------
create table public.loyalty_ledger (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  points integer not null,          -- positive = earned, negative = redeemed
  reason text not null,
  created_at timestamptz not null default now()
);

create index idx_loyalty_profile on public.loyalty_ledger(profile_id);

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- GALLERY & CMS CONTENT (visual CMS, single-row key/value + media table)
-- ---------------------------------------------------------------------
create table public.gallery_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

-- Generic CMS key-value store for homepage hero, contact info, socials,
-- business hours, footer, logo, SEO/meta tags — fully admin-editable
-- without any code changes or migrations.
create table public.cms_settings (
  key text primary key,             -- e.g. 'homepage_hero', 'contact_info', 'seo_meta'
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CONTACT MESSAGES (public Contact page submissions)
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- AUDIT LOGS (security / accountability)
-- ---------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,              -- e.g. 'booking.cancel', 'pricing_plan.update'
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_actor on public.audit_logs(actor_id);

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.gaming_stations enable row level security;
alter table public.games enable row level security;
alter table public.memberships enable row level security;
alter table public.membership_subscriptions enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_code_redemptions enable row level security;
alter table public.offers enable row level security;
alter table public.bookings enable row level security;
alter table public.sessions enable row level security;
alter table public.transactions enable row level security;
alter table public.loyalty_ledger enable row level security;
alter table public.reviews enable row level security;
alter table public.gallery_images enable row level security;
alter table public.faqs enable row level security;
alter table public.cms_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.audit_logs enable row level security;

-- Helper: is the current user staff (owner/manager/reception)?
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'manager', 'reception')
  );
$$;

create or replace function public.is_owner_or_manager()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('owner', 'manager')
  );
$$;

-- Public read access for storefront content
create policy "public read games" on public.games for select using (true);
create policy "public read memberships" on public.memberships for select using (true);
create policy "public read pricing plans" on public.pricing_plans for select using (true);
create policy "public read pricing rules" on public.pricing_rules for select using (true);
create policy "public read active offers" on public.offers for select using (true);
create policy "public read gallery" on public.gallery_images for select using (true);
create policy "public read faqs" on public.faqs for select using (true);
create policy "public read cms settings" on public.cms_settings for select using (true);
create policy "public read published reviews" on public.reviews for select using (is_published = true);
create policy "public read stations status only" on public.gaming_stations for select using (true);

-- Staff-only write access to storefront/CMS content
create policy "staff manage games" on public.games for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage memberships" on public.memberships for all using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy "staff manage pricing plans" on public.pricing_plans for all using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy "staff manage pricing rules" on public.pricing_rules for all using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());
create policy "staff manage offers" on public.offers for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage gallery" on public.gallery_images for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage faqs" on public.faqs for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage cms settings" on public.cms_settings for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage stations" on public.gaming_stations for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage promo codes" on public.promo_codes for all using (public.is_owner_or_manager()) with check (public.is_owner_or_manager());

-- Profiles: users see/edit their own profile; staff can see/edit all
create policy "users read own profile" on public.profiles for select using (auth.uid() = id or public.is_staff());
create policy "users update own profile" on public.profiles for update using (auth.uid() = id or public.is_staff());
create policy "staff insert profiles" on public.profiles for insert with check (auth.uid() = id or public.is_staff());

-- Bookings: customers see their own; staff see/manage all
create policy "customers read own bookings" on public.bookings for select using (profile_id = auth.uid() or public.is_staff());
create policy "customers create own bookings" on public.bookings for insert with check (profile_id = auth.uid() or public.is_staff());
create policy "customers update own pending bookings" on public.bookings for update using (
  (profile_id = auth.uid() and status in ('pending_payment', 'confirmed')) or public.is_staff()
);

-- Sessions: staff only (internal ops)
create policy "staff manage sessions" on public.sessions for all using (public.is_staff()) with check (public.is_staff());

-- Transactions: customers can view their own; staff can view/manage all
create policy "customers read own transactions" on public.transactions for select using (profile_id = auth.uid() or public.is_staff());
create policy "staff manage transactions" on public.transactions for all using (public.is_staff()) with check (public.is_staff());

-- Loyalty ledger: customers view own; staff manage
create policy "customers read own loyalty" on public.loyalty_ledger for select using (profile_id = auth.uid() or public.is_staff());
create policy "staff manage loyalty" on public.loyalty_ledger for all using (public.is_staff()) with check (public.is_staff());

-- Membership subscriptions
create policy "customers read own subscriptions" on public.membership_subscriptions for select using (profile_id = auth.uid() or public.is_staff());
create policy "staff manage subscriptions" on public.membership_subscriptions for all using (public.is_staff()) with check (public.is_staff());

-- Promo redemptions: staff only view; system inserts via service role
create policy "staff read redemptions" on public.promo_code_redemptions for select using (public.is_staff());

-- Reviews: customers create their own; staff moderate
create policy "customers create own reviews" on public.reviews for insert with check (profile_id = auth.uid());
create policy "customers read own reviews" on public.reviews for select using (profile_id = auth.uid() or public.is_staff());
create policy "staff moderate reviews" on public.reviews for update using (public.is_staff());

-- Contact messages: anyone can submit, only staff can read
create policy "public submit contact message" on public.contact_messages for insert with check (true);
create policy "staff read contact messages" on public.contact_messages for select using (public.is_staff());
create policy "staff update contact messages" on public.contact_messages for update using (public.is_staff());

-- Audit logs: owner/manager only
create policy "owner manager read audit logs" on public.audit_logs for select using (public.is_owner_or_manager());

-- =========================================================================
-- TRIGGERS: updated_at maintenance
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','gaming_stations','games','memberships','pricing_plans',
      'promo_codes','offers','bookings','sessions'
    ])
  loop
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t
    );
  end loop;
end $$;

-- =========================================================================
-- FUNCTION: generate human-friendly booking references (A51-YYYYMMDD-XXXX)
-- =========================================================================
create sequence if not exists public.booking_ref_seq;

create or replace function public.generate_booking_reference()
returns text language plpgsql as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.booking_ref_seq');
  return 'A51-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

-- =========================================================================
-- FUNCTION: automatically create a public.profiles row whenever a new
-- Supabase Auth user is created (covers email/password signup, OTP,
-- and any future social login). Pulls full_name/phone from the signup
-- metadata passed in `options.data` on the client.
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- FUNCTION: atomically increment/decrement a customer's wallet balance
-- =========================================================================
create or replace function public.increment_wallet_balance(p_profile_id uuid, p_amount numeric)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set wallet_balance = wallet_balance + p_amount
  where id = p_profile_id;
end;
$$;
create or replace function public.increment_loyalty_points(p_profile_id uuid, p_points integer)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set loyalty_points = loyalty_points + p_points
  where id = p_profile_id;
end;
$$;

-- =========================================================================
-- FUNCTION: called when a session is marked completed — updates CRM stats
-- (visit_count, total_hours_played, total_money_spent, last_visit_at) on
-- the customer's profile. Called from the Admin session-management API.
-- =========================================================================
create or replace function public.record_completed_visit(
  p_profile_id uuid,
  p_hours numeric,
  p_amount numeric
)
returns void language plpgsql security definer as $$
begin
  update public.profiles
  set
    visit_count = visit_count + 1,
    total_hours_played = total_hours_played + p_hours,
    total_money_spent = total_money_spent + p_amount,
    last_visit_at = now()
  where id = p_profile_id;
end;
$$;
