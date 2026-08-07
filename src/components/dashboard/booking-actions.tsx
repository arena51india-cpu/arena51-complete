'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function BookingActions({
  bookingId,
  bookingDate,
  startTime,
}: {
  bookingId: string;
  bookingDate: string;
  startTime: string;
}) {
  const router = useRouter();
  const [cancelling, setCancelling] = React.useState(false);
  const [rescheduling, setRescheduling] = React.useState(false);
  const [newDate, setNewDate] = React.useState(bookingDate);
  const [newTime, setNewTime] = React.useState(startTime.slice(0, 5));
  const [dialogOpen, setDialogOpen] = React.useState(false);

  async function handleCancel() {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(true);
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    setCancelling(false);

    if (!res.ok) {
      toast.error(data.error || 'Could not cancel this booking.');
      return;
    }
    toast.success('Booking cancelled.');
    router.refresh();
  }

  async function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    setRescheduling(true);
    const res = await fetch('/api/bookings/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, bookingDate: newDate, startTime: newTime }),
    });
    const data = await res.json();
    setRescheduling(false);

    if (!res.ok) {
      toast.error(data.error || 'Could not reschedule this booking.');
      return;
    }
    toast.success('Booking rescheduled.');
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Reschedule
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Reschedule booking</DialogTitle>
          <DialogDescription>
            Pick a new date and time. Your station will be reassigned automatically.
          </DialogDescription>
          <form onSubmit={handleReschedule} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="newDate">New date</Label>
              <Input
                id="newDate"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newTime">New time</Label>
              <Input id="newTime" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} required />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={rescheduling}>
              {rescheduling ? 'Rescheduling…' : 'Confirm New Slot'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="ghost" size="sm" onClick={handleCancel} disabled={cancelling} className="text-destructive hover:bg-destructive/10">
        {cancelling ? 'Cancelling…' : 'Cancel'}
      </Button>
    </div>
  );
}
