'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { formatCurrencyINR } from '@/lib/utils';

export function CustomerDetailDialog({ customer }: { customer: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [notes, setNotes] = React.useState(customer.internal_notes ?? '');
  const [saving, setSaving] = React.useState(false);

  async function handleSaveNotes() {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ internal_notes: notes }).eq('id', customer.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Notes saved.');
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle>{customer.full_name}</DialogTitle>
        <DialogDescription>{customer.phone} {customer.email ? `· ${customer.email}` : ''}</DialogDescription>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Visits" value={customer.visit_count} />
          <Info label="Hours played" value={`${customer.total_hours_played}h`} />
          <Info label="Total spent" value={formatCurrencyINR(customer.total_money_spent)} />
          <Info label="Loyalty points" value={customer.loyalty_points} />
          <Info label="Wallet balance" value={formatCurrencyINR(customer.wallet_balance)} />
          <Info label="Referrals" value={customer.referral_count} />
        </div>

        {customer.membership_id && (
          <Badge variant="gold" className="mt-4">Active member</Badge>
        )}

        <div className="mt-6">
          <Label htmlFor="internalNotes">Internal notes (staff only)</Label>
          <Textarea id="internalNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          <Button variant="outline" size="sm" className="mt-2" onClick={handleSaveNotes} disabled={saving}>
            {saving ? 'Saving…' : 'Save Notes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}
