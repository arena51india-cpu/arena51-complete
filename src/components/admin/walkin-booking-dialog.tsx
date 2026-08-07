'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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
import { SUPPORTED_DURATIONS_MINUTES } from '@/lib/pricing/calculator';
import type { PricingPlan, Game } from '@/lib/types/database.types';

export function WalkinBookingDialog({ plans, games }: { plans: PricingPlan[]; games: Game[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [planId, setPlanId] = React.useState('');
  const [players, setPlayers] = React.useState(1);
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = React.useState(new Date().toTimeString().slice(0, 5));
  const [duration, setDuration] = React.useState(60);
  const [gameId, setGameId] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [markPaid, setMarkPaid] = React.useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch('/api/admin/walkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        players,
        bookingDate: date,
        startTime: time,
        durationMinutes: duration,
        pricingPlanId: planId,
        preferredGameId: gameId || undefined,
        customerName: name,
        customerPhone: phone,
        markPaid,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error || 'Could not create walk-in booking.');
      return;
    }

    toast.success(`Walk-in booked — assigned to ${data.assignedStation?.station_name}.`);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm">
          <Plus className="h-4 w-4" /> New Walk-in
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle>New walk-in booking</DialogTitle>
        <DialogDescription>Instantly blocks the assigned station from online bookings.</DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Setup</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a pricing plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.plan_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="players">Players</Label>
            <Input id="players" type="number" min={1} max={4} value={players} onChange={(e) => setPlayers(Number(e.target.value))} />
          </div>
          <div>
            <Label>Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_DURATIONS_MINUTES.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          <div className="sm:col-span-2">
            <Label>Preferred game (optional)</Label>
            <Select value={gameId} onValueChange={setGameId}>
              <SelectTrigger>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent>
                {games.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Customer name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={markPaid} onCheckedChange={setMarkPaid} id="markPaid" />
            <Label htmlFor="markPaid" className="mb-0">Paid in full at counter</Label>
          </div>

          <Button type="submit" variant="gold" className="sm:col-span-2" disabled={submitting || !planId}>
            {submitting ? 'Creating…' : 'Create Walk-in Booking'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
