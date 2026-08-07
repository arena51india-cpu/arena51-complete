'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Play, Pause, Square, Clock, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { GamingStation } from '@/lib/types/database.types';

interface SessionData {
  id: string | null;
  status: 'not_started' | 'active' | 'paused' | 'ended' | null;
  scheduled_start: string;
  scheduled_end: string;
}

interface BookingRow {
  id: string;
  booking_reference: string;
  customer_name: string;
  players: number;
  duration_minutes: number;
  gaming_stations: { station_name: string; device_type: string } | null;
  games: { title: string } | null;
  sessions: SessionData[];
}

function formatCountdown(ms: number) {
  const sign = ms < 0 ? '-' : '';
  const abs = Math.abs(ms);
  const mins = Math.floor(abs / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function SessionCard({ booking, availableStations }: { booking: BookingRow; availableStations: GamingStation[] }) {
  const router = useRouter();
  const session = booking.sessions?.[0] ?? null;
  const [now, setNow] = React.useState(Date.now());
  const [loading, setLoading] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  const [selectedStation, setSelectedStation] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = session ? new Date(session.scheduled_end).getTime() - now : 0;
  const isWarning = session?.status === 'active' && remainingMs > 0 && remainingMs < 10 * 60 * 1000;
  const isExpired = session?.status === 'active' && remainingMs <= 0;

  async function callAction(url: string, body: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || 'Action failed.');
      return false;
    }
    if (data.note) toast.info(data.note);
    router.refresh();
    return true;
  }

  return (
    <Card className={`p-5 ${isExpired ? 'border-destructive/50' : isWarning ? 'border-primary/50' : ''}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-gold-300">{booking.booking_reference}</span>
            <Badge variant={session?.status === 'active' ? 'neon' : 'outline'}>
              {session?.status?.replace('_', ' ') ?? 'not started'}
            </Badge>
            {isWarning && (
              <Badge variant="gold">
                <AlertTriangle className="mr-1 h-3 w-3" /> Ending soon
              </Badge>
            )}
            {isExpired && (
              <Badge className="border-destructive/40 bg-destructive/15 text-destructive">
                <AlertTriangle className="mr-1 h-3 w-3" /> Time&apos;s up
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {booking.customer_name} · {booking.players}p · {booking.gaming_stations?.station_name ?? 'Unassigned'} ·{' '}
            {booking.games?.title ?? 'No game preference'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {session?.status === 'active' && (
            <div className="flex items-center gap-1.5 font-mono text-lg font-bold">
              <Clock className={`h-4 w-4 ${isExpired ? 'text-destructive' : isWarning ? 'text-gold-400' : 'text-neon-400'}`} />
              {formatCountdown(remainingMs)}
            </div>
          )}

          <div className="flex gap-2">
            {(!session || session.status === 'not_started') && (
              <Button size="sm" variant="gold" disabled={loading} onClick={() => callAction('/api/admin/sessions/start', { sessionId: session?.id })}>
                <Play className="h-4 w-4" /> Start
              </Button>
            )}
            {session?.status === 'active' && (
              <Button size="sm" variant="outline" disabled={loading} onClick={() => callAction('/api/admin/sessions/pause', { sessionId: session.id })}>
                <Pause className="h-4 w-4" /> Pause
              </Button>
            )}
            {session?.status === 'paused' && (
              <Button size="sm" variant="gold" disabled={loading} onClick={() => callAction('/api/admin/sessions/resume', { sessionId: session.id })}>
                <Play className="h-4 w-4" /> Resume
              </Button>
            )}
            {(session?.status === 'active' || session?.status === 'paused') && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => callAction('/api/admin/sessions/extend', { sessionId: session.id, additionalMinutes: 30 })}
                >
                  +30 min
                </Button>

                <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <ArrowRightLeft className="h-4 w-4" /> Move
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Move session</DialogTitle>
                    <DialogDescription>Select a free station to move this session to.</DialogDescription>
                    <div className="mt-4 space-y-4">
                      <Select value={selectedStation} onValueChange={setSelectedStation}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a station" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStations.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.station_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="gold"
                        className="w-full"
                        disabled={!selectedStation || loading}
                        onClick={async () => {
                          const ok = await callAction('/api/admin/sessions/move', {
                            sessionId: session.id,
                            newStationId: selectedStation,
                          });
                          if (ok) setMoveOpen(false);
                        }}
                      >
                        Confirm Move
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="destructive"
                  disabled={loading}
                  onClick={() => callAction('/api/admin/sessions/end', { sessionId: session.id })}
                >
                  <Square className="h-4 w-4" /> End
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
