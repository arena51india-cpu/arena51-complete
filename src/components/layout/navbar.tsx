'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/section-heading';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/games', label: 'Games' },
  { href: '/membership', label: 'Membership' },
  { href: '/offers', label: 'Offers' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-white/10 bg-background/80 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <Container className="flex h-[4.5rem] items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
            <Gamepad2 className="h-5 w-5 text-gold-400" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider">
            ARENA <span className="text-gradient-gold">51</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold-300',
                pathname === link.href ? 'text-gold-300' : 'text-foreground/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <Link href="/book-now">Book Now</Link>
          </Button>
        </div>

        <button
          className="rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-white/10 bg-background/95 backdrop-blur-xl lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium',
                  pathname === link.href ? 'text-gold-300 bg-white/[0.04]' : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="gold" size="sm" className="flex-1">
                <Link href="/book-now">Book Now</Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
