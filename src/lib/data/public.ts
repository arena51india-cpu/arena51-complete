import { createClient } from '@/lib/supabase/server';
import type {
  Game,
  Membership,
  PricingPlan,
  Offer,
  CmsSetting,
} from '@/lib/types/database.types';

export async function getGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('games')
    .select('*')
    .eq('is_available', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Game[];
}

export async function getFeaturedGames(): Promise<Game[]> {
  const games = await getGames();
  return games.filter((g) => g.is_featured);
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as PricingPlan[];
}

export async function getMemberships(): Promise<Membership[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('memberships')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Membership[];
}

export async function getActiveOffers(): Promise<Offer[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Filter date windows client-side since Supabase JS lacks a clean
  // "starts_at is null or starts_at <= now" combinator in one call.
  return ((data ?? []) as Offer[]).filter((o) => {
    const startsOk = !o.starts_at || o.starts_at <= now;
    const endsOk = !o.ends_at || o.ends_at >= now;
    return startsOk && endsOk;
  });
}

export async function getGalleryImages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getFaqs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getPublishedReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(9);
  return data ?? [];
}

export async function getCmsSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('cms_settings').select('*').eq('key', key).single();
  return (data as CmsSetting | null)?.value as T | null;
}

export async function getAllCmsSettings(): Promise<Record<string, Record<string, unknown>>> {
  const supabase = await createClient();
  const { data } = await supabase.from('cms_settings').select('*');
  const map: Record<string, Record<string, unknown>> = {};
  (data ?? []).forEach((row: CmsSetting) => {
    map[row.key] = row.value;
  });
  return map;
}
