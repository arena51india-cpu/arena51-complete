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
import { createClient } from '@/lib/supabase/client';
import type { PromoCode, DiscountType } from '@/lib/types/database.types';

export function PromoCodeFormDialog({ promo }: { promo?: PromoCode }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [code, setCode] = React.useState(promo?.code ?? '');
  const [discountType, setDiscountType] = React.useState<DiscountType>(promo?.discount_type ?? 'percentage');
  const [discountValue, setDiscountValue] = React.useState(promo?.discount_value ?? 10);
  const [expiryDate, setExpiryDate] = React.useState(promo?.expiry_date?.slice(0, 10) ?? '');
  const [maxUses, setMaxUses] = React.useState(promo?.max_uses ?? undefined);
  const [minAmount, setMinAmount] = React.useState(promo?.min_booking_amount ?? 0);
  const [autoApply, setAutoApply] = React.useState(promo?.auto_apply ?? false);
  const [isActive, setIsActive] = React.useState(promo?.is_active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: discountValue,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
      max_uses: maxUses || null,
      min_booking_amount: minAmount,
      auto_apply: autoApply,
      is_active: isActive,
    };

    const { error } = promo
      ? await supabase.from('promo_codes').update(payload).eq('id', promo.id)
      : await supabase.from('promo_codes').insert(payload);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Promo code saved.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {promo ? <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button> : <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add Promo Code</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{promo ? 'Edit promo code' : 'Add a promo code'}</DialogTitle>
        <DialogDescription>Codes are validated automatically at checkout.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required className="font-mono" />
          </div>
          <div>
            <Label>Discount type</Label>
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="flat">Flat amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountValue">{discountType === 'percentage' ? 'Percent off' : 'Amount off (₹)'}</Label>
            <Input id="discountValue" type="number" min={0} value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="expiryDate">Expiry date</Label>
            <Input id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="maxUses">Max uses (blank = unlimited)</Label>
            <Input id="maxUses" type="number" min={1} value={maxUses ?? ''} onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="minAmount">Minimum booking amount (₹)</Label>
            <Input id="minAmount" type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={autoApply} onCheckedChange={setAutoApply} id="autoApply" />
            <Label htmlFor="autoApply" className="mb-0">Auto-apply</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="promoActive" />
            <Label htmlFor="promoActive" className="mb-0">Active</Label>
          </div>
          <Button type="submit" variant="gold" className="sm:col-span-2" disabled={saving}>
            {saving ? 'Saving…' : 'Save Promo Code'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
