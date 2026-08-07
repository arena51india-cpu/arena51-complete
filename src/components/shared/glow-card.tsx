import { cn } from '@/lib/utils';

/**
 * The signature visual element for Arena 51: a rotating conic-gradient
 * traced along the card's border, styled after RGB gaming-PC case
 * lighting. Reserve this for ONE featured item per section (hero CTA,
 * the recommended pricing plan, the recommended membership tier) —
 * never apply it to every card, or it stops reading as a highlight.
 */
export function GlowCard({
  className,
  children,
  active = true,
}: {
  className?: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div className={cn('rounded-2xl', active && 'led-underglow', className)}>{children}</div>
  );
}
