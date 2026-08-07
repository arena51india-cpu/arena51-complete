'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'arena51-public';

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'uploads',
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const supabase = createClient();
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      setUploading(false);
      toast.error(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <Label>{label}</Label>
      {value ? (
        <div className="relative mt-1 h-32 w-full overflow-hidden rounded-lg border border-white/10">
          <Image src={value} alt={label} fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40"
        >
          <Upload className="h-5 w-5" />
          {uploading ? 'Uploading…' : 'Click to upload an image'}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
