'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function DeleteRowButton({ table, id, label = 'this item' }: { table: string; id: string; label?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
    setDeleting(true);
    const { error } = await supabase.from(table).delete().eq('id', id);
    setDeleting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Deleted.');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="text-destructive hover:bg-destructive/10">
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
