import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Book faster, track loyalty points, and manage your membership."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-gold-300 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
