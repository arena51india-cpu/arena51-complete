'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { Game } from '@/lib/types/database.types';

export function FavouriteGameSelector({
  games,
  currentFavouriteId,
  profileId,
}: {
  games: Game[];
  currentFavouriteId: string | null;
  profileId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = React.useState(false);

  async function handleChange(gameId: string) {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ favourite_game_id: gameId })
      .eq('id', profileId);
    setSaving(false);

    if (error) {
      toast.error('Could not update your favourite game.');
      return;
    }
    toast.success('Favourite game updated.');
    router.refresh();
  }

  return (
    <Select defaultValue={currentFavouriteId ?? undefined} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger className="max-w-xs">
        <SelectValue placeholder="Choose your favourite game" />
      </SelectTrigger>
      <SelectContent>
        {games.map((game) => (
          <SelectItem key={game.id} value={game.id}>
            {game.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
