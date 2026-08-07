import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepProgress({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="mb-10 flex items-center">
      {steps.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                i < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : i === currentStep
                    ? 'border-primary text-gold-300'
                    : 'border-white/15 text-muted-foreground'
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'hidden text-[11px] sm:block',
                i === currentStep ? 'text-gold-300' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('mx-2 h-px flex-1', i < currentStep ? 'bg-primary/60' : 'bg-white/10')} />
          )}
        </div>
      ))}
    </div>
  );
}
