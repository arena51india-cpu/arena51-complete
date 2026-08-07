import { AdminPageHeader } from '@/components/admin/page-header';
import { PricingPlanFormDialog } from '@/components/admin/pricing-plan-form-dialog';
import { PricingRuleFormDialog } from '@/components/admin/pricing-rule-form-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { Card } from '@/components/ui/card';
import { getAllPricingPlansAdmin, getAllPricingRulesAdmin } from '@/lib/data/admin';
import { formatCurrencyINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage() {
  const [plans, rules] = await Promise.all([getAllPricingPlansAdmin(), getAllPricingRulesAdmin()]);

  return (
    <div>
      <AdminPageHeader
        title="Pricing"
        description="Edit prices, add new plans, and manage weekend/festival surcharges."
        action={<PricingPlanFormDialog />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Plan</th>
              <th className="p-4">Players</th>
              <th className="p-4">Per hour</th>
              <th className="p-4">Extra 30 min</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {plans.map((p: any) => (
              <tr key={p.id}>
                <td className="p-4 font-medium">{p.plan_name}</td>
                <td className="p-4 text-muted-foreground">{p.players} ({p.controllers} ctrl)</td>
                <td className="p-4 font-mono text-gold-300">{formatCurrencyINR(p.base_price_per_hour)}</td>
                <td className="p-4 font-mono">{formatCurrencyINR(p.extra_30_min_price)}</td>
                <td className="p-4"><InlineToggle table="pricing_plans" id={p.id} field="is_active" initialValue={p.is_active} /></td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <PricingPlanFormDialog plan={p} />
                    <DeleteRowButton table="pricing_plans" id={p.id} label={p.plan_name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Weekend & Festival Surcharges</h2>
        <PricingRuleFormDialog />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Multiplier</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rules.map((r: any) => (
              <tr key={r.id}>
                <td className="p-4">{r.name}</td>
                <td className="p-4 capitalize text-muted-foreground">{r.rule_type}</td>
                <td className="p-4 font-mono">{r.multiplier}x</td>
                <td className="p-4"><InlineToggle table="pricing_rules" id={r.id} field="is_active" initialValue={r.is_active} /></td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <PricingRuleFormDialog rule={r} />
                    <DeleteRowButton table="pricing_rules" id={r.id} label={r.name} />
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
