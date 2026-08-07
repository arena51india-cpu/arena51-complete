import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
  {
    variants: {
      variant: {
        gold: 'bg-primary/15 text-gold-300 border border-primary/30',
        neon: 'bg-secondary/15 text-neon-300 border border-secondary/30',
        outline: 'border border-white/20 text-muted-foreground',
        purple: 'bg-rgb-purple/15 text-purple-300 border border-rgb-purple/30',
      },
    },
    defaultVariants: { variant: 'gold' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
