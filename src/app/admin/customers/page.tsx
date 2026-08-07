import { AdminPageHeader } from '@/components/admin/page-header';
import { CustomerDetailDialog } from '@/components/admin/customer-detail-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllCustomers } from '@/lib/data/admin';
import { formatCurrencyINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div>
      <AdminPageHeader title="Customers (CRM)" description="Every customer profile — visits, spend, loyalty, and membership." />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Customer</th>
              <th className="p-4">Visits</th>
              <th className="p-4">Hours</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Loyalty</th>
              <th className="p-4">Membership</th>
              <th className="p-4">Last visit</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((c: any) => (
              <tr key={c.id}>
                <td className="p-4">
                  {c.full_name}
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </td>
                <td className="p-4">{c.visit_count}</td>
                <td className="p-4">{c.total_hours_played}h</td>
                <td className="p-4 font-mono text-gold-300">{formatCurrencyINR(c.total_money_spent)}</td>
                <td className="p-4">{c.loyalty_points}</td>
                <td className="p-4">{c.membership_id ? <Badge variant="gold">Member</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-4 text-muted-foreground">
                  {c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('en-IN') : 'Never'}
                </td>
                <td className="p-4 text-right">
                  <CustomerDetailDialog customer={c} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
