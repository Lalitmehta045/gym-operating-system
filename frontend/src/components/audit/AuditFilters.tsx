import React from 'react';
import { AuditLogFilters } from '@/services/audit.service';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onChange: (filters: AuditLogFilters) => void;
}

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
        <Input
          type="text"
          placeholder="Search by description or IP..."
          className="pl-10"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      
      <div className="w-full md:w-48">
        <Select
          value={filters.entity || 'ALL'}
          onChange={(e) => onChange({ ...filters, entity: e.target.value === 'ALL' ? undefined : (e.target.value as any) })}
        >
          <option value="ALL">All Entities</option>
          <option value="MEMBER">Member</option>
          <option value="PAYMENT">Payment</option>
          <option value="SUBSCRIPTION">Subscription</option>
          <option value="USER">User</option>
          <option value="GYM">Gym</option>
          <option value="MEDIA">Media</option>
        </Select>
      </div>

      <div className="w-full md:w-48">
        <Select
          value={filters.action || 'ALL'}
          onChange={(e) => onChange({ ...filters, action: e.target.value === 'ALL' ? undefined : (e.target.value as any) })}
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="UPLOAD">Upload</option>
          <option value="PAYMENT_SUCCESS">Payment Success</option>
        </Select>
      </div>
    </div>
  );
}
