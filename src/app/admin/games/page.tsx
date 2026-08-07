import Image from 'next/image';
import { AdminPageHeader } from '@/components/admin/page-header';
import { GameFormDialog } from '@/components/admin/game-form-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllGamesAdmin } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminGamesPage() {
  const games = await getAllGamesAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Game Library"
        description="Add, edit, hide, or remove games in a few clicks."
        action={<GameFormDialog />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Game</th>
              <th className="p-4">Category</th>
              <th className="p-4">Players</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Available</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {games.map((g: any) => (
              <tr key={g.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {g.cover_image_url && <Image src={g.cover_image_url} alt={g.title} fill className="object-cover" />}
                    </div>
                    <span className="font-medium">{g.title}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={g.category === 'multiplayer' ? 'neon' : 'outline'}>
                    {g.category === 'multiplayer' ? 'Multiplayer' : 'Single Player'}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground">{g.min_players}-{g.max_players}</td>
                <td className="p-4">
                  <InlineToggle table="games" id={g.id} field="is_featured" initialValue={g.is_featured} />
                </td>
                <td className="p-4">
                  <InlineToggle table="games" id={g.id} field="is_available" initialValue={g.is_available} />
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <GameFormDialog game={g} />
                    <DeleteRowButton table="games" id={g.id} label={g.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
