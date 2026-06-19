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
    <div className="mx-auto max-w-md w-full space-y-6 rounded-[8px] border border-[#ebebeb] bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#171717]">Member Check-In</h2>
        
        {feedback && (
          <div className={`p-3 text-sm rounded-[6px] ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {feedback.message}
          </div>
        )}

        <div className="relative">
          <Input
            placeholder="Search member by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {search.length >= 2 && (
          <div className="mt-2 rounded-[6px] border border-[#ebebeb] divide-y divide-[#ebebeb] max-h-[200px] overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-sm text-[#888888] text-center">Searching...</div>
            ) : membersData?.data && membersData.data.length > 0 ? (
              membersData.data.map(member => (
                <div 
                  key={member.id} 
                  className={`flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[#fafafa] ${selectedMemberId === member.id ? 'bg-[#fafafa] border-l-2 border-l-[#171717]' : ''}`}
                  onClick={() => handleSelectMember(member.id)}
                >
                  <div>
                    <p className="font-medium text-[#171717]">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-[#888888]">{member.memberCode} • {member.phone}</p>
                  </div>
                  {selectedMemberId === member.id && (
                    <UserCheck className="h-5 w-5 text-[#171717]" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-[#888888] text-center">No members found.</div>
            )}
          </div>
        )}

        <Button 
          variant="primary" 
          className="w-full" 
          disabled={!selectedMemberId || checkInMutation.isPending}
          onClick={handleCheckIn}
        >
          {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
        </Button>
      </div>
    </div>
  )
}
