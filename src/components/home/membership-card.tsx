import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/shared/glow-card';
import { formatCurrencyINR } from '@/lib/utils';
import type { Membership } from '@/lib/types/database.types';

const TIER_ICONS: Record<string, string> = {
  silver: 'text-neutral-300',
  gold: 'text-gold-400',
  platinum: 'text-neon-300',
};

export function MembershipCard({ membership }: { membership: Membership }) {
  const highlighted = membership.tier === 'gold';

  const perks = [
    `${membership.discount_percent}% off every booking`,
    `${membership.free_hours} free hour${membership.free_hours !== 1 ? 's' : ''} per month`,
    membership.priority_booking ? 'Priority booking slots' : null,
    `${membership.reward_multiplier}x loyalty points`,
    membership.birthday_benefit_text,
  ].filter(Boolean) as string[];

  const card = (
    <div className="glass-card flex h-full flex-col p-6">
      <div className="mb-3 flex items-center gap-2">
        <Crown className={`h-5 w-5 ${TIER_ICONS[membership.tier] ?? 'text-gold-400'}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {membership.tier}
        </span>
      </div>

      <h3 className="font-display text-xl font-semibold">{membership.display_name}</h3>

      <div className="mt-4 flex items-baseline gap-1 font-mono">
        <span className="text-4xl font-bold text-gradient-gold">
          {formatCurrencyINR(membership.price)}
        </span>
        <span className="text-sm text-muted-foreground">/{membership.duration_days} days</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon-400" />
            <span className="text-muted-foreground">{perk}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant={highlighted ? 'gold' : 'outline'} className="mt-6 w-full">
        <Link href={`/membership?tier=${membership.tier}`}>Choose {membership.tier}</Link>
      </Button>
    </div>
  );

  return highlighted ? <GlowCard>{card}</GlowCard> : card;
}
