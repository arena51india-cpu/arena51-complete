import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { GameLibraryGrid } from '@/components/home/game-library-grid';
import { getGames } from '@/lib/data/public';

export const revalidate = 60;

export default async function GamesPage() {
  const games = await getGames();

  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container>
          <SectionHeading
            eyebrow="Game library"
            title="Every Game, One Membership"
            description="Multiplayer showdowns or single-player epics — pick a favorite as a preference, or decide when you arrive."
          />
          <GameLibraryGrid games={games} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
