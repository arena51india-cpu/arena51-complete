'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { GoogleSignInButton, AuthDivider } from './google-signin-button';

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [checkEmail, setCheckEmail] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      // Email confirmation is disabled on this project — user is signed in immediately.
      toast.success('Account created!');
      router.push('/dashboard');
      router.refresh();
    } else {
      // Email confirmation required.
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="text-sm text-muted-foreground">
        We&apos;ve sent a confirmation link to <span className="text-foreground">{email}</span>.
        Verify your email to finish creating your account.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GoogleSignInButton redirectTo="/dashboard" />
      <AuthDivider />

      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" required placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" variant="gold" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  );
}
