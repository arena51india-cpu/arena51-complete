'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { createClient } from '@/lib/supabase/client';

export function GalleryUploadDialog() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [image, setImage] = React.useState('');
  const [caption, setCaption] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      toast.error('Upload an image first.');
      return;
    }
    setSaving(true);

    const { error } = await supabase.from('gallery_images').insert({
      image_url: image,
      caption: caption || null,
    });

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Image added to gallery.');
    setOpen(false);
    setImage('');
    setCaption('');
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Upload Image</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add gallery image</DialogTitle>
        <DialogDescription>Shown on the homepage and Gallery page.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <ImageUploadField label="Photo" value={image} onChange={setImage} folder="gallery" />
          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Add to Gallery'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
