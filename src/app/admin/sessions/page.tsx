import { AdminPageHeader } from '@/components/admin/page-header';
import { SessionCard } from '@/components/admin/session-card';
import { Card } from '@/components/ui/card';
import { getTodaySessions, getAllStations } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveSessionsPage() {
  const [bookings, stations] = await Promise.all([getTodaySessions(), getAllStations()]);
  const availableStations = stations.filter((s: any) => s.status === 'available' && s.is_active);

  return (
    <div>
      <AdminPageHeader title="Live Sessions" description="Today's confirmed bookings and in-progress sessions." />

      {bookings.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No sessions scheduled for today yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <SessionCard key={booking.id} booking={booking} availableStations={availableStations} />
          ))}
        </div>
      )}
    </div>
  );
}
