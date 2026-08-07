import { createClient } from '@/lib/supabase/server';
import type { Profile, Booking, Transaction, Membership } from '@/lib/types/database.types';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return (data as Profile) ?? null;
}

export async function getMyBookings(): Promise<
  (Booking & { gaming_stations: { station_name: string } | null; games: { title: string } | null })[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('bookings')
    .select('*, gaming_stations:assigned_station_id(station_name), games:preferred_game_id(title)')
    .eq('profile_id', user.id)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false });

  return (data ?? []) as any;
}

export async function getMyBookingById(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, gaming_stations:assigned_station_id(station_name, device_type), games:preferred_game_id(title)')
    .eq('id', bookingId)
    .single();
  return data;
}

export async function getMyTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('transactions')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []) as Transaction[];
}

export async function getMyLoyaltyLedger() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('loyalty_ledger')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getMyMembershipSubscription() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('membership_subscriptions')
    .select('*, memberships(*)')
    .eq('profile_id', user.id)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getAllMemberships(): Promise<Membership[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('memberships')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Membership[];
}

export async function getMyReviewForBooking(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('reviews').select('*').eq('booking_id', bookingId).maybeSingle();
  return data;
}

/**
 * Computes the customer's most-preferred games from their booking
 * history (frequency of `preferred_game_id` across past bookings).
 */
export async function getMyFavouriteGames() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('bookings')
    .select('preferred_game_id, games:preferred_game_id(id, title, cover_image_url, category)')
    .eq('profile_id', user.id)
    .not('preferred_game_id', 'is', null);

  const counts = new Map<string, { game: any; count: number }>();
  (data ?? []).forEach((row: any) => {
    if (!row.games) return;
    const existing = counts.get(row.games.id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(row.games.id, { game: row.games, count: 1 });
    }
  });

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}
