import { createClient } from '@/lib/supabase/server';

export async function getCurrentStaffProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function getAllStations() {
  const supabase = await createClient();
  const { data } = await supabase.from('gaming_stations').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllGamesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('games').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllPricingPlansAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('pricing_plans').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllPricingRulesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('pricing_rules').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function getAllMembershipsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('memberships').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllPromoCodesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function getAllOffersAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('offers').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllGalleryImagesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('gallery_images').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllFaqsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllCmsSettingsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('cms_settings').select('*');
  const map: Record<string, any> = {};
  (data ?? []).forEach((row) => (map[row.key] = row.value));
  return map;
}

export async function getAllCustomers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('total_money_spent', { ascending: false });
  return data ?? [];
}

export async function getAllEmployees() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['owner', 'manager', 'reception'])
    .order('role', { ascending: true });
  return data ?? [];
}

export async function getAllBookingsAdmin(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, gaming_stations:assigned_station_id(station_name), games:preferred_game_id(title)')
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getTodaySessions() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('bookings')
    .select(
      '*, sessions(*), gaming_stations:assigned_station_id(station_name, device_type), games:preferred_game_id(title)'
    )
    .eq('booking_date', today)
    .in('status', ['confirmed', 'in_progress'])
    .order('start_time', { ascending: true });
  return data ?? [];
}

export async function getAuditLogs(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_logs')
    .select('*, profiles:actor_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getContactMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

/**
 * Pulls raw bookings/transactions for the last N days and aggregates
 * revenue, occupancy, peak hours, top games, and booking-source mix in
 * JS. Simpler and more transparent than maintaining SQL views for a
 * dashboard at this scale, and keeps every number traceable to a row
 * in `bookings`/`transactions`.
 */
export async function getAnalyticsSnapshot(days = 30) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .gte('booking_date', sinceStr);

  const rows = bookings ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStr = startOfMonth.toISOString().slice(0, 10);

  const paidRows = rows.filter((b) => b.payment_status === 'paid' || b.payment_status === 'partial');

  const todayRevenue = paidRows
    .filter((b) => b.booking_date === today)
    .reduce((sum, b) => sum + Number(b.advance_amount) + (b.payment_status === 'paid' ? Number(b.balance_amount) : 0), 0);

  const monthlyRevenue = paidRows
    .filter((b) => b.booking_date >= monthStr)
    .reduce((sum, b) => sum + Number(b.advance_amount) + (b.payment_status === 'paid' ? Number(b.balance_amount) : 0), 0);

  const onlineCount = rows.filter((b) => b.source === 'online').length;
  const walkInCount = rows.filter((b) => b.source === 'walk_in').length;
  const cancelledCount = rows.filter((b) => b.status === 'cancelled').length;
  const noShowCount = rows.filter((b) => b.status === 'no_show').length;

  // Peak hours: bucket by start_time hour
  const hourBuckets: Record<string, number> = {};
  rows.forEach((b) => {
    const hour = b.start_time.slice(0, 2);
    hourBuckets[hour] = (hourBuckets[hour] ?? 0) + 1;
  });

  // Revenue by day for the trend chart
  const revenueByDay: Record<string, number> = {};
  paidRows.forEach((b) => {
    const amt = Number(b.advance_amount) + (b.payment_status === 'paid' ? Number(b.balance_amount) : 0);
    revenueByDay[b.booking_date] = (revenueByDay[b.booking_date] ?? 0) + amt;
  });

  // Most played game (by preferred_game_id frequency)
  const gameCounts: Record<string, number> = {};
  rows.forEach((b) => {
    if (b.preferred_game_id) gameCounts[b.preferred_game_id] = (gameCounts[b.preferred_game_id] ?? 0) + 1;
  });
  const topGameIds = Object.entries(gameCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let topGames: { id: string; title: string; count: number }[] = [];
  if (topGameIds.length > 0) {
    const { data: games } = await supabase.from('games').select('id, title').in('id', topGameIds);
    topGames = topGameIds.map((id) => ({
      id,
      title: games?.find((g) => g.id === id)?.title ?? 'Unknown',
      count: gameCounts[id],
    }));
  }

  // Best customers by spend among bookings in range
  const spendByCustomer: Record<string, { name: string; amount: number }> = {};
  paidRows.forEach((b) => {
    const amt = Number(b.advance_amount) + (b.payment_status === 'paid' ? Number(b.balance_amount) : 0);
    const key = b.customer_phone;
    if (!spendByCustomer[key]) spendByCustomer[key] = { name: b.customer_name, amount: 0 };
    spendByCustomer[key].amount += amt;
  });
  const bestCustomers = Object.values(spendByCustomer)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Occupancy rate: booked station-hours / (active stations * hours open) over the window
  const { data: stations } = await supabase.from('gaming_stations').select('id').eq('is_active', true);
  const stationCount = stations?.length ?? 1;
  const bookedMinutes = rows
    .filter((b) => ['confirmed', 'in_progress', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + b.duration_minutes, 0);
  const openHoursPerDay = 13; // approximate lounge hours; refine via business_hours CMS setting later
  const capacityMinutes = stationCount * openHoursPerDay * 60 * days;
  const occupancyRate = capacityMinutes > 0 ? Math.min(100, Math.round((bookedMinutes / capacityMinutes) * 100)) : 0;

  // Membership sales in range
  const { data: subs } = await supabase
    .from('membership_subscriptions')
    .select('*, memberships(display_name)')
    .gte('started_at', since.toISOString());

  return {
    todayRevenue,
    monthlyRevenue,
    occupancyRate,
    onlineCount,
    walkInCount,
    cancelledCount,
    noShowCount,
    hourBuckets,
    revenueByDay,
    topGames,
    bestCustomers,
    membershipSalesCount: subs?.length ?? 0,
    totalBookings: rows.length,
  };
}
