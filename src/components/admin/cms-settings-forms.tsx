'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { createClient } from '@/lib/supabase/client';

function useCmsSection<T extends Record<string, any>>(key: string, initial: T) {
  const router = useRouter();
  const supabase = createClient();
  const [values, setValues] = React.useState<T>(initial);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof T>(field: K, value: T[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from('cms_settings').upsert({ key, value: values });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Saved — live on the site.');
    router.refresh();
  }

  return { values, set, save, saving };
}

export function HeroSettingsForm({ initial }: { initial: any }) {
  const { values, set, save, saving } = useCmsSection('homepage_hero', {
    heading: initial?.heading ?? '',
    subheading: initial?.subheading ?? '',
    cta_text: initial?.cta_text ?? '',
  });

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-display font-semibold">Homepage Hero</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="heading">Heading</Label>
          <Input id="heading" value={values.heading} onChange={(e) => set('heading', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="subheading">Subheading</Label>
          <Textarea id="subheading" value={values.subheading} onChange={(e) => set('subheading', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ctaText">Button text</Label>
          <Input id="ctaText" value={values.cta_text} onChange={(e) => set('cta_text', e.target.value)} />
        </div>
        <Button variant="gold" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Hero'}</Button>
      </div>
    </Card>
  );
}

export function ContactSettingsForm({ initial }: { initial: any }) {
  const { values, set, save, saving } = useCmsSection('contact_info', {
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    whatsapp: initial?.whatsapp ?? '',
    email: initial?.email ?? '',
    instagram_url: initial?.instagram_url ?? '',
    google_maps_embed_url: initial?.google_maps_embed_url ?? '',
  });

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-display font-semibold">Contact & Social</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={values.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" value={values.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input id="instagram" value={values.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="mapEmbed">Google Maps embed URL</Label>
          <Input id="mapEmbed" value={values.google_maps_embed_url} onChange={(e) => set('google_maps_embed_url', e.target.value)} />
        </div>
      </div>
      <Button variant="gold" className="mt-4" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Contact Info'}</Button>
    </Card>
  );
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function BusinessHoursForm({ initial }: { initial: any }) {
  const { values, set, save, saving } = useCmsSection(
    'business_hours',
    DAYS.reduce((acc, d) => ({ ...acc, [d]: initial?.[d] ?? '' }), {} as Record<string, string>)
  );

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-display font-semibold">Business Hours</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {DAYS.map((d) => (
          <div key={d}>
            <Label htmlFor={d} className="capitalize">{d}</Label>
            <Input id={d} placeholder="12:00-23:00" value={values[d]} onChange={(e) => set(d, e.target.value)} />
          </div>
        ))}
      </div>
      <Button variant="gold" className="mt-4" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Hours'}</Button>
    </Card>
  );
}

export function LogoSettingsForm({ initial }: { initial: any }) {
  const { values, set, save, saving } = useCmsSection('logo', { url: initial?.url ?? '' });

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-display font-semibold">Logo</h3>
      <ImageUploadField label="Logo image" value={values.url} onChange={(url) => set('url', url)} folder="branding" />
      <Button variant="gold" className="mt-4" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Logo'}</Button>
    </Card>
  );
}

export function SeoSettingsForm({ initial }: { initial: any }) {
  const { values, set, save, saving } = useCmsSection('seo_meta', {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    og_image_url: initial?.og_image_url ?? '',
  });

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-display font-semibold">SEO & Meta Tags</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="seoTitle">Page title</Label>
          <Input id="seoTitle" value={values.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="seoDescription">Meta description</Label>
          <Textarea id="seoDescription" value={values.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <ImageUploadField label="Social share image" value={values.og_image_url} onChange={(url) => set('og_image_url', url)} folder="branding" />
        <Button variant="gold" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save SEO'}</Button>
      </div>
    </Card>
  );
}

export function FooterSettingsForm({ initial }: { initial: any }) {
  const { values, set, save, saving } = useCmsSection('footer', { tagline: initial?.tagline ?? '' });

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-display font-semibold">Footer</h3>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" value={values.tagline} onChange={(e) => set('tagline', e.target.value)} />
      </div>
      <Button variant="gold" className="mt-4" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Footer'}</Button>
    </Card>
  );
}
