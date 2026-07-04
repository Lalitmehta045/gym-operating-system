import { PaymentForm } from '@/components/payments/PaymentForm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPaymentPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-3xl mx-auto space-y-6 px-4">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/payments">
            <Button variant="secondary" size="md" className="h-10 w-10 p-0 rounded-full border border-[var(--hairline)] bg-[var(--canvas-light)] shadow-sm flex items-center justify-center text-[var(--mute)] hover:text-[var(--on-primary)] hover:bg-[var(--canvas-paper)]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[var(--on-primary)]">Record Payment</h1>
            <p className="text-sm text-[var(--mute)] mt-1">Add a new payment record manually</p>
          </div>
        </div>

        <PaymentForm />
      </div>
    </div>
  );
}
