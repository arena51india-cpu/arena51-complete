import { cn } from '@/lib/utils';

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('mx-auto w-full max-w-7xl px-6 lg:px-8', className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cn('mb-12', align === 'center' ? 'text-center mx-auto max-w-2xl' : 'text-left', className)}>
      {eyebrow && (
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-display font-bold sm:text-4xl">
        <span className="text-gradient-gold">{title}</span>
      </h2>
      {description && <p className="mt-4 text-muted-foreground">{description}</p>}
    </div>
  );
}
