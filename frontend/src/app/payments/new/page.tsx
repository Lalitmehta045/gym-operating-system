import { PaymentForm } from '@/components/payments/PaymentForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPaymentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/payments">
          <Button variant="secondary" size="md" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Record Payment</h1>
          <p className="text-[14px] text-[#888888] mt-1">Add a new payment record manually</p>
        </div>
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-[8px] p-[24px]">
        <PaymentForm />
      </div>
    </div>
  );
}
