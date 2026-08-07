'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Membership, Profile } from '@/lib/types/database.types';

export function MembershipPurchaseButton({
  membership,
  profile,
}: {
  membership: Membership;
  profile: Profile | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const isCurrent = profile?.membership_id === membership.id;

  async function handlePurchase() {
    setLoading(true);
    try {
      const orderRes = await fetch('/api/memberships/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: membership.id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Could not start payment.');
        setLoading(false);
        return;
      }

      if (!window.Razorpay) {
        toast.error('Payment is still loading — try again in a moment.');
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: 'Arena 51 Gaming Lounge',
        description: `${membership.display_name} membership`,
        prefill: { name: profile?.full_name ?? undefined, email: profile?.email ?? undefined, contact: profile?.phone ?? undefined },
        theme: { color: '#dcae32' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/memberships/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              membershipId: membership.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            toast.error(verifyData.error || 'Payment verification failed.');
            setLoading(false);
            return;
          }

          toast.success(`${membership.display_name} activated!`);
          setLoading(false);
          router.refresh();
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <Button variant={isCurrent ? 'outline' : 'gold'} className="w-full" onClick={handlePurchase} disabled={loading || isCurrent}>
      {isCurrent ? 'Current Plan' : loading ? 'Processing…' : `Subscribe — ₹${membership.price}`}
    </Button>
  );
}
