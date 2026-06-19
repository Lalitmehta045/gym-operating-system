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
import { format } from 'date-fns';

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

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium font-mono">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>
                {invoice.member?.firstName} {invoice.member?.lastName}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                }).format(invoice.amount)}
              </TableCell>
              <TableCell>
                {format(new Date(invoice.issuedAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push(`/invoices/${invoice.id}`)}
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
