import { AdminPageHeader } from '@/components/admin/page-header';
import { OfferFormDialog } from '@/components/admin/offer-form-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllOffersAdmin } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  const offers = await getAllOffersAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Offers"
        description="Homepage banners, festival deals, weekend specials, flash sales, and combos."
        action={<OfferFormDialog />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Window</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {offers.map((o: any) => (
              <tr key={o.id}>
                <td className="p-4 font-medium">{o.title}</td>
                <td className="p-4"><Badge variant="neon" className="capitalize">{o.offer_type.replace('_', ' ')}</Badge></td>
                <td className="p-4 text-xs text-muted-foreground">
                  {o.starts_at ? new Date(o.starts_at).toLocaleDateString('en-IN') : 'Always'} –{' '}
                  {o.ends_at ? new Date(o.ends_at).toLocaleDateString('en-IN') : 'Ongoing'}
                </td>
                <td className="p-4"><InlineToggle table="offers" id={o.id} field="is_active" initialValue={o.is_active} /></td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <OfferFormDialog offer={o} />
                    <DeleteRowButton table="offers" id={o.id} label={o.title} />
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
