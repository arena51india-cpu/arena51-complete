import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import { getCurrentStaffProfile } from '@/lib/data/admin';

const STAFF_ROLES = ['owner', 'manager', 'reception'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentStaffProfile();

  if (!profile || !STAFF_ROLES.includes(profile.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen">
      <AdminTopbar name={profile.full_name} role={profile.role} />
      <div className="flex">
        <AdminSidebar role={profile.role} />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
