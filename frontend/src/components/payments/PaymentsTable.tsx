'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { usePayments } from '@/hooks/api/usePayments';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { format } from 'date-fns';

interface PaymentsTableProps {
  search?: string;
  status?: string;
  method?: string;
}

export function PaymentsTable({ search, status, method }: PaymentsTableProps) {
  const router = useRouter();
  const { data, isLoading, isError } = usePayments({
    search,
    status: status !== 'ALL' ? status : undefined,
    method: method !== 'ALL' ? method : undefined,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState title="Failed to load payments" />;
  }

  const payments = data.data;

  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments found"
        description="Try adjusting your filters or record a new payment."
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-[#d3f9d8] text-[#2b8a3e]';
      case 'PENDING':
        return 'bg-[#fff3bf] text-[#e67700]';
      case 'FAILED':
        return 'bg-[#ffe3e3] text-[#c92a2a]';
      case 'REFUNDED':
        return 'bg-[#f1f3f5] text-[#495057]';
      default:
        return 'bg-[#f1f3f5] text-[#495057]';
    }
  };

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Paid Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {payment.member?.firstName} {payment.member?.lastName}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(payment.amount)}
              </TableCell>
              <TableCell>{payment.paymentMethod.replace('_', ' ')}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.paymentStatus)}`}>
                  {payment.paymentStatus}
                </span>
              </TableCell>
              <TableCell>
                {payment.paidAt ? format(new Date(payment.paidAt), 'MMM d, yyyy') : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push(`/payments/${payment.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
