'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/api/usePayments';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: payment, isLoading, isError } = usePayment(id);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !payment) {
    return (
      <div className="space-y-4">
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <ErrorState title="Payment not found" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-[#d3f9d8] text-[#2b8a3e]';
      case 'PENDING': return 'bg-[#fff3bf] text-[#e67700]';
      case 'FAILED': return 'bg-[#ffe3e3] text-[#c92a2a]';
      case 'REFUNDED': return 'bg-[#f1f3f5] text-[#495057]';
      default: return 'bg-[#f1f3f5] text-[#495057]';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/payments">
            <Button variant="secondary" size="md" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Payment Details</h1>
            <p className="text-[14px] text-[#888888] mt-1">ID: {payment.id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.paymentStatus)}`}>
          {payment.paymentStatus}
        </span>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-[8px] overflow-hidden">
        <div className="px-[24px] py-[20px] border-b border-[#ebebeb] bg-[#fafafa]">
          <h2 className="text-[16px] font-medium text-[#171717]">Transaction Summary</h2>
        </div>
        <div className="p-[24px] grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <p className="text-[13px] font-medium text-[#888888] mb-1">Amount</p>
            <p className="text-[24px] font-semibold text-[#171717]">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(payment.amount)}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#888888] mb-1">Payment Method</p>
            <p className="text-[15px] text-[#171717] font-medium">
              {payment.paymentMethod.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#888888] mb-1">Date</p>
            <p className="text-[15px] text-[#171717]">
              {payment.paidAt ? format(new Date(payment.paidAt), 'PPP p') : '—'}
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#888888] mb-1">Transaction Ref</p>
            <p className="text-[15px] text-[#171717] font-mono">
              {payment.transactionReference || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ebebeb] rounded-[8px] overflow-hidden">
          <div className="px-[24px] py-[20px] border-b border-[#ebebeb] bg-[#fafafa] flex justify-between items-center">
            <h2 className="text-[16px] font-medium text-[#171717]">Member Info</h2>
            {payment.member && (
              <Link href={`/members/${payment.member.id}`}>
                <Button variant="secondary" size="md" className="h-8">
                  <ExternalLink className="h-4 w-4 mr-2" /> Profile
                </Button>
              </Link>
            )}
          </div>
          <div className="p-[24px] space-y-4">
            {payment.member ? (
              <>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] mb-1">Name</p>
                  <p className="text-[15px] text-[#171717]">{payment.member.firstName} {payment.member.lastName}</p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] mb-1">Email</p>
                  <p className="text-[15px] text-[#171717]">{payment.member.email}</p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] mb-1">Phone</p>
                  <p className="text-[15px] text-[#171717]">{payment.member.phone}</p>
                </div>
              </>
            ) : (
              <p className="text-[14px] text-[#888888]">No member assigned.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#ebebeb] rounded-[8px] overflow-hidden">
          <div className="px-[24px] py-[20px] border-b border-[#ebebeb] bg-[#fafafa]">
            <h2 className="text-[16px] font-medium text-[#171717]">Subscription Info</h2>
          </div>
          <div className="p-[24px] space-y-4">
            {payment.subscription ? (
              <>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] mb-1">Plan</p>
                  <p className="text-[15px] text-[#171717]">
                    {payment.subscription.membershipPlan?.name || 'Unknown Plan'}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] mb-1">Duration</p>
                  <p className="text-[15px] text-[#171717]">
                    {format(new Date(payment.subscription.startDate), 'MMM d, yyyy')} - {format(new Date(payment.subscription.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#888888] mb-1">Status</p>
                  <p className="text-[15px] text-[#171717]">{payment.subscription.status}</p>
                </div>
              </>
            ) : (
              <p className="text-[14px] text-[#888888]">General payment (not tied to a specific subscription).</p>
            )}
          </div>
        </div>
      </div>
      
      {payment.notes && (
        <div className="bg-white border border-[#ebebeb] rounded-[8px] overflow-hidden">
          <div className="px-[24px] py-[20px] border-b border-[#ebebeb] bg-[#fafafa]">
            <h2 className="text-[16px] font-medium text-[#171717]">Notes</h2>
          </div>
          <div className="p-[24px]">
            <p className="text-[14px] text-[#171717] whitespace-pre-wrap">{payment.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
