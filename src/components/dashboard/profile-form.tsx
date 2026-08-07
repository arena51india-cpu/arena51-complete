'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database.types';

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = React.useState(profile.full_name);
  const [phone, setPhone] = React.useState(profile.phone ?? '');
  const [birthday, setBirthday] = React.useState(profile.birthday ?? '');
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, birthday: birthday || null })
      .eq('id', profile.id);

    setSaving(false);

    if (error) {
      toast.error('Could not save your changes.');
      return;
    }
    toast.success('Profile updated.');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email ?? ''} disabled />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="birthday">Birthday</Label>
        <Input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
        <p className="mt-1 text-xs text-muted-foreground">Unlocks your membership birthday perk.</p>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="gold" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
