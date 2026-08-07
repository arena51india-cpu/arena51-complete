import { AdminPageHeader } from '@/components/admin/page-header';
import { WalkinBookingDialog } from '@/components/admin/walkin-booking-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllBookingsAdmin } from '@/lib/data/admin';
import { getPricingPlans, getGames } from '@/lib/data/public';
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

export default async function AdminBookingsPage() {
  const [bookings, plans, games] = await Promise.all([getAllBookingsAdmin(150), getPricingPlans(), getGames()]);

  return (
    <div>
      <AdminPageHeader
        title="Bookings & Walk-ins"
        description="All bookings across online, walk-in, and admin sources."
        action={<WalkinBookingDialog plans={plans} games={games} />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Reference</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date / Time</th>
              <th className="p-4">Station</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map((b: any) => (
              <tr key={b.id}>
                <td className="p-4 font-mono text-gold-300">{b.booking_reference}</td>
                <td className="p-4">
                  {b.customer_name}
                  <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
                </td>
                <td className="p-4 text-muted-foreground">
                  {b.booking_date} · {b.start_time?.slice(0, 5)}
                </td>
                <td className="p-4 text-muted-foreground">{b.gaming_stations?.station_name ?? '—'}</td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize">
                    {b.source.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant={STATUS_VARIANT[b.status] ?? 'outline'} className="capitalize">
                    {b.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-4 text-right font-mono">{formatCurrencyINR(b.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
