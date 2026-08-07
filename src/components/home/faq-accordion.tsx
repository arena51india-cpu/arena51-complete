import { Plus } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02]">
      {faqs.map((faq) => (
        <details key={faq.id} className="group p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-medium">
            {faq.question}
            <Plus className="h-4 w-4 shrink-0 text-gold-400 transition-transform group-open:rotate-45" />
          </summary>
          <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
