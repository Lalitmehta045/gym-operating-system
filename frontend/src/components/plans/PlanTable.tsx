import * as React from "react"
import Link from "next/link"
import { Edit, MoreVertical, Crown, Star, Dumbbell, Clock, User, Building2, Users } from "lucide-react"
import { Plan } from "@/hooks/api/usePlans"
import { useAuth } from "@/hooks/useAuth"

interface PlanTableProps {
  plans: Plan[]
  isLoading: boolean
  onDelete: (id: string) => void
}

const getPlanVisuals = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('premium') || n.includes('pro')) return { type: 'Premium', colorText: 'text-[#6C47FF]', colorBg: 'bg-[#F3F0FF]', colorBorder: 'border-purple-200', icon: Crown };
  if (n.includes('basic') || n.includes('starter')) return { type: 'Basic', colorText: 'text-[#F59E0B]', colorBg: 'bg-[#FEF3C7]', colorBorder: 'border-orange-200', icon: Dumbbell };
  if (n.includes('trial') || n.includes('free')) return { type: 'Trial', colorText: 'text-[#0D9488]', colorBg: 'bg-[#CCFBF1]', colorBorder: 'border-teal-200', icon: Clock };
  if (n.includes('student')) return { type: 'Student', colorText: 'text-[#EC4899]', colorBg: 'bg-[#FCE7F3]', colorBorder: 'border-pink-200', icon: User };
  if (n.includes('corporate')) return { type: 'Corporate', colorText: 'text-[#4B5563]', colorBg: 'bg-[#F3F4F6]', colorBorder: 'border-gray-300', icon: Building2 };
  
  return { type: 'Standard', colorText: 'text-[#3B82F6]', colorBg: 'bg-[#DBEAFE]', colorBorder: 'border-blue-200', icon: Star };
}

const getDeterministicMockMembers = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 150) + 1;
}

const formatDuration = (days: number) => {
  if (days % 30 === 0 && days >= 30) {
    const months = Math.round(days / 30);
    return `${months} Month${months > 1 ? 's' : ''}`;
  }
  return `${days} Days`;
}

export function PlanTable({ plans, isLoading, onDelete }: PlanTableProps) {
  const { user } = useAuth()
  const isOwner = user?.role === "OWNER"

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm">
        <div className="text-sm text-[var(--mute)]">Loading plans...</div>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm">
        <div className="text-sm text-[var(--mute)] mb-4">No plans found</div>
        {isOwner && (
          <Link href="/plans/new">
            <button className="px-4 py-2 bg-[#6C47FF] hover:bg-[#5b3ce0] text-white rounded-lg text-sm font-medium transition-colors">
              Create your first plan
            </button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--canvas-paper)] text-xs uppercase text-[var(--mute)] font-medium border-b border-[var(--hairline-soft)]">
            <tr>
              <th className="px-6 py-4 font-medium">Plan Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Members</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {plans.map((plan) => {
              const visuals = getPlanVisuals(plan.name)
              const Icon = visuals.icon
              const mockMembersCount = getDeterministicMockMembers(plan.id)

              return (
                <tr key={plan.id} className="hover:bg-[var(--canvas-paper)]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${visuals.colorBg}`}>
                        <Icon className={`w-5 h-5 ${visuals.colorText}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--on-primary)]">{plan.name}</div>
                        <div className="text-xs text-[var(--mute)] line-clamp-1 max-w-[200px]">
                          {plan.description || "No description provided"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border ${visuals.colorBorder} ${visuals.colorText} ${visuals.colorBg} bg-opacity-40 text-xs font-semibold tracking-wide`}>
                      {visuals.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--ink-soft)]">{formatDuration(plan.durationDays)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--on-primary)]">
                      ₹{plan.price.toLocaleString()} <span className="text-[var(--mute)] font-normal">/ month</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[var(--slate-soft)] font-medium">
                      <Users className="w-4 h-4 text-[var(--ash)]" />
                      {mockMembersCount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {plan.isActive ? (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1.5"></div>
                        Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] mr-1.5"></div>
                        Inactive
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isOwner ? (
                        <>
                          <Link href={`/plans/${plan.id}/edit`}>
                            <button className="p-1.5 text-[var(--ash)] hover:text-[#6C47FF] hover:bg-[#F3F0FF] rounded-lg transition-colors border border-transparent hover:border-[#E9E4FF]" title="Edit Plan">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button onClick={() => {}} className="p-1.5 text-[var(--ash)] hover:text-[var(--on-primary)] hover:bg-[var(--canvas-paper)] rounded-lg transition-colors border border-transparent hover:border-[var(--hairline)]" title="Options">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => {}} className="p-1.5 text-[var(--ash)] hover:text-[var(--on-primary)] hover:bg-[var(--canvas-paper)] rounded-lg transition-colors border border-transparent hover:border-[var(--hairline)]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
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
          Showing <span className="font-medium text-[var(--on-primary)]">1</span> to <span className="font-medium text-[var(--on-primary)]">{plans.length}</span> of <span className="font-medium text-[var(--on-primary)]">6</span> plans
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => {}} className="px-2.5 py-1 text-[var(--mute)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">&lt;</button>
          <button onClick={() => {}} className="px-3 py-1 bg-[#6C47FF] text-white rounded font-medium shadow-sm">1</button>
          <button onClick={() => {}} className="px-2.5 py-1 text-[var(--mute)] hover:bg-[var(--canvas-paper)] rounded border border-transparent transition-colors">&gt;</button>
        </div>
      </div>
    </div>
  )
}
