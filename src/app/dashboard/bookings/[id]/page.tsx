import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingActions } from '@/components/dashboard/booking-actions';
import { InvoiceCard } from '@/components/dashboard/invoice-card';
import { ReviewForm } from '@/components/dashboard/review-form';
import { SecureBookingCard } from '@/components/dashboard/secure-booking-card';
import { getMyBookingById, getMyReviewForBooking, getCurrentProfile } from '@/lib/data/customer';

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

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [booking, review, profile] = await Promise.all([
    getMyBookingById(id),
    getMyReviewForBooking(id),
    getCurrentProfile(),
  ]);

  if (!booking) notFound();

  const canManage = ['pending_payment', 'confirmed'].includes((booking as any).status);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg text-gold-300">{(booking as any).booking_reference}</h1>
          <Badge variant={STATUS_VARIANT[(booking as any).status] ?? 'outline'} className="mt-1">
            {(booking as any).status.replace('_', ' ')}
          </Badge>
        </div>
        {canManage && (
          <BookingActions
            bookingId={(booking as any).id}
            bookingDate={(booking as any).booking_date}
            startTime={(booking as any).start_time}
          />
        )}
      </div>

      <Card className="mb-6 grid grid-cols-2 gap-4 p-6 text-sm">
        <Info label="Station" value={(booking as any).gaming_stations?.station_name ?? 'To be assigned'} />
        <Info label="Preferred game" value={(booking as any).games?.title ?? 'No preference'} />
        <Info label="Players" value={String((booking as any).players)} />
        <Info label="Source" value={(booking as any).source} />
      </Card>

      {(booking as any).status === 'pending_payment' && (
        <div className="mb-6">
          <SecureBookingCard
            bookingId={(booking as any).id}
            totalAmount={(booking as any).total_amount}
            customerName={(booking as any).customer_name}
            customerEmail={(booking as any).customer_email}
            customerPhone={(booking as any).customer_phone}
          />
        </div>
      )}

      <InvoiceCard booking={booking as any} />

      {(booking as any).status === 'completed' && profile && (
        <Card className="mt-6 p-6">
          <h3 className="mb-3 font-display font-semibold">
            {review ? 'Your Review' : 'Leave a Review'}
          </h3>
          {review ? (
            <p className="text-sm text-muted-foreground">
              You rated this session {(review as any).rating}/5
              {(review as any).comment ? ` — "${(review as any).comment}"` : ''}
            </p>
          ) : (
            <ReviewForm bookingId={(booking as any).id} profileId={profile.id} />
          )}
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
