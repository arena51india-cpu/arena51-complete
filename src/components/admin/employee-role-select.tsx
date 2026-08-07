'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function EmployeeRoleSelect({ profileId, currentRole, isSelf }: { profileId: string; currentRole: string; isSelf: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  async function handleChange(role: string) {
    setSaving(true);
    const res = await fetch('/api/admin/employees/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, role }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || 'Could not update role.');
      return;
    }
    toast.success('Role updated.');
    router.refresh();
  }

  return (
    <Select defaultValue={currentRole} onValueChange={handleChange} disabled={saving || isSelf}>
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="owner">Owner</SelectItem>
        <SelectItem value="manager">Manager</SelectItem>
        <SelectItem value="reception">Reception</SelectItem>
      </SelectContent>
    </Select>
  );
}
