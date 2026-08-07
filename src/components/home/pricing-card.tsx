import Link from 'next/link';
import { Users, Gamepad } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard } from '@/components/shared/glow-card';
import { formatCurrencyINR } from '@/lib/utils';
import type { PricingPlan } from '@/lib/types/database.types';

export function PricingCard({
  plan,
  highlighted = false,
}: {
  plan: PricingPlan;
  highlighted?: boolean;
}) {
  const card = (
    <div
      className={`glass-card flex h-full flex-col p-6 ${highlighted ? 'border-primary/40' : ''}`}
    >
      <div className="mb-4 flex items-center gap-2 text-gold-400">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium text-muted-foreground">
          {plan.players} Player{plan.players > 1 ? 's' : ''}
          {plan.controllers < plan.players ? ` · ${plan.controllers} controller${plan.controllers > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      <h3 className="font-display text-lg font-semibold">{plan.plan_name}</h3>

      <div className="mt-4 flex items-baseline gap-1 font-mono">
        <span className="text-4xl font-bold text-gradient-gold">
          {formatCurrencyINR(plan.base_price_per_hour)}
        </span>
        <span className="text-sm text-muted-foreground">/hour</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground font-mono">
        + {formatCurrencyINR(plan.extra_30_min_price)} per extra 30 minutes
      </p>

      <div className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Gamepad className="h-4 w-4 text-neon-400" />
          Any available PS5, PC, or VR station
        </div>
        <div className="flex items-center gap-2">
          <Gamepad className="h-4 w-4 text-neon-400" />
          Durations from 30 min to 4 hours
        </div>
      </div>

      <Button asChild variant={highlighted ? 'gold' : 'outline'} className="mt-6 w-full">
        <Link href={`/book-now?plan=${plan.slug}`}>Book this setup</Link>
      </Button>
    </div>
  );

  return highlighted ? <GlowCard>{card}</GlowCard> : card;
}
