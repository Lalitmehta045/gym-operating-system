'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetStaff,
  useCreateStaff,
  useUpdateStaffRole,
  useDeactivateStaff,
  useReactivateStaff,
} from '@/hooks/api/useStaff';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/DataTable';
import {
  Modal as Dialog,
  ModalContent as DialogContent,
  ModalHeader as DialogHeader,
  ModalTitle as DialogTitle,
  ModalTrigger as DialogTrigger,
} from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function StaffManagementPage() {
  const { user } = useAuth();
  const { data: rawStaffData, isLoading, error: queryError } = useGetStaff();
  const staffData = rawStaffData?.data || rawStaffData || [];
  
  const error = queryError ? 'Failed to load staff. Please try again.' : null;

  const createStaff = useCreateStaff();
  const updateRole = useUpdateStaffRole();
  const deactivateStaff = useDeactivateStaff();
  const reactivateStaff = useReactivateStaff();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'TRAINER',
  });

  const router = useRouter();
  useEffect(() => {
    if (user && user.role !== 'OWNER') {
      toast.error("You don't have permission for this page");
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role !== 'OWNER') {
    return null;
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaff.mutate(formData, {
      onSuccess: () => {
        toast.success('Staff member added successfully');
        setIsAddOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'TRAINER',
        });
      },
      onError: (error: any) => {
        let message = error.response?.data?.message || error.message || 'Failed to add staff member';
        if (Array.isArray(message)) message = message[0];
        toast.error(message);
      },
    });
  };

  const handleRoleChange = (id: string, newRole: string) => {
    updateRole.mutate(
      { id, role: newRole },
      {
        onSuccess: () => toast.success('Role updated successfully'),
        onError: (error: any) => {
          let message = error.response?.data?.message || error.message || 'Failed to update role';
          if (Array.isArray(message)) message = message[0];
          toast.error(message);
        },
      }
    );
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (isActive) {
      deactivateStaff.mutate(id, {
        onSuccess: () => toast.success('Staff deactivated'),
        onError: (error: any) => {
          let message = error.response?.data?.message || error.message || 'Failed to deactivate staff';
          if (Array.isArray(message)) message = message[0];
          toast.error(message);
        },
      });
    } else {
      reactivateStaff.mutate(id, {
        onSuccess: () => toast.success('Staff reactivated'),
        onError: (error: any) => {
          let message = error.response?.data?.message || error.message || 'Failed to reactivate staff';
          if (Array.isArray(message)) message = message[0];
          toast.error(message);
        },
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TRAINER':
        return 'bg-[var(--canvas-paper)] text-[var(--on-primary)] border-[var(--hairline)]';
      default:
        return 'bg-[var(--canvas-paper)] text-[var(--on-primary)]';
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading staff...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage your gym managers and trainers.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password (min 6 chars)</label>
                <Input
                  required
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="MANAGER">Manager</option>
                  <option value="TRAINER">Trainer</option>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createStaff.isPending}>
                  {createStaff.isPending ? 'Adding...' : 'Add Staff'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffData?.map((staff: any) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">
                  {staff.firstName} {staff.lastName}
                </TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getRoleBadgeColor(staff.role)}
                  >
                    {staff.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {staff.role !== 'OWNER' && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={staff.role}
                        onChange={(e) => handleRoleChange(staff.id, e.target.value)}
                        disabled={updateRole.isPending}
                        className="w-[120px] h-8 text-xs"
                      >
                        <option value="MANAGER">Manager</option>
                        <option value="TRAINER">Trainer</option>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() =>
                          handleToggleActive(staff.id, staff.isActive)
                        }
                        disabled={deactivateStaff.isPending || reactivateStaff.isPending}
                      >
                        {staff.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </div>
                  )}
                  {staff.role === 'OWNER' && (
                    <span className="text-xs text-muted-foreground italic">
                      Cannot modify owner
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!staffData?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
