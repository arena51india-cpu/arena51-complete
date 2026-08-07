import { Instagram } from 'lucide-react';

export function InstagramFeed({ handle }: { handle?: string }) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 border border-primary/30">
        <Instagram className="h-6 w-6 text-gold-400" />
      </div>
      <p className="text-sm text-muted-foreground">
        Follow {handle || 'Arena 51'} on Instagram for live station availability, giveaways, and
        highlight reels from the lounge.
      </p>
      <a
        href="#"
        className="text-sm font-semibold text-gold-300 hover:underline"
      >
        @{handle || 'arena51gaming'}
      </a>
    </div>
  );
}
