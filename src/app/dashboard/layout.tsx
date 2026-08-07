import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { MobileTabBar } from '@/components/dashboard/mobile-tabbar';
import { getCurrentProfile } from '@/lib/data/customer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen">
      <DashboardTopbar profile={profile} />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 px-6 py-8 pb-24 lg:pb-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
