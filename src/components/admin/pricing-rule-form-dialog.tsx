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
import type { PricingRule, PricingRuleType } from '@/lib/types/database.types';

const DAYS = [
  { value: 0, label: 'Sun' }, { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' }, { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' },
];

export function PricingRuleFormDialog({ rule }: { rule?: PricingRule }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState(rule?.name ?? '');
  const [ruleType, setRuleType] = React.useState<PricingRuleType>(rule?.rule_type ?? 'weekend');
  const [multiplier, setMultiplier] = React.useState(rule?.multiplier ?? 1.15);
  const [days, setDays] = React.useState<number[]>(rule?.applies_days_of_week ?? [5, 6, 0]);
  const [startsAt, setStartsAt] = React.useState(rule?.starts_at?.slice(0, 10) ?? '');
  const [endsAt, setEndsAt] = React.useState(rule?.ends_at?.slice(0, 10) ?? '');
  const [isActive, setIsActive] = React.useState(rule?.is_active ?? true);

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      rule_type: ruleType,
      multiplier,
      applies_days_of_week: ruleType === 'festival' ? null : days,
      starts_at: ruleType === 'festival' && startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: ruleType === 'festival' && endsAt ? new Date(endsAt).toISOString() : null,
      is_active: isActive,
    };

    const { error } = rule
      ? await supabase.from('pricing_rules').update(payload).eq('id', rule.id)
      : await supabase.from('pricing_rules').insert(payload);

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Pricing rule saved.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {rule ? <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button> : <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Add Surcharge Rule</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{rule ? 'Edit surcharge rule' : 'Add a surcharge rule'}</DialogTitle>
        <DialogDescription>Applies a multiplier on top of the base price (e.g. 1.15 = +15%).</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="ruleName">Name</Label>
            <Input id="ruleName" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Diwali Festival Pricing" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={ruleType} onValueChange={(v) => setRuleType(v as PricingRuleType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekend">Weekend / recurring days</SelectItem>
                <SelectItem value="festival">Festival (date range)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="multiplier">Multiplier</Label>
            <Input id="multiplier" type="number" step="0.01" min={1} value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} />
          </div>

          {ruleType === 'weekend' ? (
            <div>
              <Label>Applies on</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      days.includes(d.value) ? 'border-primary/50 bg-primary/15 text-gold-300' : 'border-white/10 text-muted-foreground'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startsAt">Starts</Label>
                <Input id="startsAt" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="endsAt">Ends</Label>
                <Input id="endsAt" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="ruleActive" />
            <Label htmlFor="ruleActive" className="mb-0">Active</Label>
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Save Rule'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
