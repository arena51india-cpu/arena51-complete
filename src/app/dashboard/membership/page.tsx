import Script from 'next/script';
import { Crown, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MembershipPurchaseButton } from '@/components/dashboard/membership-purchase-button';
import { getCurrentProfile, getMyMembershipSubscription, getAllMemberships } from '@/lib/data/customer';

export const dynamic = 'force-dynamic';

export default async function DashboardMembershipPage() {
  const [profile, subscription, memberships] = await Promise.all([
    getCurrentProfile(),
    getMyMembershipSubscription(),
    getAllMemberships(),
  ]);

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <h1 className="font-display text-2xl font-bold">Membership</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your plan and see your benefits.</p>

      {subscription ? (
        <Card className="mt-6 flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
            <Crown className="h-6 w-6 text-gold-400" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{(subscription as any).memberships?.display_name}</p>
            <p className="text-xs text-muted-foreground">
              Active until {new Date((subscription as any).expires_at).toLocaleDateString('en-IN')}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-6 text-sm text-muted-foreground">
          You don&apos;t have an active membership yet — subscribe below to start saving.
        </Card>
      )}

      <h2 className="mb-4 mt-8 font-display text-lg font-semibold">Plans</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {memberships.map((m) => (
          <Card key={m.id} className="flex flex-col p-6">
            <Badge variant="gold" className="w-fit">
              {m.tier}
            </Badge>
            <p className="mt-3 font-display text-lg font-semibold">{m.display_name}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-gold-300">₹{m.price}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-neon-400" /> {m.discount_percent}% off bookings
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-neon-400" /> {m.free_hours} free hours/month
              </li>
              {m.priority_booking && (
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neon-400" /> Priority booking
                </li>
              )}
            </ul>
            <div className="mt-6">
              <MembershipPurchaseButton membership={m} profile={profile} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
