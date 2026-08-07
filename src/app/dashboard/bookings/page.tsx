import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookingActions } from '@/components/dashboard/booking-actions';
import { getMyBookings } from '@/lib/data/customer';
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

export default async function BookingsPage() {
  const bookings = await getMyBookings();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My Bookings</h1>
        <Button asChild variant="gold" size="sm">
          <Link href="/book-now">New Booking</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t made a booking yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            const canManage = ['pending_payment', 'confirmed'].includes(booking.status);
            return (
              <Card key={booking.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/bookings/${booking.id}`} className="font-mono text-sm text-gold-300 hover:underline">
                        {booking.booking_reference}
                      </Link>
                      <Badge variant={STATUS_VARIANT[booking.status] ?? 'outline'}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                      {booking.status === 'pending_payment' && (
                        <span className="text-xs text-gold-400">Not secured — pay to lock this slot</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {booking.booking_date} · {booking.start_time.slice(0, 5)} · {booking.duration_minutes} min ·{' '}
                      {booking.gaming_stations?.station_name ?? 'Station to be assigned'}
                    </p>
                    <p className="mt-1 font-mono text-sm">{formatCurrencyINR(booking.total_amount)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManage && (
                      <BookingActions
                        bookingId={booking.id}
                        bookingDate={booking.booking_date}
                        startTime={booking.start_time}
                      />
                    )}
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/bookings/${booking.id}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
