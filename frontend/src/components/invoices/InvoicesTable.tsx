'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/api/useInvoices';
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
import { format, differenceInDays } from 'date-fns';
import { Eye, FileText, Smartphone, CreditCard, Banknote, Building2, MoreVertical } from 'lucide-react';

interface InvoicesTableProps {
  search?: string;
}

export function InvoicesTable({ search }: InvoicesTableProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useInvoices({
    search,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return <ErrorState title="Failed to load invoices" />;
  }

  const invoices = data.data;

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices found"
        description="Try adjusting your search or wait for payments to generate invoices."
      />
    );
  }

  const getStatusDetails = (invoice: any) => {
    let status = invoice.payment?.paymentStatus || 'PENDING';
    
    // Calculate mock due date if not provided (assume 3 days after issue)
    const issueDate = new Date(invoice.issuedAt);
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + 3);
    
    const now = new Date();
    let isOverdue = false;
    let overdueDays = 0;

    if (status !== 'PAID' && now > dueDate) {
      status = 'OVERDUE';
      isOverdue = true;
      overdueDays = differenceInDays(now, dueDate);
    }

    let style = 'bg-[var(--canvas-paper)] text-[var(--ink-soft)] border-[var(--hairline)]';
    let dotColor = 'bg-[var(--canvas-paper)]0';
    let label = 'Pending';

    if (status === 'PAID') {
      style = 'bg-green-50 text-green-700 border-green-200';
      dotColor = 'bg-green-500';
      label = 'Paid';
    } else if (status === 'PENDING') {
      style = 'bg-orange-50 text-orange-700 border-orange-200';
      dotColor = 'bg-orange-500';
      label = 'Pending';
    } else if (status === 'OVERDUE') {
      style = 'bg-red-50 text-red-700 border-red-200';
      dotColor = 'bg-red-500';
      label = 'Overdue';
    } else if (status === 'FAILED') {
      style = 'bg-red-50 text-red-700 border-red-200';
      dotColor = 'bg-red-500';
      label = 'Failed';
    } else if (status === 'REFUNDED') {
      style = 'bg-[var(--canvas-paper)] text-[var(--ink-soft)] border-[var(--hairline)]';
      dotColor = 'bg-[var(--canvas-paper)]0';
      label = 'Refunded';
    }

    return { style, dotColor, label, dueDate, isOverdue, overdueDays };
  };

  const getMethodIcon = (method?: string) => {
    if (!method) return <span className="text-[var(--ash)]">—</span>;
    switch (method) {
      case 'UPI': return <><Smartphone className="w-3.5 h-3.5 text-purple-600" /><span className="text-xs font-medium text-[var(--ink-soft)]">UPI</span></>;
      case 'CARD': return <><CreditCard className="w-3.5 h-3.5 text-blue-600" /><span className="text-xs font-medium text-[var(--ink-soft)]">Card</span></>;
      case 'CASH': return <><Banknote className="w-3.5 h-3.5 text-green-600" /><span className="text-xs font-medium text-[var(--ink-soft)]">Cash</span></>;
      case 'BANK_TRANSFER': return <><Building2 className="w-3.5 h-3.5 text-indigo-600" /><span className="text-xs font-medium text-[var(--ink-soft)]">Bank Transfer</span></>;
      default: return <span className="text-xs font-medium text-[var(--ink-soft)] capitalize">{method.replace('_', ' ').toLowerCase()}</span>;
    }
  };

  return (
    <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--canvas-paper)]/50 hover:bg-[var(--canvas-paper)]/50">
            <TableHead className="font-semibold text-[var(--mute)] py-4 px-6">INVOICE #</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">MEMBER</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">PLAN</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">DATE</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">DUE DATE</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">AMOUNT</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">STATUS</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4">PAYMENT METHOD</TableHead>
            <TableHead className="font-semibold text-[var(--mute)] py-4 text-center">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const memberName = `${invoice.member?.firstName || 'Unknown'} ${invoice.member?.lastName || ''}`.trim();
            const initials = memberName.substring(0, 2).toUpperCase() || 'NA';
            
            const colors = ['bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700'];
            const colorIndex = invoice.memberId ? invoice.memberId.charCodeAt(0) % colors.length : 0;
            const avatarColor = colors[colorIndex];

            const { style, dotColor, label, dueDate, isOverdue, overdueDays } = getStatusDetails(invoice);

            return (
              <TableRow key={invoice.id} className="hover:bg-[var(--canvas-paper)]/50 transition-colors">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[var(--on-primary)]">{invoice.invoiceNumber || `INV-${invoice.id.substring(0,4).toUpperCase()}`}</span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor}`}>
                      {initials}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--on-primary)]">{memberName}</div>
                      <div className="text-xs text-[var(--mute)]">{invoice.member?.email || 'No email'}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div>
                    <div className="font-semibold text-[var(--on-primary)]">
                      {invoice.subscription?.membershipPlan?.name || 'Standard Plan'}
                    </div>
                    <div className="text-xs text-[var(--mute)] mt-0.5">
                      {invoice.subscription?.membershipPlan?.durationDays 
                        ? Math.round(invoice.subscription.membershipPlan.durationDays / 30) + ' Months' 
                        : '1 Month'}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div>
                    <div className="text-sm text-[var(--on-primary)] font-medium">
                      {format(new Date(invoice.issuedAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-[var(--mute)] mt-0.5">
                      {format(new Date(invoice.issuedAt), 'hh:mm a')}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div>
                    <div className="text-sm text-[var(--on-primary)]">
                      {format(dueDate, 'MMM dd, yyyy')}
                    </div>
                    {isOverdue && (
                      <div className="text-xs text-red-500 font-medium mt-0.5">
                        Overdue by {overdueDays} days
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="font-bold text-[var(--on-primary)]">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(invoice.amount)}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
                    {label}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  {invoice.payment?.paymentMethod ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--hairline)] bg-[var(--canvas-light)] w-fit">
                      {getMethodIcon(invoice.payment.paymentMethod)}
                    </div>
                  ) : (
                    <span className="text-[var(--ash)]">—</span>
                  )}
                </TableCell>

                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--ash)] hover:text-[var(--slate-soft)] hover:bg-[var(--canvas-paper)] rounded-full"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--ash)] hover:text-[var(--slate-soft)] hover:bg-[var(--canvas-paper)] rounded-full"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="border-t border-[var(--hairline)] p-4 flex items-center justify-between bg-[var(--canvas-light)]">
        <span className="text-sm text-[var(--mute)]">Showing 1 to {invoices.length} of {data.meta?.total || invoices.length} invoices</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 px-2 text-[var(--mute)] border-[var(--hairline)] bg-[var(--canvas-light)]">{'<'}</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 text-white bg-[#6C47FF] border-[#6C47FF] hover:bg-[#5835e5]">1</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 text-[var(--slate-soft)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)]">2</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 text-[var(--slate-soft)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)]">3</Button>
          <span className="px-2 text-[var(--ash)]">...</span>
          <Button variant="outline" size="sm" className="h-8 w-8 text-[var(--slate-soft)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)]">9</Button>
          <Button variant="outline" size="sm" className="h-8 px-2 text-[var(--mute)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)]">{'>'}</Button>
        </div>
      </div>
    </div>
  );
}
