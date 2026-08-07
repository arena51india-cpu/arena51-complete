import { AdminPageHeader } from '@/components/admin/page-header';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getContactMessages } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  return (
    <div>
      <AdminPageHeader title="Messages" description="Submissions from the website Contact form." />

      {messages.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No messages yet.</Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m: any) => (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{m.name}</p>
                    {!m.is_read && <Badge variant="neon">New</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {m.email} {m.phone ? `· ${m.phone}` : ''} · {new Date(m.created_at).toLocaleDateString('en-IN')}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{m.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  Read
                  <InlineToggle table="contact_messages" id={m.id} field="is_read" initialValue={m.is_read} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
