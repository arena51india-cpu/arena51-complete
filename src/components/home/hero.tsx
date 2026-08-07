import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/section-heading';
import { GlowCard } from '@/components/shared/glow-card';

interface HeroContent {
  heading?: string;
  subheading?: string;
  cta_text?: string;
}

export function Hero({ content }: { content: HeroContent | null }) {
  const heading = content?.heading || 'Level Up Your Game Night';
  const subheading =
    content?.subheading ||
    'Premium PS5, Gaming PC & VR stations. Pick your slot, pick your duration — we handle the rest.';
  const ctaText = content?.cta_text || 'Book Now';

  return (
    <section className="relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-32">
      {/* Ambient RGB glow — signature palette, restrained to background only */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-1/4 top-40 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-secondary/15 blur-[120px]" />
        <div className="absolute left-1/2 bottom-0 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-rgb-purple/10 blur-[120px]" />
      </div>

      <Container className="flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-neon-300">
          <Zap className="h-3.5 w-3.5" />
          Live station availability, updated in real time
        </div>

        <h1 className="max-w-4xl text-4xl font-display font-bold leading-tight sm:text-6xl">
          <span className="text-gradient-gold">{heading}</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{subheading}</p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <GlowCard className="rounded-lg">
            <Button asChild size="lg" variant="gold" className="rounded-lg">
              <Link href="/book-now">
                {ctaText} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </GlowCard>
          <Button asChild size="lg" variant="outline">
            <Link href="/games">Browse Game Library</Link>
          </Button>
        </div>

        <p className="mt-6 max-w-md text-xs text-muted-foreground">
          No need to pick a console — tell us your preferred game (optional) and Arena 51
          auto-assigns the best available station when you arrive.
        </p>
      </Container>
    </section>
  );
}
