import * as React from "react"
import Link from "next/link"
import { Eye, MoreVertical, Search, Filter, Smartphone, CreditCard, Landmark } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Subscription } from "@/hooks/api/useSubscriptions"
import { format, differenceInDays } from "date-fns"

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  isLoading: boolean
  onRenew?: (id: string) => void
  onCancel?: (id: string) => void
  onPay?: (id: string) => void
}

const getInitials = (firstName?: string, lastName?: string) => {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
}

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-[#F3F0FF] text-[#6C47FF]", // Purple
    "bg-[#FEF3C7] text-[#F59E0B]", // Orange
    "bg-[#DBEAFE] text-[#3B82F6]", // Blue
    "bg-[#DCFCE7] text-[#22C55E]", // Green
    "bg-[#FCE7F3] text-[#EC4899]"  // Pink
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

const getPaymentMethodMock = (id: string) => {
  // Just deterministic mocking based on ID for visual representation
  const methods = [
    { name: "UPI", icon: Smartphone, color: "text-[#6C47FF]", bg: "bg-[#F3F0FF]" },
    { name: "Card", icon: CreditCard, color: "text-[#3B82F6]", bg: "bg-[#DBEAFE]" },
    { name: "Net Banking", icon: Landmark, color: "text-[#22C55E]", bg: "bg-[#DCFCE7]" }
  ];
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return methods[charCode % methods.length];
}

export function SubscriptionTable({ subscriptions, isLoading, onRenew, onCancel, onPay }: SubscriptionTableProps) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm">
        <div className="text-sm text-[var(--mute)]">Loading subscriptions...</div>
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm">
        <div className="text-sm text-[var(--mute)] mb-4">No subscriptions found</div>
        <Link href="/subscriptions/new">
          <Button variant="primary" className="bg-[#6C47FF] hover:bg-[#5b3ce0]">Create a subscription</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[var(--canvas-light)] p-3 rounded-xl border border-[var(--hairline-soft)] shadow-sm">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ash)]" />
          <input
            type="text"
            placeholder="Search by member name, plan, or invoice..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-[var(--on-primary)] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select className="bg-transparent text-sm text-[var(--ink-soft)] font-medium focus:outline-none cursor-pointer border-l border-[var(--hairline-soft)] pl-3">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Expired</option>
          </select>
          <select className="bg-transparent text-sm text-[var(--ink-soft)] font-medium focus:outline-none cursor-pointer border-l border-[var(--hairline-soft)] pl-3">
            <option>All Plans</option>
            <option>Premium Plan</option>
            <option>Standard Plan</option>
            <option>Basic Plan</option>
          </select>
          <select className="bg-transparent text-sm text-[var(--ink-soft)] font-medium focus:outline-none cursor-pointer border-l border-[var(--hairline-soft)] pl-3 hidden sm:block">
            <option>All Payment Methods</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
          <button onClick={() => {}} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded-lg border-l border-[var(--hairline-soft)] transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--canvas-paper)] text-xs uppercase text-[var(--mute)] font-medium border-b border-[var(--hairline-soft)]">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Start Date</th>
                <th className="px-6 py-4 font-medium">Next Billing</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment Method</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscriptions.map((sub) => {
                const firstName = sub.member?.firstName || "Unknown"
                const lastName = sub.member?.lastName || ""
                const fullName = `${firstName} ${lastName}`.trim()
                const avatarClass = getAvatarColor(firstName)
                const paymentInfo = getPaymentMethodMock(sub.id)
                const endDate = new Date(sub.endDate)
                const daysDiff = differenceInDays(endDate, new Date())

                return (
                  <tr key={sub.id} className="hover:bg-[var(--canvas-paper)]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 ${avatarClass}`}>
                          {getInitials(firstName, lastName)}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--on-primary)]">{fullName}</div>
                          <div className="text-xs text-[var(--mute)]">{sub.member?.email || `${firstName.toLowerCase()}@example.com`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--on-primary)]">{sub.membershipPlan?.name || "Unknown Plan"}</div>
                      <div className="text-xs text-[var(--mute)]">{sub.membershipPlan?.durationDays ? `${Math.round(sub.membershipPlan.durationDays / 30)} Months` : "Custom Duration"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === "ACTIVE" && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1.5"></div>
                          Active
                        </div>
                      )}
                      {sub.status === "PENDING" && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] mr-1.5"></div>
                          Pending
                        </div>
                      )}
                      {sub.status === "EXPIRED" && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mr-1.5"></div>
                          Expired
                        </div>
                      )}
                      {sub.status === "CANCELLED" && (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--canvas-paper)] text-[var(--slate-soft)] text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--canvas-paper)]0 mr-1.5"></div>
                          Cancelled
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--on-primary)]">{format(new Date(sub.startDate), "MMM dd, yyyy")}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === "PENDING" ? (
                        <>
                          <div className="font-medium text-[var(--on-primary)]">-</div>
                          <div className="text-xs text-[var(--mute)]">Payment pending</div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-[var(--on-primary)]">{format(endDate, "MMM dd, yyyy")}</div>
                          {daysDiff < 0 ? (
                            <div className="text-xs text-[#DC2626]">Expired {Math.abs(daysDiff)} days ago</div>
                          ) : (
                            <div className="text-xs text-[var(--mute)]">In {daysDiff} days</div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--on-primary)]">₹{Number(sub.amount).toLocaleString()} / month</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-2.5 py-1.5 rounded-lg ${paymentInfo.bg} ${paymentInfo.color} text-xs font-medium`}>
                        <paymentInfo.icon className="w-3.5 h-3.5 mr-1.5" />
                        {paymentInfo.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/subscriptions/${sub.id}`}>
                          <button className="p-1.5 text-[var(--ash)] hover:text-[#6C47FF] hover:bg-[#F3F0FF] rounded-lg transition-colors border border-transparent hover:border-[#E9E4FF]">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => {}} className="p-1.5 text-[var(--ash)] hover:text-[var(--on-primary)] hover:bg-[var(--canvas-paper)] rounded-lg transition-colors border border-transparent hover:border-[var(--hairline)]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--hairline-soft)] bg-[var(--canvas-light)]">
          <div className="text-sm text-[var(--mute)]">
            Showing <span className="font-medium text-[var(--on-primary)]">1</span> to <span className="font-medium text-[var(--on-primary)]">{subscriptions.length}</span> of <span className="font-medium text-[var(--on-primary)]">156</span> subscriptions
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => {}} className="px-2.5 py-1 text-[var(--mute)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">&lt;</button>
            <button onClick={() => {}} className="px-3 py-1 bg-[#6C47FF] text-white rounded font-medium shadow-sm">1</button>
            <button onClick={() => {}} className="px-3 py-1 text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">2</button>
            <button onClick={() => {}} className="px-3 py-1 text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">3</button>
            <span className="px-2 text-[var(--ash)]">...</span>
            <button onClick={() => {}} className="px-3 py-1 text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">26</button>
            <button onClick={() => {}} className="px-2.5 py-1 text-[var(--mute)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}
