'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Profile } from '@/lib/types/database.types';

const QUICK_AMOUNTS = [200, 500, 1000, 2000];

export function WalletTopupForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [amount, setAmount] = React.useState<number>(500);
  const [loading, setLoading] = React.useState(false);

  async function handleTopup() {
    setLoading(true);
    try {
      const orderRes = await fetch('/api/payments/razorpay/wallet-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
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
        description: 'Wallet top-up',
        prefill: { name: profile?.full_name ?? undefined, email: profile?.email ?? undefined, contact: profile?.phone ?? undefined },
        theme: { color: '#dcae32' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/razorpay/wallet-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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

          toast.success(`₹${amount} added to your wallet.`);
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-lg border px-4 py-2 text-sm font-mono transition-colors ${
              amount === a ? 'border-primary/50 bg-primary/15 text-gold-300' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            ₹{a}
          </button>
        ))}
      </div>
      <div>
        <Label htmlFor="customAmount">Or enter a custom amount</Label>
        <Input
          id="customAmount"
          type="number"
          min={100}
          max={50000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <Button variant="gold" className="w-full" onClick={handleTopup} disabled={loading || amount < 100}>
        {loading ? 'Processing…' : `Add ₹${amount} to Wallet`}
      </Button>
    </div>
  );
}
