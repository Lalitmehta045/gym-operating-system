'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreatePayment } from '@/hooks/api/usePayments';
import { useMembers } from '@/hooks/api/useMembers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const paymentSchema = z.object({
  memberId: z.string().uuid('Please select a valid member'),
  invoiceId: z.string().uuid('Please select an invoice'),
  amount: z.coerce.number().min(1, 'Amount must be at least ₹1').max(99999999.99),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  transactionReference: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface MemberInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  amountDue: number;
  status: string;
  subscription?: {
    membershipPlan?: { name: string };
  };
}

export function PaymentForm() {
  const router = useRouter();
  const { data: membersData, isLoading: isLoadingMembers } = useMembers({ limit: 100 });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      memberId: '',
      invoiceId: '',
      amount: 0,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      transactionReference: '',
      notes: '',
    },
  });

  const memberId = form.watch('memberId');
  const [memberInvoices, setMemberInvoices] = React.useState<MemberInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = React.useState<MemberInvoice | null>(null);

  const handleMemberChange = async (newMemberId: string) => {
    form.setValue('memberId', newMemberId);
    form.setValue('invoiceId', '');
    form.setValue('amount', 0);
    setSelectedInvoice(null);
    
    if (!newMemberId) {
      setMemberInvoices([]);
      return;
    }
    
    try {
      // Fetch unpaid invoices for this member using the shared api instance
      const { data: responseData } = await (await import('@/lib/axios')).default.get('/invoices', {
        params: { memberId: newMemberId, limit: 100 },
      });
      
      const data = responseData || {};
      const invoices: MemberInvoice[] = (data.data || []).filter(
        (inv: any) => inv.status === 'DUE' || inv.status === 'PARTIALLY_PAID'
      ).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: Number(inv.amount),
        amountDue: Number(inv.amountDue ?? inv.amount),
        status: inv.status,
        subscription: inv.subscription,
      }));
      
      setMemberInvoices(invoices);

      // Auto-select the first unpaid invoice
      if (invoices.length > 0) {
        form.setValue('invoiceId', invoices[0].id, { shouldValidate: true });
        form.setValue('amount', invoices[0].amountDue, { shouldValidate: true });
        setSelectedInvoice(invoices[0]);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setMemberInvoices([]);
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    form.setValue('invoiceId', invoiceId, { shouldValidate: true });
    
    if (invoiceId) {
      const inv = memberInvoices.find(i => i.id === invoiceId);
      if (inv) {
        form.setValue('amount', inv.amountDue, { shouldValidate: true });
        setSelectedInvoice(inv);
      }
    } else {
      form.setValue('amount', 0, { shouldValidate: true });
      setSelectedInvoice(null);
    }
  };

  const createMutation = useCreatePayment();

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await createMutation.mutateAsync({
        memberId: values.memberId,
        invoiceId: values.invoiceId,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        transactionReference: values.transactionReference || undefined,
        notes: values.notes || undefined,
      });
      router.push('/payments');
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] p-8 space-y-6">
      <div className="space-y-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--ink-soft)]">Member <span className="text-red-500">*</span></label>
          <Select
            {...form.register('memberId')}
            onChange={(e) => handleMemberChange(e.target.value)}
            disabled={isLoadingMembers}
            className="w-full"
          >
            <option value="">Select a member</option>
            {membersData?.data.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName} ({member.memberCode})
              </option>
            ))}
          </Select>
          {form.formState.errors.memberId && (
            <p className="text-red-500 text-sm">{form.formState.errors.memberId.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--ink-soft)]">Invoice <span className="text-red-500">*</span></label>
          <Select
            {...form.register('invoiceId')}
            onChange={(e) => handleInvoiceChange(e.target.value)}
            disabled={!memberId || memberInvoices.length === 0}
            className="w-full"
          >
            <option value="">
              {!memberId ? 'Select a member first' : memberInvoices.length === 0 ? 'No unpaid invoices' : 'Select an invoice'}
            </option>
            {memberInvoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {inv.subscription?.membershipPlan?.name || 'General'} — Due: ₹{inv.amountDue.toLocaleString('en-IN')} ({inv.status})
              </option>
            ))}
          </Select>
          {form.formState.errors.invoiceId && (
            <p className="text-red-500 text-sm">{form.formState.errors.invoiceId.message}</p>
          )}
        </div>

        {/* Outstanding Info Card */}
        {selectedInvoice && (
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Invoice {selectedInvoice.invoiceNumber}</p>
              <p className="text-xs text-purple-600 mt-0.5">
                Total: ₹{selectedInvoice.amount.toLocaleString('en-IN')} • Outstanding: ₹{selectedInvoice.amountDue.toLocaleString('en-IN')}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
              selectedInvoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {selectedInvoice.status.replace('_', ' ')}
            </span>
          </div>
        )}

        <div className="space-y-1 relative">
          <label className="block text-sm font-medium text-[var(--ink-soft)]">Amount (INR) <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-[var(--mute)] text-lg">₹</span>
            <Input type="number" step="0.01" min="1" {...form.register('amount')} placeholder="0.00" className="pl-9 h-14 text-lg w-full rounded-xl" />
          </div>
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm">{form.formState.errors.amount.message}</p>
          )}
          {selectedInvoice && (
            <p className="text-xs text-[var(--ash)] mt-1">Maximum payable: ₹{selectedInvoice.amountDue.toLocaleString('en-IN')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--ink-soft)]">Payment Method <span className="text-red-500">*</span></label>
            <Select {...form.register('paymentMethod')} className="w-full">
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--ink-soft)]">Status <span className="text-red-500">*</span></label>
            <Select {...form.register('paymentStatus')} className="w-full">
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--ink-soft)]">Transaction Reference</label>
          <Input {...form.register('transactionReference')} placeholder="e.g., UPI Ref No. or Check No." className="w-full" />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--ink-soft)]">Notes</label>
          <textarea
            className="w-full min-h-[120px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
            rows={3}
            {...form.register('notes')}
            placeholder="Any additional details..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-[var(--hairline-soft)]">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}
