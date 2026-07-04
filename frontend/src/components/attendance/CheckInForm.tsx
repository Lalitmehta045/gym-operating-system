"use client"

import * as React from "react"
import { useMembers } from "@/hooks/api/useMembers"
import { useCheckIn } from "@/hooks/api/useAttendances"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Search, UserCheck } from "lucide-react"

export function CheckInForm() {
  const [search, setSearch] = React.useState("")
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null)
  
  // Minimal search using useMembers
  // In a real large scale app, this might be debounced
  const { data: membersData, isLoading: isSearching } = useMembers({
    search: search.length >= 2 ? search : undefined,
    limit: 5,
    status: 'ACTIVE'
  })

  const checkInMutation = useCheckIn()
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id)
  }

  const handleCheckIn = async () => {
    if (!selectedMemberId) return
    setFeedback(null)
    
    try {
      await checkInMutation.mutateAsync({ memberId: selectedMemberId })
      setFeedback({ type: 'success', message: 'Member checked in successfully!' })
      // Reset form
      setSearch("")
      setSelectedMemberId(null)
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setFeedback({ type: 'error', message: error?.response?.data?.message || 'Failed to check in member.' })
    }
  }

  return (
    <div className="mx-auto max-w-[600px] w-full bg-[var(--canvas-light)] rounded-xl shadow-md p-8 border border-[var(--hairline-soft)]">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 p-2 rounded-lg text-[#6C47FF]">
            <UserCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--on-primary)]">Member Check-In</h2>
        </div>
        
        {feedback && (
          <div className={`p-3 text-sm rounded-lg ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {feedback.message}
          </div>
        )}

        <div className="relative">
          <Input
            placeholder="Search member by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-[52px] rounded-xl border-[var(--hairline)] text-base"
          />
          <Search className="absolute left-4 top-4 h-5 w-5 text-[var(--ash)]" />
        </div>

        {search.length >= 2 && (
          <div className="mt-2 rounded-xl border border-[var(--hairline)] divide-y divide-gray-100 max-h-[240px] overflow-y-auto bg-[var(--canvas-light)] shadow-sm">
            {isSearching ? (
              <div className="p-4 text-sm text-[var(--mute)] text-center">Searching...</div>
            ) : membersData?.data && membersData.data.length > 0 ? (
              membersData.data.map(member => (
                <div 
                  key={member.id} 
                  className={`flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[var(--canvas-paper)] ${selectedMemberId === member.id ? 'bg-purple-50/50 border-l-4 border-[#6C47FF]' : 'border-l-4 border-transparent'}`}
                  onClick={() => handleSelectMember(member.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6C47FF] flex items-center justify-center font-bold text-sm">
                      {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--on-primary)]">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-[var(--mute)]">{member.email || `${member.memberCode} • ${member.phone}`}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span>
                    <span className="text-xs text-[var(--mute)]">General Plan</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-[var(--mute)] text-center">No members found.</div>
            )}
          </div>
        )}

        <Button 
          variant="primary" 
          className={`w-full h-[48px] rounded-xl text-base font-medium flex items-center justify-center gap-2 ${!selectedMemberId ? 'bg-[var(--canvas-paper)] text-[var(--ash)] hover:bg-[var(--canvas-paper)] border-none' : 'bg-[#6C47FF] text-white hover:bg-purple-700'}`}
          disabled={!selectedMemberId || checkInMutation.isPending}
          onClick={handleCheckIn}
        >
          <UserCheck className="w-5 h-5" />
          {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
        </Button>
      </div>
    </div>
  )
}
