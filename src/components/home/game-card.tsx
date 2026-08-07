import Image from 'next/image';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Game } from '@/lib/types/database.types';

export function GameCard({ game }: { game: Game }) {
  return (
    <div className="group glass-card overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {game.cover_image_url ? (
          <Image
            src={game.cover_image_url}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] text-4xl font-display font-bold text-white/10">
            {game.title.slice(0, 2).toUpperCase()}
          </div>
        )}
        {game.is_featured && (
          <Badge variant="gold" className="absolute left-3 top-3">
            Featured
          </Badge>
        )}
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-display text-base font-semibold">{game.title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant={game.category === 'multiplayer' ? 'neon' : 'outline'}>
            {game.category === 'multiplayer' ? 'Multiplayer' : 'Single Player'}
          </Badge>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {game.min_players === game.max_players
              ? `${game.max_players}`
              : `${game.min_players}-${game.max_players}`}{' '}
            player{game.max_players > 1 ? 's' : ''}
          </span>
        </div>
        {game.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{game.description}</p>
        )}
      </div>
    </div>
  );
}
