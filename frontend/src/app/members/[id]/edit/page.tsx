"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MemberForm } from "@/components/members/MemberForm"
import { useMember, useUpdateMember } from "@/hooks/api/useMembers"
import { LoadingState, ErrorState } from "@/components/ui/States"

export default function EditMemberPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string

  const { data: member, isLoading: isFetching, isError } = useMember(memberId)
  const updateMember = useUpdateMember(memberId)

  const handleSubmit = async (data: any) => {
    try {
      await updateMember.mutateAsync(data)
      router.push(`/members/${memberId}`)
    } catch (error) {
      console.error("Failed to update member:", error)
      // Note: Add toast notification for error
    }
  }

  if (isFetching) return <LoadingState />
  if (isError || !member) return <ErrorState title="Failed to load member" description="The member may not exist or an error occurred." />

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" size="md" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Edit Member</h1>
          <p className="text-sm text-[#888888]">Update {member.firstName} {member.lastName}'s details</p>
        </div>
      </div>

      <MemberForm
        initialData={member}
        onSubmit={handleSubmit}
        isLoading={updateMember.isPending}
        isEdit={true}
      />
    </div>
  )
}
