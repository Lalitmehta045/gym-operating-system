"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MemberTable } from "@/components/members/MemberTable"
import { MemberFilters } from "@/components/members/MemberFilters"
import { useMembers, useDeleteMember, useRestoreMember } from "@/hooks/api/useMembers"
import { useDashboardMembers } from "@/hooks/api/useDashboard"
import { useAuth } from "@/hooks/useAuth"
import { useUrlFilters } from "@/hooks/useUrlFilters"
import { useDebounce } from "@/hooks/useDebounce"

export default function MembersPage() {
  const { user } = useAuth()
  const canManage = user?.role === "OWNER" || user?.role === "MANAGER"

  const { getFilter, setFilter, setFilters, clearFilters } = useUrlFilters()

  const [localSearch, setLocalSearch] = React.useState(getFilter("search"))
  const debouncedSearch = useDebounce(localSearch, 300)

  React.useEffect(() => {
    setFilter("search", debouncedSearch)
  }, [debouncedSearch, setFilter])

  const status = getFilter("status")
  const gender = getFilter("gender")
  const source = getFilter("source")
  const dateFrom = getFilter("dateFrom")
  const dateTo = getFilter("dateTo")
  const membershipStatus = getFilter("membershipStatus")
  
  const pageParam = getFilter("page")
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const { data, isLoading } = useMembers({
    page,
    search: getFilter("search"),
    status,
    gender,
    source,
    dateFrom,
    dateTo,
    membershipStatus,
    includeInactive: true,
  })

  // Dashboard members endpoint returns accurate per-status counts for this tenant
  const { data: membersStats, isError: statsError } = useDashboardMembers()
  const showMetricCards = !statsError && user?.role !== 'TRAINER';

  const deleteMember = useDeleteMember()
  const restoreMember = useRestoreMember()

  const handleDelete = async (id: string) => {
    try {
      await deleteMember.mutateAsync(id)
    } catch (error) {
      console.error("Failed to delete member:", error)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreMember.mutateAsync(id)
    } catch (error) {
      console.error("Failed to restore member:", error)
    }
  }

  // Metric card values — sourced from /dashboard/members which groups by status server-side
  const totalMembers = membersStats?.totalMembers ?? 0
  const activeMembers = membersStats?.activeMembers ?? 0
  const inactiveMembers = (membersStats?.inactiveMembers ?? 0) + (membersStats?.suspendedMembers ?? 0)
  const newThisMonth = membersStats?.newMembersThisMonth ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] tracking-tight leading-tight">Members</h1>
          <p className="text-[14px] text-[var(--mute)] mt-1">Manage your gym members and their information.</p>
        </div>
        {canManage && (
          <Link href="/members/new">
            <button className="flex items-center gap-2 bg-[#6C47FF] hover:bg-[#5b3ce0] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </Link>
        )}
      </div>

      {/* Metric Cards */}
      {showMetricCards && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-[var(--canvas-light)] rounded-xl p-5 border border-[var(--hairline-soft)] shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-[var(--mute)]">Total Members</p>
              <h3 className="text-2xl font-bold text-[var(--on-primary)] mt-0.5">{isLoading ? "—" : totalMembers}</h3>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <p className="text-[11px] text-[var(--mute)]">All registered members</p>
            <svg className="w-16 h-4 text-[#EF4444] opacity-50 absolute bottom-3 right-4" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 C20,20 40,0 60,10 C80,20 100,0 100,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-[var(--canvas-light)] rounded-xl p-5 border border-[var(--hairline-soft)] shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-[var(--mute)]">Active Members</p>
              <h3 className="text-2xl font-bold text-[var(--on-primary)] mt-0.5">{isLoading ? "—" : activeMembers}</h3>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <p className="text-[11px] text-[var(--mute)]">Currently active</p>
            <svg className="w-16 h-4 text-[#16A34A] opacity-50 absolute bottom-3 right-4" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 C20,20 40,0 60,10 C80,20 100,0 100,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Inactive Members */}
        <div className="bg-[var(--canvas-light)] rounded-xl p-5 border border-[var(--hairline-soft)] shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-[var(--mute)]">Inactive Members</p>
              <h3 className="text-2xl font-bold text-[var(--on-primary)] mt-0.5">{isLoading ? "—" : inactiveMembers}</h3>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <p className="text-[11px] text-[var(--mute)]">Not currently active</p>
            <svg className="w-16 h-4 text-[#D97706] opacity-50 absolute bottom-3 right-4" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 C20,20 40,0 60,10 C80,20 100,0 100,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-[var(--canvas-light)] rounded-xl p-5 border border-[var(--hairline-soft)] shadow-sm relative overflow-hidden flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-[var(--mute)]">New This Month</p>
              <h3 className="text-2xl font-bold text-[var(--on-primary)] mt-0.5">{isLoading ? "—" : newThisMonth}</h3>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <p className="text-[11px] text-[var(--mute)]">Joined this month</p>
            <svg className="w-16 h-4 text-[#7C3AED] opacity-50 absolute bottom-3 right-4" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 C20,20 40,0 60,10 C80,20 100,0 100,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
      )}

      <MemberFilters
        search={localSearch}
        setSearch={setLocalSearch}
        status={status}
        setStatus={(val) => setFilter("status", val)}
        gender={gender}
        setGender={(val) => setFilter("gender", val)}
        source={source}
        setSource={(val) => setFilter("source", val)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        membershipStatus={membershipStatus}
        onApplyAdvancedFilters={(filters) => setFilters(filters)}
        onClearAdvancedFilters={() => clearFilters(["search", "status", "gender", "source"])}
      />

      <MemberTable
        members={data?.data || []}
        meta={data?.meta}
        page={page}
        onPageChange={(p) => setFilter("page", p.toString())}
        isLoading={isLoading}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />
    </div>
  )
}
