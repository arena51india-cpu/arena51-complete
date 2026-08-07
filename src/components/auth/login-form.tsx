'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { GoogleSignInButton, AuthDivider } from './google-signin-button';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const supabase = createClient();

  const [mode, setMode] = React.useState<'password' | 'otp'>('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    setOtpSent(true);
    toast.success('Check your email for a 6-digit code.');
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div>
      <GoogleSignInButton redirectTo={redirectTo} />
      <AuthDivider />

      <div className="mb-6 flex rounded-lg border border-white/10 bg-white/[0.02] p-1 text-sm">
        <button
          className={cn(
            'flex-1 rounded-md py-1.5 font-medium transition-colors',
            mode === 'password' ? 'bg-primary/15 text-gold-300' : 'text-muted-foreground'
          )}
          onClick={() => {
            setMode('password');
            setOtpSent(false);
          }}
        >
          Password
        </button>
        <button
          className={cn(
            'flex-1 rounded-md py-1.5 font-medium transition-colors',
            mode === 'otp' ? 'bg-primary/15 text-gold-300' : 'text-muted-foreground'
          )}
          onClick={() => setMode('otp')}
        >
          Email OTP
        </button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      ) : !otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label htmlFor="otpEmail">Email</Label>
            <Input id="otpEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <Label htmlFor="otp">6-digit code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="font-mono tracking-[0.3em]"
            />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify & Sign In'}
          </Button>
        </form>
      )}
    </div>
  );
}
