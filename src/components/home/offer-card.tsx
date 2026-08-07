import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Offer } from '@/lib/types/database.types';

const TYPE_LABELS: Record<string, string> = {
  homepage_banner: 'Special',
  festival: 'Festival',
  weekend: 'Weekend',
  flash_sale: 'Flash Sale',
  student: 'Student',
  combo: 'Combo',
};

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="group glass-card relative overflow-hidden p-0">
      <div className="relative aspect-[16/9] w-full bg-muted">
        {offer.image_url ? (
          <Image
            src={offer.image_url}
            alt={offer.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-rgb-purple/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <Badge variant="neon" className="absolute left-4 top-4">
          {TYPE_LABELS[offer.offer_type] ?? 'Offer'}
        </Badge>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-lg font-semibold">{offer.title}</h3>
          {offer.subtitle && <p className="mt-1 text-sm text-muted-foreground">{offer.subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
