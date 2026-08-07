'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Trophy,
  Gem,
  Wallet,
  Heart,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: CalendarCheck },
  { href: '/dashboard/loyalty', label: 'Loyalty Points', icon: Trophy },
  { href: '/dashboard/membership', label: 'Membership', icon: Gem },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/favourites', label: 'Favourite Games', icon: Heart },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block">
      <div className="sticky top-[4.5rem] flex h-[calc(100vh-4.5rem)] flex-col justify-between p-4">
        <nav className="space-y-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary/15 text-gold-300' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/[0.04] hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
