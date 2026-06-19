'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoice } from '@/hooks/api/useInvoices';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ArrowLeft, Printer, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: invoice, isLoading, isError } = useInvoice(id);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <ErrorState title="Invoice not found" />
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/invoices">
            <Button variant="secondary" size="md" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">
              Invoice {invoice.invoiceNumber}
            </h1>
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-[8px] p-[48px] print:p-[24px] print:border-none print:shadow-none">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-[32px] font-bold text-[#171717] tracking-tight">INVOICE</h2>
            <p className="text-[14px] text-[#888888] mt-1">GymOS Platform</p>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-medium text-[#171717]">Invoice Number</p>
            <p className="text-[14px] text-[#888888]">{invoice.invoiceNumber}</p>
            <p className="text-[14px] font-medium text-[#171717] mt-4">Date Issued</p>
            <p className="text-[14px] text-[#888888]">{format(new Date(invoice.issuedAt), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <div className="flex justify-between items-start mb-12 border-t border-[#ebebeb] pt-8">
          <div>
            <p className="text-[14px] font-medium text-[#171717] mb-2">Billed To:</p>
            <p className="text-[16px] font-semibold text-[#171717]">
              {invoice.member?.firstName} {invoice.member?.lastName}
            </p>
            {invoice.member?.email && <p className="text-[14px] text-[#888888]">{invoice.member.email}</p>}
            {invoice.member?.phone && <p className="text-[14px] text-[#888888]">{invoice.member.phone}</p>}
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b border-[#ebebeb]">
              <th className="py-3 text-left text-[14px] font-medium text-[#171717]">Description</th>
              <th className="py-3 text-right text-[14px] font-medium text-[#171717]">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#ebebeb]">
              <td className="py-4 text-[14px] text-[#171717]">
                {invoice.subscription ? (
                  <>
                    <p className="font-medium">{invoice.subscription.membershipPlan?.name || 'Membership Plan'}</p>
                    <p className="text-[#888888] text-[13px] mt-1">
                      {format(new Date(invoice.subscription.startDate), 'MMM d, yyyy')} to {format(new Date(invoice.subscription.endDate), 'MMM d, yyyy')}
                    </p>
                  </>
                ) : (
                  'Gym Services / General Payment'
                )}
                {invoice.notes && (
                  <p className="text-[#888888] text-[13px] mt-2 italic">{invoice.notes}</p>
                )}
              </td>
              <td className="py-4 text-right text-[14px] text-[#171717] align-top">
                {formatCurrency(invoice.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-12">
          <div className="w-64">
            <div className="flex justify-between py-2 font-bold text-[#171717] text-[18px]">
              <span>Total</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.payment && (
              <div className="flex justify-between py-2 text-[#2b8a3e] text-[14px]">
                <span>Paid via {invoice.payment.paymentMethod.replace('_', ' ')}</span>
                <span>-{formatCurrency(invoice.amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 font-bold text-[#171717] text-[18px] border-t border-[#ebebeb] mt-2">
              <span>Amount Due</span>
              <span>{invoice.payment?.paymentStatus === 'PAID' ? formatCurrency(0) : formatCurrency(invoice.amount)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ebebeb] pt-8 text-center text-[12px] text-[#888888]">
          <p>Thank you for your business.</p>
        </div>
      </div>

      <div className="flex justify-center space-x-4 print:hidden">
        {invoice.member && (
          <Link href={`/members/${invoice.member.id}`}>
            <Button variant="secondary">
              <ExternalLink className="h-4 w-4 mr-2" /> View Member Profile
            </Button>
          </Link>
        )}
        {invoice.payment && (
          <Link href={`/payments/${invoice.payment.id}`}>
            <Button variant="secondary">
              <ExternalLink className="h-4 w-4 mr-2" /> View Payment Record
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
