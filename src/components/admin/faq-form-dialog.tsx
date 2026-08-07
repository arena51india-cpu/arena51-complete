'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export function FaqFormDialog({ faq }: { faq?: Faq }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [question, setQuestion] = React.useState(faq?.question ?? '');
  const [answer, setAnswer] = React.useState(faq?.answer ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = faq
      ? await supabase.from('faqs').update({ question, answer }).eq('id', faq.id)
      : await supabase.from('faqs').insert({ question, answer });

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('FAQ saved.');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {faq ? <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button> : <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add FAQ</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{faq ? 'Edit FAQ' : 'Add an FAQ'}</DialogTitle>
        <DialogDescription>Shown on the homepage FAQ section.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Save FAQ'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
