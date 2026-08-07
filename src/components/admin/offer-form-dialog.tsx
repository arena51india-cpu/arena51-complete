'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { createClient } from '@/lib/supabase/client';
import type { Offer, OfferType } from '@/lib/types/database.types';

const OFFER_TYPES: OfferType[] = ['homepage_banner', 'festival', 'weekend', 'flash_sale', 'student', 'combo'];

export function OfferFormDialog({ offer }: { offer?: Offer }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState(offer?.title ?? '');
  const [subtitle, setSubtitle] = React.useState(offer?.subtitle ?? '');
  const [offerType, setOfferType] = React.useState<OfferType>(offer?.offer_type ?? 'weekend');
  const [image, setImage] = React.useState(offer?.image_url ?? '');
  const [startsAt, setStartsAt] = React.useState(offer?.starts_at?.slice(0, 10) ?? '');
  const [endsAt, setEndsAt] = React.useState(offer?.ends_at?.slice(0, 10) ?? '');
  const [isActive, setIsActive] = React.useState(offer?.is_active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      subtitle: subtitle || null,
      offer_type: offerType,
      image_url: image || null,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_active: isActive,
    };

    const { error } = offer
      ? await supabase.from('offers').update(payload).eq('id', offer.id)
      : await supabase.from('offers').insert(payload);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Offer saved.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {offer ? <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button> : <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add Offer</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>{offer ? 'Edit offer' : 'Add an offer'}</DialogTitle>
        <DialogDescription>Shown on the homepage and Offers page while active.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div>
            <Label>Offer type</Label>
            <Select value={offerType} onValueChange={(v) => setOfferType(v as OfferType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OFFER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ImageUploadField label="Banner image" value={image} onChange={setImage} folder="offers" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startsAt">Starts</Label>
              <Input id="startsAt" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endsAt">Ends</Label>
              <Input id="endsAt" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="offerActive" />
            <Label htmlFor="offerActive" className="mb-0">Active</Label>
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Save Offer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
