'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Radio,
  Gamepad2,
  Tag,
  Gem,
  Ticket,
  Megaphone,
  Image as ImageIcon,
  HelpCircle,
  Settings,
  Users,
  UserCog,
  LogOut,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin', label: 'Analytics', icon: LayoutDashboard, roles: ['owner', 'manager', 'reception'] },
  { href: '/admin/sessions', label: 'Live Sessions', icon: Radio, roles: ['owner', 'manager', 'reception'] },
  { href: '/admin/bookings', label: 'Bookings & Walk-ins', icon: CalendarCheck, roles: ['owner', 'manager', 'reception'] },
  { href: '/admin/stations', label: 'Gaming Stations', icon: Gamepad2, roles: ['owner', 'manager'] },
  { href: '/admin/games', label: 'Game Library', icon: Gamepad2, roles: ['owner', 'manager'] },
  { href: '/admin/pricing', label: 'Pricing', icon: Tag, roles: ['owner', 'manager'] },
  { href: '/admin/memberships', label: 'Memberships', icon: Gem, roles: ['owner', 'manager'] },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Ticket, roles: ['owner', 'manager'] },
  { href: '/admin/offers', label: 'Offers', icon: Megaphone, roles: ['owner', 'manager'] },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon, roles: ['owner', 'manager'] },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle, roles: ['owner', 'manager'] },
  { href: '/admin/cms', label: 'Website CMS', icon: Settings, roles: ['owner', 'manager'] },
  { href: '/admin/customers', label: 'Customers (CRM)', icon: Users, roles: ['owner', 'manager', 'reception'] },
  { href: '/admin/messages', label: 'Messages', icon: Mail, roles: ['owner', 'manager'] },
  { href: '/admin/employees', label: 'Employees', icon: UserCog, roles: ['owner', 'manager'] },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck, roles: ['owner', 'manager'] },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const visibleLinks = LINKS.filter((l) => l.roles.includes(role));

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block">
      <div className="sticky top-[4.5rem] flex h-[calc(100vh-4.5rem)] flex-col justify-between overflow-y-auto p-4">
        <nav className="space-y-1">
          {visibleLinks.map((link) => {
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
