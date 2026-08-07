'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import type { Game } from '@/lib/types/database.types';

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export function GameFormDialog({ game }: { game?: Game }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState(game?.title ?? '');
  const [category, setCategory] = React.useState<'multiplayer' | 'single_player'>(game?.category ?? 'multiplayer');
  const [minPlayers, setMinPlayers] = React.useState(game?.min_players ?? 1);
  const [maxPlayers, setMaxPlayers] = React.useState(game?.max_players ?? 4);
  const [description, setDescription] = React.useState(game?.description ?? '');
  const [coverImage, setCoverImage] = React.useState(game?.cover_image_url ?? '');
  const [bannerImage, setBannerImage] = React.useState(game?.banner_image_url ?? '');
  const [isFeatured, setIsFeatured] = React.useState(game?.is_featured ?? false);
  const [isAvailable, setIsAvailable] = React.useState(game?.is_available ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug: game?.slug ?? slugify(title),
      category,
      min_players: minPlayers,
      max_players: maxPlayers,
      description: description || null,
      cover_image_url: coverImage || null,
      banner_image_url: bannerImage || null,
      is_featured: isFeatured,
      is_available: isAvailable,
    };

    const { error } = game
      ? await supabase.from('games').update(payload).eq('id', game.id)
      : await supabase.from('games').insert(payload);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(game ? 'Game updated.' : 'Game added to the library.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {game ? (
          <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
        ) : (
          <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add Game</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogTitle>{game ? 'Edit game' : 'Add a new game'}</DialogTitle>
        <DialogDescription>Featured games appear on the homepage automatically.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="multiplayer">Multiplayer</SelectItem>
                <SelectItem value="single_player">Single Player</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minPlayers">Min players</Label>
              <Input id="minPlayers" type="number" min={1} value={minPlayers} onChange={(e) => setMinPlayers(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="maxPlayers">Max players</Label>
              <Input id="maxPlayers" type="number" min={1} value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <ImageUploadField label="Cover image" value={coverImage} onChange={setCoverImage} folder="games" />
          <ImageUploadField label="Banner image" value={bannerImage} onChange={setBannerImage} folder="games" />
          <div className="flex items-center gap-3">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="isFeatured" />
            <Label htmlFor="isFeatured" className="mb-0">Featured</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isAvailable} onCheckedChange={setIsAvailable} id="isAvailable" />
            <Label htmlFor="isAvailable" className="mb-0">Available</Label>
          </div>
          <Button type="submit" variant="gold" className="sm:col-span-2" disabled={saving}>
            {saving ? 'Saving…' : game ? 'Save Changes' : 'Add Game'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
