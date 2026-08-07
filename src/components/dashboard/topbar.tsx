import Link from 'next/link';
import { Gamepad2, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Profile } from '@/lib/types/database.types';

export function DashboardTopbar({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="flex h-[4.5rem] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
            <Gamepad2 className="h-4 w-4 text-gold-400" />
          </div>
          <span className="font-display text-base font-bold tracking-wider">
            ARENA <span className="text-gradient-gold">51</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {profile?.membership_id && (
            <Badge variant="gold" className="hidden sm:inline-flex">
              <Crown className="mr-1 h-3 w-3" /> Member
            </Badge>
          )}
          <span className="text-sm font-medium text-foreground/90">{profile?.full_name}</span>
        </div>
      </div>
    </header>
  );
}
