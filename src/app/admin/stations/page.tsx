import { AdminPageHeader } from '@/components/admin/page-header';
import { StationFormDialog } from '@/components/admin/station-form-dialog';
import { InlineToggle } from '@/components/admin/inline-toggle';
import { DeleteRowButton } from '@/components/admin/delete-row-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllStations } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

const STATUS_VARIANT: Record<string, 'gold' | 'neon' | 'outline'> = {
  available: 'neon',
  occupied: 'gold',
  maintenance: 'outline',
  offline: 'outline',
};

export default async function AdminStationsPage() {
  const stations = await getAllStations();
  const nextStationNumber = Math.max(0, ...stations.map((s: any) => s.station_number)) + 1;

  return (
    <div>
      <AdminPageHeader
        title="Gaming Stations"
        description="Add, edit, or disable stations — the booking engine picks up changes instantly, no code required."
        action={<StationFormDialog nextStationNumber={nextStationNumber} />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Station</th>
              <th className="p-4">Device</th>
              <th className="p-4">Status</th>
              <th className="p-4">Controllers</th>
              <th className="p-4">Max players</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stations.map((s: any) => (
              <tr key={s.id}>
                <td className="p-4 font-medium">#{s.station_number} — {s.station_name}</td>
                <td className="p-4 capitalize text-muted-foreground">{s.device_type.replace('_', ' ')}</td>
                <td className="p-4">
                  <Badge variant={STATUS_VARIANT[s.status] ?? 'outline'} className="capitalize">{s.status}</Badge>
                </td>
                <td className="p-4">{s.controllers}</td>
                <td className="p-4">{s.max_players}</td>
                <td className="p-4">
                  <InlineToggle table="gaming_stations" id={s.id} field="is_active" initialValue={s.is_active} />
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <StationFormDialog station={s} nextStationNumber={nextStationNumber} />
                    <DeleteRowButton table="gaming_stations" id={s.id} label={s.station_name} />
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
