import * as React from "react"
import Link from "next/link"
import { Eye, RefreshCw, XCircle } from "lucide-react"
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
import { format } from "date-fns"

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  isLoading: boolean
  onRenew?: (id: string) => void
  onCancel?: (id: string) => void
  onPay?: (id: string) => void
}

export function SubscriptionTable({ subscriptions, isLoading, onRenew, onCancel, onPay }: SubscriptionTableProps) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-sm text-[#888888]">Loading subscriptions...</div>
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 border border-[#ebebeb] rounded-[6px] bg-white">
        <div className="text-sm text-[#888888] mb-4">No subscriptions found</div>
        <Link href="/subscriptions/new">
          <Button variant="secondary">Create a subscription</Button>
        </Link>
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
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(subscriptions) ? subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">
                {sub.member?.firstName} {sub.member?.lastName}
              </TableCell>
              <TableCell>{sub.membershipPlan?.name || "Unknown Plan"}</TableCell>
              <TableCell>{format(new Date(sub.startDate), "MMM d, yyyy")}</TableCell>
              <TableCell>{format(new Date(sub.endDate), "MMM d, yyyy")}</TableCell>
              <TableCell>₹{Number(sub.amount).toLocaleString()}</TableCell>
              <TableCell>
                {sub.status === "ACTIVE" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-green-50 text-green-700 border border-green-200 text-[12px]">
                    Active
                  </span>
                )}
                {sub.status === "EXPIRED" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-red-50 text-red-700 border border-red-200 text-[12px]">
                    Expired
                  </span>
                )}
                {sub.status === "CANCELLED" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-gray-50 text-gray-700 border border-gray-200 text-[12px]">
                    Cancelled
                  </span>
                )}
                {sub.status === "PENDING" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-yellow-50 text-yellow-700 border border-yellow-200 text-[12px]">
                    Pending
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/subscriptions/${sub.id}`}>
                    <Button variant="ghost" className="h-8 w-8 p-0" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {sub.status === "PENDING" && onPay && (
                    <Button
                      variant="secondary"
                      className="h-8 text-xs px-3"
                      onClick={() => onPay(sub.id)}
                    >
                      Pay Now
                    </Button>
                  )}
                  {onRenew && sub.status !== "ACTIVE" && sub.status !== "PENDING" && (
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
                      title="Renew Subscription"
                      onClick={() => onRenew(sub.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  {onCancel && sub.status === "ACTIVE" && (
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" 
                      title="Cancel Subscription"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to cancel this subscription?")) {
                          onCancel(sub.id)
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )) : null}
        </TableBody>
      </Table>
    </div>
  )
}
