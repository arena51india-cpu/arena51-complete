import { AdminPageHeader } from '@/components/admin/page-header';
import { PromoCodeFormDialog } from '@/components/admin/promo-code-form-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllPromoCodesAdmin } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminPromoCodesPage() {
  const promos = await getAllPromoCodesAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Promo Codes"
        description="Create, edit, disable, or delete promo codes."
        action={<PromoCodeFormDialog />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Uses</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {promos.map((p: any) => (
              <tr key={p.id}>
                <td className="p-4 font-mono text-gold-300">{p.code}</td>
                <td className="p-4">{p.discount_type === 'percentage' ? `${p.discount_value}%` : `₹${p.discount_value}`}</td>
                <td className="p-4 text-muted-foreground">{p.used_count} / {p.max_uses ?? '∞'}</td>
                <td className="p-4 text-muted-foreground">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('en-IN') : 'No expiry'}</td>
                <td className="p-4"><InlineToggle table="promo_codes" id={p.id} field="is_active" initialValue={p.is_active} /></td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <PromoCodeFormDialog promo={p} />
                    <DeleteRowButton table="promo_codes" id={p.id} label={p.code} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
