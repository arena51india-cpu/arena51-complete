'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import type { Membership } from '@/lib/types/database.types';

export function MembershipFormDialog({ membership }: { membership: Membership }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [displayName, setDisplayName] = React.useState(membership.display_name);
  const [price, setPrice] = React.useState(membership.price);
  const [durationDays, setDurationDays] = React.useState(membership.duration_days);
  const [discountPercent, setDiscountPercent] = React.useState(membership.discount_percent);
  const [freeHours, setFreeHours] = React.useState(membership.free_hours);
  const [birthdayBenefit, setBirthdayBenefit] = React.useState(membership.birthday_benefit_text ?? '');
  const [priorityBooking, setPriorityBooking] = React.useState(membership.priority_booking);
  const [rewardMultiplier, setRewardMultiplier] = React.useState(membership.reward_multiplier);
  const [isActive, setIsActive] = React.useState(membership.is_active);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('memberships')
      .update({
        display_name: displayName,
        price,
        duration_days: durationDays,
        discount_percent: discountPercent,
        free_hours: freeHours,
        birthday_benefit_text: birthdayBenefit || null,
        priority_booking: priorityBooking,
        reward_multiplier: rewardMultiplier,
        is_active: isActive,
      })
      .eq('id', membership.id);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Membership plan updated.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit {membership.tier} membership</DialogTitle>
        <DialogDescription>Changes apply to new purchases immediately.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="durationDays">Duration (days)</Label>
            <Input id="durationDays" type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="discountPercent">Discount %</Label>
            <Input id="discountPercent" type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="freeHours">Free hours/month</Label>
            <Input id="freeHours" type="number" min={0} value={freeHours} onChange={(e) => setFreeHours(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="rewardMultiplier">Reward multiplier</Label>
            <Input id="rewardMultiplier" type="number" step="0.1" min={1} value={rewardMultiplier} onChange={(e) => setRewardMultiplier(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={priorityBooking} onCheckedChange={setPriorityBooking} id="priorityBooking" />
            <Label htmlFor="priorityBooking" className="mb-0">Priority booking</Label>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="birthdayBenefit">Birthday benefit</Label>
            <Input id="birthdayBenefit" value={birthdayBenefit} onChange={(e) => setBirthdayBenefit(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
            <Label htmlFor="isActive" className="mb-0">Active</Label>
          </div>
          <Button type="submit" variant="gold" className="sm:col-span-2" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
