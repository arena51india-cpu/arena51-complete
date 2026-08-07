import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAuditLogs, getCurrentStaffProfile } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const profile = await getCurrentStaffProfile();
  if (!profile || !['owner', 'manager'].includes(profile.role)) {
    redirect('/admin');
  }

  const logs = await getAuditLogs();

  return (
    <div>
      <AdminPageHeader title="Audit Logs" description="A record of sensitive actions taken across the admin dashboard." />

      {logs.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No activity recorded yet.</Card>
      ) : (
        <Card className="divide-y divide-white/10 p-0">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{log.action}</Badge>
                  <span className="text-muted-foreground">by {log.profiles?.full_name ?? 'System'}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.entity_type} · {new Date(log.created_at).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
