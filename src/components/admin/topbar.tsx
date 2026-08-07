import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AdminTopbar({ name, role }: { name: string; role: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="flex h-[4.5rem] items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
            <Gamepad2 className="h-4 w-4 text-gold-400" />
          </div>
          <span className="font-display text-base font-bold tracking-wider">
            ARENA 51 <span className="text-gradient-gold">Admin</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="neon" className="capitalize">
            {role}
          </Badge>
          <span className="text-sm font-medium">{name}</span>
        </div>
      </div>
    </header>
  );
}
