'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function InviteEmployeeDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'manager' | 'reception'>('reception');
  const [password, setPassword] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch('/api/admin/employees/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, role, password }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error || 'Could not create the account.');
      return;
    }

    toast.success(`${fullName} added as ${role}.`);
    setOpen(false);
    setFullName('');
    setEmail('');
    setPassword('');
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm"><Plus className="h-4 w-4" /> Add Employee</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add a staff account</DialogTitle>
        <DialogDescription>Owner accounts are provisioned outside the app for safety.</DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reception">Reception</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="password">Temporary password</Label>
            <Input id="password" type="text" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="mt-1 text-xs text-muted-foreground">Share this with them securely — they should change it on first login.</p>
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
