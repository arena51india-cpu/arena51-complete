import Link from 'next/link';
import { CalendarCheck, Gem, Wallet, Trophy, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentProfile, getMyBookings } from '@/lib/data/customer';
import { formatCurrencyINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_VARIANT: Record<string, 'gold' | 'neon' | 'outline'> = {
  confirmed: 'neon',
  pending_payment: 'outline',
  in_progress: 'gold',
  completed: 'outline',
  cancelled: 'outline',
  no_show: 'outline',
  rescheduled: 'outline',
};

export default async function DashboardOverviewPage() {
  const [profile, bookings] = await Promise.all([getCurrentProfile(), getMyBookings()]);

  const upcoming = bookings.find((b) => ['confirmed', 'pending_payment'].includes(b.status));

  const stats = [
    { icon: Trophy, label: 'Loyalty Points', value: profile?.loyalty_points ?? 0 },
    { icon: Wallet, label: 'Wallet Balance', value: formatCurrencyINR(profile?.wallet_balance ?? 0) },
    { icon: CalendarCheck, label: 'Total Visits', value: profile?.visit_count ?? 0 },
    { icon: Gem, label: 'Hours Played', value: `${profile?.total_hours_played ?? 0}h` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">
        Welcome back, <span className="text-gradient-gold">{profile?.full_name?.split(' ')[0]}</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your account.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <stat.icon className="mb-3 h-5 w-5 text-gold-400" />
            <p className="font-mono text-xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {upcoming ? 'Upcoming Booking' : 'No upcoming bookings'}
        </h2>

        {upcoming ? (
          <Card className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-gold-300">{upcoming.booking_reference}</p>
                <Badge variant={STATUS_VARIANT[upcoming.status] ?? 'outline'}>
                  {upcoming.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {upcoming.booking_date} · {upcoming.start_time} · {upcoming.duration_minutes} min ·{' '}
                {(upcoming as any).gaming_stations?.station_name ?? 'Station to be assigned'}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/dashboard/bookings/${upcoming.id}`}>
                View details <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-sm text-muted-foreground">Book your next session in a few clicks.</p>
            <Button asChild variant="gold">
              <Link href="/book-now">Book Now</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
