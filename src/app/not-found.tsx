import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/section-heading';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Container className="flex flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30">
          <Gamepad2 className="h-8 w-8 text-gold-400" />
        </div>
        <h1 className="font-display text-6xl font-bold text-gradient-gold">404</h1>
        <p className="mt-4 max-w-sm text-muted-foreground">
          This station is offline. The page you're looking for doesn't exist or has moved.
        </p>
        <Button asChild variant="gold" className="mt-8">
          <Link href="/">Back to Home</Link>
        </Button>
      </Container>
    </main>
  );
}
