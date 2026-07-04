import * as React from "react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Search } from "lucide-react"

interface MemberFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
}

export function MemberFilters({
  search,
  setSearch,
  status,
  setStatus,
  gender,
  setGender,
  source,
  setSource,
}: MemberFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-3 mb-6 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--ash)]" />
        <input
          placeholder="Search members by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:border-transparent transition-all h-[44px]"
        />
      </div>
      <div className="flex flex-row gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide shrink-0">
        <div className="relative shrink-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-[160px] appearance-none bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2.5 text-sm text-[var(--ink-soft)] h-[44px] focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING">Pending</option>
          </select>
          <svg className="w-4 h-4 text-[var(--ash)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <div className="relative shrink-0">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-[160px] appearance-none bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2.5 text-sm text-[var(--ink-soft)] h-[44px] focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
          <svg className="w-4 h-4 text-[var(--ash)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <div className="relative shrink-0">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-[160px] appearance-none bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2.5 text-sm text-[var(--ink-soft)] h-[44px] focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
          >
            <option value="">All Sources</option>
            <option value="WALK_IN">Walk In</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="REFERRAL">Referral</option>
            <option value="WEBSITE">Website</option>
            <option value="OTHER">Other</option>
          </select>
          <svg className="w-4 h-4 text-[var(--ash)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <button className="flex items-center justify-center gap-2 bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-4 h-[44px] text-sm text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] transition-colors shrink-0">
          <svg className="w-4 h-4 text-[var(--mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  )
}
