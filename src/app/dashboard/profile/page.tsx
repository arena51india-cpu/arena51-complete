import { Card } from '@/components/ui/card';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { getCurrentProfile } from '@/lib/data/customer';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Update your personal details.</p>

      <Card className="mt-6 p-6">
        <ProfileForm profile={profile} />
      </Card>
    </div>
  );
}
