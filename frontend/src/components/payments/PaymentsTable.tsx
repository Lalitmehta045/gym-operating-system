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
import { Eye, Smartphone, CreditCard, Banknote, Building2 } from 'lucide-react';

interface PaymentsTableProps {
  search?: string;
  status?: string;
  method?: string;
}

export function PaymentsTable({ search, status, method }: PaymentsTableProps) {
  const router = useRouter();
  const [page, setPage] = React.useState(1);

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1) }, [search, status, method])

  const { data, isLoading, isError } = usePayments({
    page,
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'REFUNDED':
        return 'bg-[var(--canvas-paper)] text-[var(--ink-soft)] border-[var(--hairline)]';
      default:
        return 'bg-[var(--canvas-paper)] text-[var(--ink-soft)] border-[var(--hairline)]';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI': return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'CARD': return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      case 'CASH': return <Banknote className="w-3.5 h-3.5 text-green-600" />;
      case 'BANK_TRANSFER': return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      default: return null;
    }
  };

  return (
    <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--canvas-paper)]/50 hover:bg-[var(--canvas-paper)]/50">
            <TableHead className="font-semibold text-[var(--mute)] py-4 px-6">MEMBER</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">INVOICE / ID</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">DATE</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">PLAN</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">AMOUNT</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">METHOD</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">STATUS</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4 text-center">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const memberName = `${payment.member?.firstName || 'Unknown'} ${payment.member?.lastName || ''}`.trim();
            const initials = memberName.substring(0, 2).toUpperCase() || 'NA';
            
            const colors = ['bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700'];
            const colorIndex = payment.memberId ? payment.memberId.charCodeAt(0) % colors.length : 0;
            const avatarColor = colors[colorIndex];

            const invoiceId = `INV-${payment.id.substring(0,4).toUpperCase()}`;
            const txnId = `TXN-${payment.transactionReference || payment.id.substring(4,12).toUpperCase()}`;

            return (
              <TableRow key={payment.id} className="hover:bg-[var(--canvas-paper)]/50 transition-colors">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--on-primary)]">{memberName}</div>
                      <div className="text-xs text-[var(--mute)]">{payment.member?.email || 'No email'}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="py-4">
                  <div>
                    <div className="font-semibold text-[var(--on-primary)]">{invoiceId}</div>
                    <div className="text-xs text-[var(--mute)]">{txnId}</div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div>
                    <div className="text-sm text-[var(--on-primary)] font-medium">
                      {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy') : format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-[var(--mute)] mt-0.5">
                      {payment.paidAt ? format(new Date(payment.paidAt), 'hh:mm a') : format(new Date(payment.createdAt), 'hh:mm a')}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div>
                    <div className="font-semibold text-[var(--on-primary)]">
                      {payment.subscription?.membershipPlan?.name || 'Standard Plan'}
                    </div>
                    <div className="text-xs text-[var(--mute)] mt-0.5">
                      {payment.subscription?.membershipPlan?.durationDays 
                        ? Math.round(payment.subscription.membershipPlan.durationDays / 30) + ' Months' 
                        : '1 Month'}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="font-bold text-[var(--on-primary)]">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(payment.amount)}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--hairline)] bg-[var(--canvas-light)] w-fit">
                    {getMethodIcon(payment.paymentMethod)}
                    <span className="text-xs font-medium text-[var(--ink-soft)] capitalize">
                      {payment.paymentMethod.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(payment.paymentStatus)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      payment.paymentStatus === 'PAID' ? 'bg-green-500' :
                      payment.paymentStatus === 'PENDING' ? 'bg-orange-500' :
                      payment.paymentStatus === 'FAILED' ? 'bg-red-500' : 'bg-[var(--canvas-paper)]0'
                    }`}></span>
                    {payment.paymentStatus.charAt(0) + payment.paymentStatus.slice(1).toLowerCase()}
                  </span>
                </TableCell>

                <TableCell className="py-4 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--ash)] hover:text-[var(--slate-soft)] hover:bg-[var(--canvas-paper)] rounded-full mx-auto"
                    onClick={() => router.push(`/payments/${payment.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="border-t border-[var(--hairline)] p-4 flex items-center justify-between bg-[var(--canvas-light)]">
        <span className="text-sm text-[var(--mute)]">
          Showing {Math.min((page - 1) * (data.meta?.limit || 20) + 1, data.meta?.total || payments.length)} to {Math.min(page * (data.meta?.limit || 20), data.meta?.total || payments.length)} of {data.meta?.total || payments.length} payments
        </span>
        {data.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 px-2 text-[var(--mute)] border-[var(--hairline)] bg-[var(--canvas-light)] disabled:opacity-40">{'<'}</Button>
            {Array.from({ length: Math.min(data.meta.totalPages, 5) }, (_, i) => {
              let p: number
              if (data.meta!.totalPages <= 5) p = i + 1
              else if (page <= 3) p = i + 1
              else if (page >= data.meta!.totalPages - 2) p = data.meta!.totalPages - 4 + i
              else p = page - 2 + i
              return (
                <Button key={p} variant="outline" size="sm" onClick={() => setPage(p)} className={`h-8 w-8 ${ p === page ? 'text-white bg-[#6C47FF] border-[#6C47FF] hover:bg-[#5835e5]' : 'text-[var(--slate-soft)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)]' }`}>{p}</Button>
              )
            })}
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.meta!.totalPages, p + 1))} disabled={page >= data.meta.totalPages} className="h-8 px-2 text-[var(--mute)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)] disabled:opacity-40">{'>'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
