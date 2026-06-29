'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreatePayment } from '@/hooks/api/usePayments';
import { useMembers } from '@/hooks/api/useMembers';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const paymentSchema = z.object({
  memberId: z.string().uuid('Please select a valid member'),
  subscriptionId: z.string().uuid().optional().or(z.literal('')),
  amount: z.coerce.number().min(0, 'Amount cannot be negative').max(99999999.99),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
  transactionReference: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentForm() {
  const router = useRouter();
  const { data: membersData, isLoading: isLoadingMembers } = useMembers({ limit: 100 });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      memberId: '',
      subscriptionId: '',
      amount: 0,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      transactionReference: '',
      notes: '',
    },
  });

  const memberId = form.watch('memberId');
  const [memberSubscriptions, setMemberSubscriptions] = React.useState<any[]>([]);

  const handleMemberChange = async (memberId: string) => {
    console.log('Member changed:', memberId);
    form.setValue('memberId', memberId);
    form.setValue('subscriptionId', '');
    form.setValue('amount', 0);
    
    if (!memberId) {
      setMemberSubscriptions([]);
      return;
    }
    
    try {
      const url = `/api/subscriptions?memberId=${memberId}&status=PENDING`;
      console.log('Fetching:', url);
      
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      const data = await res.json();
      console.log('Subscriptions response:', data);
      setMemberSubscriptions(data.data || []);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      setMemberSubscriptions([]);
    }
  };

  const createMutation = useCreatePayment();

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      await createMutation.mutateAsync({
        memberId: values.memberId,
        subscriptionId: values.subscriptionId || undefined,
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#171717] mb-1">Member *</label>
          <Select
            {...form.register('memberId')}
            onChange={(e) => handleMemberChange(e.target.value)}
            disabled={isLoadingMembers}
          >
            <option value="">Select a member</option>
            {membersData?.data.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName} ({member.memberCode})
              </option>
            ))}
          </Select>
          {form.formState.errors.memberId && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.memberId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#171717] mb-1">Subscription</label>
          <Select
            {...form.register('subscriptionId')}
            onChange={(e) => {
              const subId = e.target.value;
              form.setValue('subscriptionId', subId, { shouldValidate: true });
              
              if (subId) {
                const selectedSub = memberSubscriptions.find(s => s.id === subId);
                if (selectedSub) {
                  form.setValue('amount', Number(selectedSub.amount), { shouldValidate: true });
                }
              } else {
                form.setValue('amount', 0, { shouldValidate: true });
              }
            }}
            disabled={!memberId}
          >
            <option value="">No specific subscription (General Payment)</option>
            {memberSubscriptions.map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.membershipPlan?.name || 'Plan'} — ₹{Number(sub.amount).toLocaleString('en-IN')} 
                (ends {new Date(sub.endDate).toLocaleDateString('en-IN')})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#171717] mb-1">Amount (INR) *</label>
          <Input type="number" step="0.01" min="0" {...form.register('amount')} placeholder="0.00" />
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.amount.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Payment Method *</label>
            <Select {...form.register('paymentMethod')}>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#171717] mb-1">Status *</label>
            <Select {...form.register('paymentStatus')}>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#171717] mb-1">Transaction Reference</label>
          <Input {...form.register('transactionReference')} placeholder="e.g., UPI Ref No. or Check No." />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#171717] mb-1">Notes</label>
          <textarea
            className="flex w-full border border-[#ebebeb] bg-[#ffffff] text-[#171717] p-[12px] rounded-[6px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171717]"
            rows={3}
            {...form.register('notes')}
            placeholder="Any additional details..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-[#ebebeb]">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={createMutation.isPending}>
          Record Payment
        </Button>
      </div>
    </form>
  );
}
