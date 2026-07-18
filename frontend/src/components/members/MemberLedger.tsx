import * as React from "react"
import { useMemberLedger, useMemberFinancialSummary } from "@/hooks/api/useFinancials"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { format } from "date-fns"
import { CreditCard, FileText, CheckCircle2, RefreshCw, XCircle, DollarSign, Wallet } from "lucide-react"

export function MemberLedger({ memberId }: { memberId: string }) {
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useMemberFinancialSummary(memberId)
  const { data: ledger, isLoading: isLedgerLoading, isError: isLedgerError } = useMemberLedger(memberId)

  if (isSummaryLoading || isLedgerLoading) return <LoadingState />
  if (isSummaryError || isLedgerError || !summary || !ledger) return <ErrorState title="Failed to load financials" />

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION_CREATED':
      case 'SUBSCRIPTION_RENEWED':
        return <RefreshCw className="w-4 h-4 text-blue-500" />
      case 'INVOICE_GENERATED':
        return <FileText className="w-4 h-4 text-purple-500" />
      case 'INVOICE_CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'PAYMENT_PARTIAL':
        return <Wallet className="w-4 h-4 text-yellow-500" />
      case 'PAYMENT_FULL':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'REFUND':
        return <CreditCard className="w-4 h-4 text-slate-500" />
      default:
        return <DollarSign className="w-4 h-4 text-slate-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--canvas-light)] p-5 rounded-xl border border-[var(--hairline-soft)]">
          <p className="text-sm text-[var(--mute)] font-medium">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(summary.totalPaid)}</p>
        </div>
        <div className="bg-[var(--canvas-light)] p-5 rounded-xl border border-[var(--hairline-soft)]">
          <p className="text-sm text-[var(--mute)] font-medium">Outstanding Balance</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(summary.outstanding)}</p>
        </div>
        <div className="bg-[var(--canvas-light)] p-5 rounded-xl border border-[var(--hairline-soft)]">
          <p className="text-sm text-[var(--mute)] font-medium">Paid Invoices</p>
          <p className="text-2xl font-bold text-[var(--on-primary)] mt-1">{summary.paidInvoices} / {summary.totalInvoices}</p>
        </div>
        <div className="bg-[var(--canvas-light)] p-5 rounded-xl border border-[var(--hairline-soft)]">
          <p className="text-sm text-[var(--mute)] font-medium">Next Renewal</p>
          <p className="text-2xl font-bold text-[var(--on-primary)] mt-1">
            {summary.nextRenewalDate ? format(new Date(summary.nextRenewalDate), 'MMM d, yyyy') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Chronological Ledger Timeline */}
      <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
        <h3 className="text-lg font-medium text-[var(--on-primary)] mb-6">Financial Ledger</h3>
        <div className="relative border-l border-[var(--hairline-soft)] ml-3 space-y-8">
          {ledger.length === 0 ? (
            <p className="text-sm text-[var(--mute)] pl-6">No financial records found.</p>
          ) : (
            ledger.map((event, index) => (
              <div key={index} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-[-16px] top-1 bg-[var(--canvas-light)] border-2 border-[var(--hairline-soft)] rounded-full p-1.5 shadow-sm">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Event Details */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--on-primary)]">
                      {event.type.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-[var(--mute)] mt-1">{event.description}</p>
                    <div className="text-xs text-[var(--ash)] mt-1">
                      {format(new Date(event.date), 'MMM d, yyyy • hh:mm a')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[var(--on-primary)]">
                      {formatCurrency(event.amount)}
                    </span>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--canvas-paper)] text-[var(--ink-soft)] border border-[var(--hairline)]">
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
