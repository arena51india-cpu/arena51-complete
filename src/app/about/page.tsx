import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Container, SectionHeading } from '@/components/shared/section-heading';
import { Gamepad2, Users, Trophy, Clock } from 'lucide-react';

const STATS = [
  { icon: Gamepad2, label: 'Gaming Stations', value: 'PS5 · PC · VR' },
  { icon: Users, label: 'Max Party Size', value: '4 Players' },
  { icon: Trophy, label: 'Titles in Library', value: '13+ Games' },
  { icon: Clock, label: 'Session Lengths', value: '30 min – 4 hrs' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-40 pb-24">
        <Container className="max-w-4xl">
          <SectionHeading
            eyebrow="Our story"
            title="Built by Players, for Players"
            description="Arena 51 started with a simple frustration: booking a console at most gaming cafés meant guessing which machine was free and hoping it wasn't slow. We built the opposite — a lounge where the system finds you the best available station, so you spend your time playing, not waiting."
          />

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center">
                <stat.icon className="mx-auto mb-3 h-6 w-6 text-gold-400" />
                <p className="font-mono text-sm font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 space-y-8">
            <div>
              <h3 className="mb-2 font-display text-xl font-semibold text-gold-300">What we run</h3>
              <p className="text-muted-foreground">
                Every station is a real PS5 rig with proper controllers, not a shared machine
                split across ten people. Our library covers competitive multiplayer titles
                like EA SPORTS FC 26 and Call of Duty, plus single-player epics like Ghost of
                Tsushima and God of War Ragnarök — updated as new releases drop.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-display text-xl font-semibold text-gold-300">
                How booking works
              </h3>
              <p className="text-muted-foreground">
                You never pick a console by number. Tell us your party size, when you want to
                play, and for how long — our system assigns the best available station
                automatically. Have a favorite game in mind? Mention it as a preference; we'll
                do our best to match it, but any available title is yours to play when you
                arrive.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-display text-xl font-semibold text-gold-300">Memberships</h3>
              <p className="text-muted-foreground">
                Regulars save with Silver, Gold, or Platinum membership — discounts on every
                booking, free monthly hours, and a birthday session on the house.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
