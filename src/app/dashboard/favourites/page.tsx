import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavouriteGameSelector } from '@/components/dashboard/favourite-game-selector';
import { getCurrentProfile, getMyFavouriteGames } from '@/lib/data/customer';
import { getGames } from '@/lib/data/public';

export const dynamic = 'force-dynamic';

export default async function FavouritesPage() {
  const [profile, favouriteGames, allGames] = await Promise.all([
    getCurrentProfile(),
    getMyFavouriteGames(),
    getGames(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Favourite Games</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set a favourite for quick booking, or see what you've played most.
      </p>

      <Card className="mt-6 p-6">
        <h3 className="mb-3 font-display font-semibold">Your favourite</h3>
        {profile && (
          <FavouriteGameSelector games={allGames} currentFavouriteId={profile.favourite_game_id} profileId={profile.id} />
        )}
      </Card>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">Most Requested (from your bookings)</h2>
      {favouriteGames.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Once you book a session with a preferred game, it'll show up here.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favouriteGames.map(({ game, count }) => (
            <Card key={game.id} className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">{game.title}</p>
                <Badge variant={game.category === 'multiplayer' ? 'neon' : 'outline'}>
                  {count}x booked
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
