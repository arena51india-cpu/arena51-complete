'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GameCard } from '@/components/home/game-card';
import type { Game } from '@/lib/types/database.types';

const FILTERS = [
  { value: 'all', label: 'All Games' },
  { value: 'multiplayer', label: 'Multiplayer' },
  { value: 'single_player', label: 'Single Player' },
] as const;

export function GameLibraryGrid({ games }: { games: Game[] }) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]['value']>('all');

  const filtered = filter === 'all' ? games : games.filter((g) => g.category === filter);

  return (
    <div>
      <div className="mb-10 flex justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              filter === f.value
                ? 'border-primary/40 bg-primary/15 text-gold-300'
                : 'border-white/15 text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No games in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
