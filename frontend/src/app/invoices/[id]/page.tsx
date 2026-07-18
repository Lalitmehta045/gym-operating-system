'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoice } from '@/hooks/api/useInvoices';
import { useGymProfile } from '@/hooks/api/useSettings';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ArrowLeft, Printer, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { InvoiceTimeline } from '@/components/invoices/InvoiceTimeline';

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const { data: gymProfile } = useGymProfile();

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
            <h1 className="text-[24px] font-semibold text-[var(--on-primary)] tracking-tight">
              Invoice {invoice.invoiceNumber}
            </h1>
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
      </div>

      <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] rounded-[16px] shadow-sm p-[48px] print:p-0 print:border-none print:shadow-none font-sans relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-neutral-800 to-neutral-600 print:hidden"></div>

        <div className="flex justify-between items-start mb-12">
          <div className="max-w-[50%]">
            <h2 className="text-[36px] font-black text-[#111111] tracking-tight mb-1 uppercase">INVOICE</h2>
            <div className="text-[14px] text-[#555555] mt-4 space-y-1">
              <p className="font-bold text-[18px] text-[#222222]">{gymProfile?.name || 'GymOS Platform'}</p>
              {gymProfile?.address && <p>{gymProfile.address}</p>}
              {gymProfile?.city && gymProfile?.state && <p>{gymProfile.city}, {gymProfile.state} {gymProfile.country && `- ${gymProfile.country}`}</p>}
              {gymProfile?.email && <p className="mt-2 text-neutral-400">{gymProfile.email}</p>}
              {gymProfile?.phone && <p className="text-neutral-400">{gymProfile.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 inline-block text-left min-w-[200px]">
              <p className="text-[12px] font-bold text-[var(--ash)] uppercase tracking-wider mb-1">Invoice Number</p>
              <p className="text-[16px] font-medium text-[#111111]">{invoice.invoiceNumber}</p>
              
              <p className="text-[12px] font-bold text-[var(--ash)] uppercase tracking-wider mb-1 mt-4">Date Issued</p>
              <p className="text-[16px] font-medium text-[#111111]">{format(new Date(invoice.issuedAt), 'MMM d, yyyy')}</p>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' : invoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' : invoice.status === 'CANCELLED' ? 'bg-neutral-100 text-neutral-600' : 'bg-red-100 text-red-800'}
                `}>
                  {(invoice.status || 'DUE').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-12 pt-8 border-t border-dashed border-neutral-200">
          <div>
            <p className="text-[12px] font-bold text-[var(--ash)] uppercase tracking-wider mb-2">Billed To</p>
            <p className="text-[18px] font-bold text-[#111111]">
              {invoice.member?.firstName} {invoice.member?.lastName}
            </p>
            <div className="text-[14px] text-[#555555] mt-1 space-y-1">
              {invoice.member?.email && <p>{invoice.member.email}</p>}
              {invoice.member?.phone && <p>{invoice.member.phone}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 overflow-hidden mb-12">
          <table className="w-full border-collapse">
            <thead className="bg-neutral-50">
              <tr>
                <th className="py-4 px-6 text-left text-[12px] font-bold text-[var(--ash)] uppercase tracking-wider">Description</th>
                <th className="py-4 px-6 text-right text-[12px] font-bold text-[var(--ash)] uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr>
                <td className="py-6 px-6 text-[15px] text-[#111111]">
                  {invoice.subscription ? (
                    <>
                      <p className="font-bold text-[16px]">{invoice.subscription.membershipPlan?.name || 'Membership Plan'}</p>
                      <p className="text-[#555555] text-[14px] mt-1 flex items-center">
                        <span className="inline-block px-2 py-0.5 bg-neutral-100 rounded text-neutral-600 mr-2 text-xs font-medium">Billing Period</span>
                        {format(new Date(invoice.subscription.startDate), 'MMM d, yyyy')} — {format(new Date(invoice.subscription.endDate), 'MMM d, yyyy')}
                      </p>
                    </>
                  ) : (
                    <span className="font-medium">Gym Services / General Payment</span>
                  )}
                  {invoice.notes && (
                    <div className="mt-3 bg-neutral-50 p-3 rounded text-[#555555] text-[13px] border border-neutral-100">
                      <strong>Note:</strong> {invoice.notes}
                    </div>
                  )}
                </td>
                <td className="py-6 px-6 text-right text-[16px] font-medium text-[#111111] align-top">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-80">
            <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
              <div className="flex justify-between py-2 text-[#555555] text-[15px]">
                <span>Subtotal</span>
                <span className="font-medium text-[#111111]">{formatCurrency(invoice.amount)}</span>
              </div>
              
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="space-y-1">
                  {invoice.payments.filter((p: any) => p.paymentStatus === 'PAID').map((p: any, i: number) => (
                    <div key={i} className="flex justify-between py-1.5 text-[#2b8a3e] text-[14px]">
                      <span className="flex items-center">
                        Payment {i + 1} ({(p.paymentMethod || '').replace('_', ' ')})
                      </span>
                      <span className="font-medium">-{formatCurrency(Number(p.amount))}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between pt-4 mt-2 border-t border-neutral-200 font-bold text-[#111111] text-[20px]">
                <span>Amount Due</span>
                <span>{formatCurrency(invoice.amountDue ?? invoice.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--hairline-soft)] flex flex-col items-center justify-center text-center">
          <p className="text-[16px] font-medium text-[#111111] mb-1">Thank you for your business!</p>
          <p className="text-[13px] text-[var(--ash)]">If you have any questions concerning this invoice, contact {gymProfile?.email || 'support@gymos.com'}</p>
        </div>
      </div>

      <div className="print:hidden">
        <InvoiceTimeline invoiceId={invoice.id} />
      </div>

      <div className="flex justify-center space-x-4 print:hidden">
        {invoice.member && (
          <Link href={`/members/${invoice.member.id}`}>
            <Button variant="secondary">
              <ExternalLink className="h-4 w-4 mr-2" /> View Member Profile
            </Button>
          </Link>
        )}
        {invoice.payments && invoice.payments.length > 0 && (
          <Link href={`/payments/${invoice.payments[0].id}`}>
            <Button variant="secondary">
              <ExternalLink className="h-4 w-4 mr-2" /> View Payment Record
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
