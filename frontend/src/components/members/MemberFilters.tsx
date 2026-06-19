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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:flex-none">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="EXPIRED">Expired</option>
          <option value="PENDING">Pending</option>
        </Select>

        <Select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full sm:w-[150px]"
        >
          <option value="">All Genders</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </Select>

        <Select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full sm:w-[150px]"
        >
          <option value="">All Sources</option>
          <option value="WALK_IN">Walk In</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="REFERRAL">Referral</option>
          <option value="WEBSITE">Website</option>
          <option value="OTHER">Other</option>
        </Select>
      </div>
    </div>
  )
}
