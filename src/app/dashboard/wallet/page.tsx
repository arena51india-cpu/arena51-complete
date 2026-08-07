import Script from 'next/script';
import { Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletTopupForm } from '@/components/dashboard/wallet-topup-form';
import { getCurrentProfile, getMyTransactions } from '@/lib/data/customer';
import { formatCurrencyINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  booking_payment: 'Booking payment',
  refund: 'Refund',
  wallet_topup: 'Wallet top-up',
  wallet_debit: 'Wallet debit',
  membership_purchase: 'Membership purchase',
  loyalty_redeem: 'Loyalty redemption',
};

const STATUS_VARIANT: Record<string, 'gold' | 'neon' | 'outline'> = {
  paid: 'neon',
  pending: 'outline',
  partial: 'gold',
  refunded: 'outline',
  failed: 'outline',
};

export default async function WalletPage() {
  const [profile, transactions] = await Promise.all([getCurrentProfile(), getMyTransactions()]);

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <h1 className="font-display text-2xl font-bold">Wallet</h1>
      <p className="mt-1 text-sm text-muted-foreground">Top up your wallet for faster checkout at the lounge.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-start gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
              <Wallet className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="font-mono text-3xl font-bold text-gradient-gold">
                {formatCurrencyINR(profile?.wallet_balance ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">available balance</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-display font-semibold">Add Funds</h3>
          <WalletTopupForm profile={profile} />
        </Card>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Transaction History</h2>
      {transactions.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No transactions yet.</Card>
      ) : (
        <Card className="divide-y divide-white/10 p-0">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p>{TYPE_LABELS[tx.type] ?? tx.type}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[tx.status] ?? 'outline'}>{tx.status}</Badge>
                <span className="font-mono font-semibold">{formatCurrencyINR(tx.amount)}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
