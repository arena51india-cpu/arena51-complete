'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import type { GamingStation, StationDeviceType, StationStatus } from '@/lib/types/database.types';

const DEVICE_TYPES: StationDeviceType[] = ['ps5', 'gaming_pc', 'vr', 'racing_simulator', 'xbox', 'nintendo_switch', 'other'];
const STATUSES: StationStatus[] = ['available', 'occupied', 'maintenance', 'offline'];

export function StationFormDialog({ station, nextStationNumber }: { station?: GamingStation; nextStationNumber: number }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState(station?.station_name ?? '');
  const [number, setNumber] = React.useState(station?.station_number ?? nextStationNumber);
  const [deviceType, setDeviceType] = React.useState<StationDeviceType>(station?.device_type ?? 'ps5');
  const [status, setStatus] = React.useState<StationStatus>(station?.status ?? 'available');
  const [controllers, setControllers] = React.useState(station?.controllers ?? 2);
  const [maxPlayers, setMaxPlayers] = React.useState(station?.max_players ?? 2);
  const [notes, setNotes] = React.useState(station?.notes ?? '');
  const [isActive, setIsActive] = React.useState(station?.is_active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      station_name: name,
      station_number: number,
      device_type: deviceType,
      status,
      controllers,
      max_players: maxPlayers,
      notes: notes || null,
      is_active: isActive,
    };

    const { error } = station
      ? await supabase.from('gaming_stations').update(payload).eq('id', station.id)
      : await supabase.from('gaming_stations').insert(payload);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(station ? 'Station updated.' : 'Station added — the booking engine picks it up automatically.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {station ? (
          <Button variant="ghost" size="sm">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="gold" size="sm">
            <Plus className="h-4 w-4" /> Add Station
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{station ? 'Edit station' : 'Add a new gaming station'}</DialogTitle>
        <DialogDescription>
          New stations are picked up by the booking engine automatically — no code changes needed.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="stationName">Display name</Label>
            <Input id="stationName" value={name} onChange={(e) => setName(e.target.value)} required placeholder="PS5 Station 4" />
          </div>
          <div>
            <Label htmlFor="stationNumber">Station number</Label>
            <Input id="stationNumber" type="number" value={number} onChange={(e) => setNumber(Number(e.target.value))} required />
          </div>
          <div>
            <Label>Device type</Label>
            <Select value={deviceType} onValueChange={(v) => setDeviceType(v as StationDeviceType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEVICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StationStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="controllers">Controllers</Label>
            <Input id="controllers" type="number" min={1} value={controllers} onChange={(e) => setControllers(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="maxPlayers">Supported players</Label>
            <Input id="maxPlayers" type="number" min={1} max={8} value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
            <Label htmlFor="isActive" className="mb-0">Active (visible to booking engine)</Label>
          </div>
          <Button type="submit" variant="gold" className="sm:col-span-2" disabled={saving}>
            {saving ? 'Saving…' : station ? 'Save Changes' : 'Add Station'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
