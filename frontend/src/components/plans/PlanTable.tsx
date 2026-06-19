import * as React from "react"
import Link from "next/link"
import { Eye, Edit, Trash2 } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Plan } from "@/hooks/api/usePlans"

interface PlanTableProps {
  plans: Plan[]
  isLoading: boolean
  onDelete: (id: string) => void
}

export function PlanTable({ plans, isLoading, onDelete }: PlanTableProps) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-sm text-[#888888]">Loading plans...</div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 border border-[#ebebeb] rounded-[6px] bg-white">
        <div className="text-sm text-[#888888] mb-4">No plans found</div>
        <Link href="/plans/new">
          <Button variant="secondary">Create your first plan</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-[#ebebeb] rounded-[6px] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Plan Type</TableHead>
            <TableHead>Duration (Days)</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-[#fafafa] border border-[#ebebeb] text-[12px] font-mono">
                  {plan.planType}
                </span>
              </TableCell>
              <TableCell>{plan.durationDays}</TableCell>
              <TableCell>₹{plan.price.toLocaleString()}</TableCell>
              <TableCell>
                {plan.isActive ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-green-50 text-green-700 border border-green-200 text-[12px]">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-gray-50 text-gray-700 border border-gray-200 text-[12px]">
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/plans/${plan.id}`}>
                    <Button variant="ghost" className="h-8 w-8 p-0" title="View Plan">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/plans/${plan.id}/edit`}>
                    <Button variant="ghost" className="h-8 w-8 p-0" title="Edit Plan">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" 
                    title="Delete Plan"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this plan?")) {
                        onDelete(plan.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
