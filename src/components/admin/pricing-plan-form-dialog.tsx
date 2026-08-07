'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
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
import type { PricingPlan } from '@/lib/types/database.types';

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export function PricingPlanFormDialog({ plan }: { plan?: PricingPlan }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState(plan?.plan_name ?? '');
  const [players, setPlayers] = React.useState(plan?.players ?? 1);
  const [controllers, setControllers] = React.useState(plan?.controllers ?? 1);
  const [basePrice, setBasePrice] = React.useState(plan?.base_price_per_hour ?? 0);
  const [extraPrice, setExtraPrice] = React.useState(plan?.extra_30_min_price ?? 0);
  const [isActive, setIsActive] = React.useState(plan?.is_active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      plan_name: name,
      slug: plan?.slug ?? slugify(name),
      players,
      controllers,
      base_price_per_hour: basePrice,
      extra_30_min_price: extraPrice,
      is_active: isActive,
    };

    const { error } = plan
      ? await supabase.from('pricing_plans').update(payload).eq('id', plan.id)
      : await supabase.from('pricing_plans').insert(payload);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Pricing saved — reflected on the site immediately.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {plan ? <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button> : <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add Plan</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{plan ? 'Edit pricing plan' : 'Add a pricing plan'}</DialogTitle>
        <DialogDescription>Changes apply to new bookings immediately.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="planName">Plan name</Label>
            <Input id="planName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="players">Players</Label>
            <Input id="players" type="number" min={1} value={players} onChange={(e) => setPlayers(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="controllers">Controllers</Label>
            <Input id="controllers" type="number" min={1} value={controllers} onChange={(e) => setControllers(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="basePrice">Price per hour (₹)</Label>
            <Input id="basePrice" type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="extraPrice">Extra 30 min (₹)</Label>
            <Input id="extraPrice" type="number" min={0} value={extraPrice} onChange={(e) => setExtraPrice(Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
            <Label htmlFor="isActive" className="mb-0">Active</Label>
          </div>
          <Button type="submit" variant="gold" className="sm:col-span-2" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
