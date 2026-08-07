import { AdminPageHeader } from '@/components/admin/page-header';
import { FaqFormDialog } from '@/components/admin/faq-form-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { Card } from '@/components/ui/card';
import { getAllFaqsAdmin } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const faqs = await getAllFaqsAdmin();

  return (
    <div>
      <AdminPageHeader title="FAQs" description="Manage the questions shown on the homepage." action={<FaqFormDialog />} />

      <Card className="divide-y divide-white/10 p-0">
        {faqs.map((f: any) => (
          <div key={f.id} className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="font-medium">{f.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <InlineToggle table="faqs" id={f.id} field="is_active" initialValue={f.is_active} />
              <FaqFormDialog faq={f} />
              <DeleteRowButton table="faqs" id={f.id} label="this FAQ" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
