import * as React from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Subscription } from "@/hooks/api/useSubscriptions"
import { format, differenceInDays } from "date-fns"

interface ExpiringMembersTableProps {
  subscriptions: Subscription[]
  isLoading: boolean
}

export function ExpiringMembersTable({ subscriptions, isLoading }: ExpiringMembersTableProps) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-sm text-[var(--ash)]">Loading expiring subscriptions...</div>
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 border border-[var(--hairline-soft)] rounded-[6px] bg-[var(--canvas-light)]">
        <div className="text-sm text-[var(--ash)]">No members are expiring soon.</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--canvas-paper)]/50 hover:bg-[var(--canvas-paper)]/50 border-b border-[var(--hairline-soft)]">
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Member</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Plan</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Expiry Date</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Days Remaining</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => {
            const daysRemaining = differenceInDays(new Date(sub.endDate), new Date())
            const isExpired = daysRemaining < 0
            
            return (
              <TableRow key={sub.id} className="border-b border-gray-50 hover:bg-[var(--canvas-paper)]/50 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6C47FF] flex items-center justify-center font-bold text-xs shrink-0">
                      {sub.member?.firstName?.charAt(0)}{sub.member?.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--on-primary)] text-sm">{sub.member?.firstName} {sub.member?.lastName}</p>
                      <p className="text-xs text-[var(--mute)]">{sub.member?.email || sub.member?.memberCode}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-[var(--on-primary)]">{sub.membershipPlan?.name}</p>
                  <p className="text-xs text-[var(--mute)]">{sub.membershipPlan?.durationDays} Days</p>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${daysRemaining < 3 ? 'text-red-500' : daysRemaining < 7 ? 'text-orange-500' : 'text-[var(--ink-soft)]'}`}>
                    {format(new Date(sub.endDate), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  {isExpired ? (
                    <span className="text-red-500 font-bold text-sm">Expired</span>
                  ) : (
                    <span className={`text-sm font-bold ${daysRemaining <= 3 ? 'text-[#EF4444]' : daysRemaining <= 7 ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
                      {daysRemaining} <span className="font-normal text-[var(--mute)]">days</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/subscriptions/${sub.id}`}>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-[var(--ash)] hover:text-[var(--on-primary)] hover:bg-[var(--canvas-paper)] rounded-lg" title="View Subscription">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
