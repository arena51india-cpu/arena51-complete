import Link from 'next/link';
import { Gamepad2, Instagram, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import { Container } from '@/components/shared/section-heading';

const FOOTER_LINKS = {
  Explore: [
    { href: '/games', label: 'Game Library' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/membership', label: 'Membership' },
    { href: '/offers', label: 'Offers' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
                <Gamepad2 className="h-5 w-5 text-gold-400" />
              </div>
              <span className="font-display text-lg font-bold tracking-wider">
                ARENA <span className="text-gradient-gold">51</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Kolkata&apos;s premium gaming lounge — PS5, gaming PCs, VR & more. Book your
              station in seconds.
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold-400" />
              <span>Address available on our Contact page</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-gold-400" />
              <span>Phone available on our Contact page</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-gold-400" />
              <span>Email available on our Contact page</span>
            </div>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-foreground/80 hover:border-primary/40 hover:text-gold-300"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-foreground/80 hover:border-secondary/40 hover:text-neon-300"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground/90">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="scanline-divider mt-12" />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Arena 51 Gaming Lounge. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
