import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getCurrentProfile, getMyLoyaltyLedger } from '@/lib/data/customer';

export const dynamic = 'force-dynamic';

export default async function LoyaltyPage() {
  const [profile, ledger] = await Promise.all([getCurrentProfile(), getMyLoyaltyLedger()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Loyalty Points</h1>
      <p className="mt-1 text-sm text-muted-foreground">Earn points on every booking — redeem them for future sessions.</p>

      <Card className="mt-6 flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
          <Trophy className="h-6 w-6 text-gold-400" />
        </div>
        <div>
          <p className="font-mono text-3xl font-bold text-gradient-gold">{profile?.loyalty_points ?? 0}</p>
          <p className="text-xs text-muted-foreground">points available</p>
        </div>
      </Card>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">History</h2>
      {ledger.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No loyalty activity yet.</Card>
      ) : (
        <Card className="divide-y divide-white/10 p-0">
          {ledger.map((entry: any) => (
            <div key={entry.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p>{entry.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
              <span className={`font-mono font-semibold ${entry.points > 0 ? 'text-neon-400' : 'text-destructive'}`}>
                {entry.points > 0 ? '+' : ''}
                {entry.points}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
