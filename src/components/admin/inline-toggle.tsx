'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';

export function InlineToggle({
  table,
  id,
  field,
  initialValue,
}: {
  table: string;
  id: string;
  field: string;
  initialValue: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [checked, setChecked] = React.useState(initialValue);
  const [saving, setSaving] = React.useState(false);

  async function handleChange(value: boolean) {
    setChecked(value);
    setSaving(true);
    const { error } = await supabase.from(table).update({ [field]: value }).eq('id', id);
    setSaving(false);

    if (error) {
      setChecked(!value);
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return <Switch checked={checked} onCheckedChange={handleChange} disabled={saving} />;
}
