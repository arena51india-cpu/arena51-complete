'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { MIN_ADVANCE_AMOUNT } from '@/lib/pricing/calculator';

export function SecureBookingCard({
  bookingId,
  totalAmount,
  customerName,
  customerEmail,
  customerPhone,
}: {
  bookingId: string;
  totalAmount: number;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = React.useState(Math.min(MIN_ADVANCE_AMOUNT, totalAmount));
  const [loading, setLoading] = React.useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount }),
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
        description: 'Secure your booking',
        prefill: { name: customerName, email: customerEmail ?? undefined, contact: customerPhone },
        theme: { color: '#dcae32' },
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId,
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

          toast.success('Booking secured!');
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
    <Card className="border-primary/30 p-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex gap-2 text-xs text-gold-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        This slot isn't locked yet — another customer who pays can still take it. Pay any
        amount now to secure it.
      </div>
      <div className="mt-4 flex items-end gap-3">
        <div>
          <Label htmlFor="secureAmount">Amount to pay</Label>
          <Input
            id="secureAmount"
            type="number"
            min={MIN_ADVANCE_AMOUNT}
            max={totalAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-32 font-mono"
          />
        </div>
        <Button variant="gold" onClick={handlePay} disabled={loading || amount < MIN_ADVANCE_AMOUNT}>
          {loading ? 'Processing…' : `Pay ₹${amount} & Secure`}
        </Button>
      </div>
    </Card>
  );
}
