import { AdminPageHeader } from '@/components/admin/page-header';
import { MembershipFormDialog } from '@/components/admin/membership-form-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllMembershipsAdmin } from '@/lib/data/admin';
import { formatCurrencyINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminMembershipsPage() {
  const memberships = await getAllMembershipsAdmin();

  return (
    <div>
      <AdminPageHeader title="Memberships" description="Edit Silver, Gold, and Platinum plan benefits." />

      <div className="grid gap-6 md:grid-cols-3">
        {memberships.map((m: any) => (
          <Card key={m.id} className="p-6">
            <div className="flex items-center justify-between">
              <Badge variant="gold" className="capitalize">{m.tier}</Badge>
              {!m.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
            <p className="mt-3 font-display text-lg font-semibold">{m.display_name}</p>
            <p className="mt-1 font-mono text-2xl font-bold text-gold-300">{formatCurrencyINR(m.price)}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li>{m.discount_percent}% off bookings</li>
              <li>{m.free_hours} free hours / {m.duration_days} days</li>
              <li>{m.reward_multiplier}x loyalty points</li>
              {m.priority_booking && <li>Priority booking</li>}
              {m.birthday_benefit_text && <li>{m.birthday_benefit_text}</li>}
            </ul>
            <div className="mt-6">
              <MembershipFormDialog membership={m} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
