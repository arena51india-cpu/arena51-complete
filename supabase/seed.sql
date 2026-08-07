-- =========================================================================
-- ARENA 51 — SEED DATA
-- Run after schema.sql. Safe to re-run (uses ON CONFLICT).
-- =========================================================================

-- ---------------------------------------------------------------------
-- PRICING PLANS (matches the current price list; fully editable later
-- via Admin → Pricing, no code changes required)
-- ---------------------------------------------------------------------
insert into public.pricing_plans (plan_name, slug, players, controllers, base_price_per_hour, extra_30_min_price, sort_order)
values
  ('Standard - 1 Player', 'standard-1p', 1, 1, 149, 90, 1),
  ('Standard - 2 Players', 'standard-2p', 2, 2, 249, 150, 2),
  ('Standard - 4 Players', 'standard-4p', 4, 4, 399, 240, 3),
  ('1 BY 2 Setup - 2 Players (1 Controller)', '1by2-2p', 2, 1, 199, 120, 4),
  ('1 BY 2 Setup - 4 Players (2 Controllers)', '1by2-4p', 4, 2, 349, 210, 5)
on conflict (slug) do update set
  base_price_per_hour = excluded.base_price_per_hour,
  extra_30_min_price = excluded.extra_30_min_price;

-- ---------------------------------------------------------------------
-- PRICING RULES (weekend surcharge example — admin can add/edit more)
-- ---------------------------------------------------------------------
insert into public.pricing_rules (rule_type, name, multiplier, applies_days_of_week, is_active)
values
  ('weekend', 'Weekend Surcharge (Fri-Sun)', 1.15, array[0,5,6], true)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- GAMING STATIONS (starter set — admin can add PS5 #3, PC #1/#2, VR, etc.
-- at any time with zero code changes; booking engine auto-includes them)
-- ---------------------------------------------------------------------
insert into public.gaming_stations (station_name, station_number, device_type, status, controllers, max_players, sort_order)
values
  ('PS5 Station 1', 1, 'ps5', 'available', 2, 2, 1),
  ('PS5 Station 2', 2, 'ps5', 'available', 4, 4, 2),
  ('PS5 Station 3 (1 by 2)', 3, 'ps5', 'available', 1, 2, 3)
on conflict (station_number) do nothing;

-- ---------------------------------------------------------------------
-- GAME LIBRARY
-- ---------------------------------------------------------------------
insert into public.games (title, slug, category, min_players, max_players, description, is_featured, is_available, sort_order, compatible_device_types)
values
  ('EA SPORTS FC 26', 'ea-sports-fc-26', 'multiplayer', 1, 4, 'The latest football sim with authentic clubs, leagues, and Ultimate Team.', true, true, 1, array['ps5']::station_device_type[]),
  ('WWE 2K25', 'wwe-2k25', 'multiplayer', 1, 4, 'Full roster wrestling action with career and universe modes.', false, true, 2, array['ps5']::station_device_type[]),
  ('Call of Duty: Modern Warfare', 'cod-modern-warfare', 'multiplayer', 1, 4, 'Fast-paced tactical multiplayer shooter.', true, true, 3, array['ps5']::station_device_type[]),
  ('Tekken 8', 'tekken-8', 'multiplayer', 1, 2, 'Premier 3D fighting game with deep combo systems.', false, true, 4, array['ps5']::station_device_type[]),
  ('Mortal Kombat', 'mortal-kombat', 'multiplayer', 1, 2, 'Brutal, iconic fighting game franchise.', false, true, 5, array['ps5']::station_device_type[]),
  ('Rocket League', 'rocket-league', 'multiplayer', 1, 4, 'Car-soccer arcade sports game, easy to learn, fun in groups.', true, true, 6, array['ps5']::station_device_type[]),
  ('GTA V', 'gta-v', 'single_player', 1, 1, 'Open-world crime saga across Los Santos.', true, true, 7, array['ps5']::station_device_type[]),
  ('God of War Ragnarök', 'god-of-war-ragnarok', 'single_player', 1, 1, 'Kratos and Atreus face the coming of Ragnarök.', true, true, 8, array['ps5']::station_device_type[]),
  ('Ghost of Tsushima', 'ghost-of-tsushima', 'single_player', 1, 1, 'Open-world samurai epic set in feudal Japan.', false, true, 9, array['ps5']::station_device_type[]),
  ('Marvel''s Spider-Man Remastered', 'spiderman-remastered', 'single_player', 1, 1, 'Swing through New York as Spider-Man.', true, true, 10, array['ps5']::station_device_type[]),
  ('Assassin''s Creed Valhalla', 'ac-valhalla', 'single_player', 1, 1, 'Viking-era open world action RPG.', false, true, 11, array['ps5']::station_device_type[]),
  ('God of War III Remastered', 'god-of-war-3-remastered', 'single_player', 1, 1, 'Kratos'' brutal finale against the Greek gods.', false, true, 12, array['ps5']::station_device_type[]),
  ('Resident Evil 3', 'resident-evil-3', 'single_player', 1, 1, 'Survival horror classic remake.', false, true, 13, array['ps5']::station_device_type[])
on conflict (slug) do update set
  description = excluded.description,
  is_featured = excluded.is_featured;

-- ---------------------------------------------------------------------
-- MEMBERSHIPS
-- ---------------------------------------------------------------------
insert into public.memberships (tier, display_name, price, duration_days, discount_percent, free_hours, birthday_benefit_text, priority_booking, reward_multiplier, sort_order)
values
  ('silver', 'Silver Membership', 499, 30, 5, 1, 'Free 1-hour session in birthday month', false, 1.0, 1),
  ('gold', 'Gold Membership', 999, 30, 10, 3, 'Free 2-hour session + free snack combo in birthday month', true, 1.5, 2),
  ('platinum', 'Platinum Membership', 1999, 30, 15, 6, 'Free 4-hour session + guest pass in birthday month', true, 2.0, 3)
on conflict (tier) do update set
  price = excluded.price,
  discount_percent = excluded.discount_percent,
  free_hours = excluded.free_hours;

-- ---------------------------------------------------------------------
-- SAMPLE PROMO CODE
-- ---------------------------------------------------------------------
insert into public.promo_codes (code, discount_type, discount_value, expiry_date, max_uses, min_booking_amount, auto_apply, is_active)
values
  ('WELCOME10', 'percentage', 10, now() + interval '90 days', 500, 0, false, true)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- DEFAULT CMS SETTINGS (homepage hero, contact info, socials, hours, SEO)
-- Admin edits these via the CMS forms in Phase 4 — no code changes needed.
-- ---------------------------------------------------------------------
insert into public.cms_settings (key, value) values
  ('homepage_hero', '{
    "heading": "Level Up Your Game Night",
    "subheading": "Premium PS5, PC & VR gaming stations. Book your slot in seconds.",
    "cta_text": "Book Now",
    "background_image_url": ""
  }'::jsonb),
  ('contact_info', '{
    "address": "",
    "phone": "",
    "whatsapp": "",
    "email": "",
    "instagram_url": "",
    "google_maps_embed_url": ""
  }'::jsonb),
  ('business_hours', '{
    "monday": "12:00-23:00", "tuesday": "12:00-23:00", "wednesday": "12:00-23:00",
    "thursday": "12:00-23:00", "friday": "12:00-01:00", "saturday": "11:00-01:00",
    "sunday": "11:00-23:00"
  }'::jsonb),
  ('footer', '{"tagline": "Arena 51 — Kolkata''s premium gaming lounge.", "links": []}'::jsonb),
  ('logo', '{"url": ""}'::jsonb),
  ('seo_meta', '{
    "title": "Arena 51 Gaming Lounge | Book PS5, PC & VR Gaming Sessions",
    "description": "Book premium gaming stations at Arena 51 Gaming Lounge.",
    "og_image_url": ""
  }'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- SAMPLE FAQS
-- ---------------------------------------------------------------------
insert into public.faqs (question, answer, sort_order) values
  ('Do I need to select a specific console when booking?', 'No — you may optionally tell us your preferred game, but Arena 51 automatically assigns you the best available gaming station when you arrive.', 1),
  ('Can I extend my session?', 'Yes, subject to availability. Ask our reception team to extend your session in 30-minute increments.', 2),
  ('Do you offer memberships?', 'Yes — Silver, Gold, and Platinum memberships offer discounts, free hours, and birthday perks.', 3)
on conflict do nothing;

-- =========================================================================
-- NOTE ON SAMPLE ACCOUNTS
-- =========================================================================
-- Supabase Auth users (admin/reception/customer) cannot be created via plain
-- SQL insert because passwords must go through Supabase Auth's hashing.
-- See /docs/sample-accounts.md for the exact `supabase.auth.admin.createUser`
-- script (provided in this project) that creates:
--   owner@arena51.example       (role: owner)
--   reception@arena51.example   (role: reception)
--   customer@arena51.example    (role: customer)
-- and links each to a row in public.profiles with the correct role.
