import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { InviteEmployeeDialog } from '@/components/admin/invite-employee-dialog';
import { EmployeeRoleSelect } from '@/components/admin/employee-role-select';
import { Card } from '@/components/ui/card';
import { getAllEmployees, getCurrentStaffProfile } from '@/lib/data/admin';

export const dynamic = 'force-dynamic';

export default async function AdminEmployeesPage() {
  const currentProfile = await getCurrentStaffProfile();
  if (!currentProfile || !['owner', 'manager'].includes(currentProfile.role)) {
    redirect('/admin');
  }

  const employees = await getAllEmployees();

  return (
    <div>
      <AdminPageHeader
        title="Employees"
        description="Owner, Manager, and Reception accounts with role-based permissions."
        action={<InviteEmployeeDialog />}
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {employees.map((e: any) => (
              <tr key={e.id}>
                <td className="p-4 font-medium">{e.full_name}</td>
                <td className="p-4 text-muted-foreground">{e.email}</td>
                <td className="p-4">
                  <EmployeeRoleSelect profileId={e.id} currentRole={e.role} isSelf={e.id === currentProfile.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Permissions: Owner and Manager can edit pricing, memberships, promo codes, offers, stations,
        games, and CMS content. Reception can manage bookings, walk-ins, and live sessions only.
      </p>
    </div>
  );
}
