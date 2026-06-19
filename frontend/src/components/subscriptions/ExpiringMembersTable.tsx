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
        <div className="text-sm text-[#888888]">Loading expiring subscriptions...</div>
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 border border-[#ebebeb] rounded-[6px] bg-white">
        <div className="text-sm text-[#888888]">No members are expiring soon.</div>
      </div>
    )
  }

  return (
    <div className="border border-[#ebebeb] rounded-[6px] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Days Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => {
            const daysRemaining = differenceInDays(new Date(sub.endDate), new Date())
            const isExpired = daysRemaining < 0
            
            return (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {sub.member?.firstName} {sub.member?.lastName}
                </TableCell>
                <TableCell>{sub.membershipPlan?.name}</TableCell>
                <TableCell>{format(new Date(sub.endDate), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {isExpired ? (
                    <span className="text-red-600 font-medium">Expired</span>
                  ) : (
                    <span className={daysRemaining <= 3 ? "text-yellow-600 font-medium" : ""}>
                      {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/subscriptions/${sub.id}`}>
                    <Button variant="ghost" className="h-8 w-8 p-0" title="View Subscription">
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
