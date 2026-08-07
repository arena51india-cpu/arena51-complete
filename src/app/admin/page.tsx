import { TrendingUp, Percent, Gamepad2, Trophy, Ban, UserX, Gem } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/page-header';
import { RevenueTrendChart } from '@/components/admin/charts/revenue-trend-chart';
import { PeakHoursChart } from '@/components/admin/charts/peak-hours-chart';
import { BookingSourceChart } from '@/components/admin/charts/booking-source-chart';
import { getAnalyticsSnapshot } from '@/lib/data/admin';
import { formatCurrencyINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const snapshot = await getAnalyticsSnapshot(30);

  const stats = [
    { icon: TrendingUp, label: "Today's Revenue", value: formatCurrencyINR(snapshot.todayRevenue) },
    { icon: TrendingUp, label: 'Monthly Revenue', value: formatCurrencyINR(snapshot.monthlyRevenue) },
    { icon: Percent, label: 'Occupancy Rate (30d)', value: `${snapshot.occupancyRate}%` },
    { icon: Gem, label: 'Memberships Sold (30d)', value: snapshot.membershipSalesCount },
    { icon: Ban, label: 'Cancellations (30d)', value: snapshot.cancelledCount },
    { icon: UserX, label: 'No-shows (30d)', value: snapshot.noShowCount },
  ];

  return (
    <div>
      <AdminPageHeader title="Analytics" description="Last 30 days at a glance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="mb-2 h-4 w-4 text-gold-400" />
            <p className="font-mono text-lg font-bold">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-display font-semibold">Revenue Trend</h3>
          <div className="h-64">
            <RevenueTrendChart revenueByDay={snapshot.revenueByDay} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 font-display font-semibold">Booking Mix</h3>
          <div className="h-64">
            <BookingSourceChart online={snapshot.onlineCount} walkIn={snapshot.walkInCount} cancelled={snapshot.cancelledCount} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-display font-semibold">Peak Hours</h3>
          <div className="h-56">
            <PeakHoursChart hourBuckets={snapshot.hourBuckets} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display font-semibold">
            <Gamepad2 className="h-4 w-4 text-gold-400" /> Most Played
          </h3>
          {snapshot.topGames.length === 0 ? (
            <p className="text-sm text-muted-foreground">No preferred-game data yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {snapshot.topGames.map((g) => (
                <li key={g.id} className="flex items-center justify-between">
                  <span>{g.title}</span>
                  <span className="font-mono text-gold-300">{g.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display font-semibold">
          <Trophy className="h-4 w-4 text-gold-400" /> Best Customers (30d)
        </h3>
        {snapshot.bestCustomers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No paid bookings yet in this window.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {snapshot.bestCustomers.map((c, i) => (
              <div key={i} className="rounded-lg border border-white/10 p-4">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="mt-1 font-mono text-gold-300">{formatCurrencyINR(c.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
