"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MemberForm } from "@/components/members/MemberForm"
import { useCreateMember } from "@/hooks/api/useMembers"

export default function CreateMemberPage() {
  const router = useRouter()
  const createMember = useCreateMember()

  const handleSubmit = async (data: any) => {
    try {
      await createMember.mutateAsync(data)
      router.push("/members")
    } catch (error) {
      console.error("Failed to create member:", error)
      // Note: Ideally, error handling (e.g. toast notification) should be added here
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-[#171717]">Create Member</h1>
        <p className="text-sm text-[#888888]">Add a new member to the system</p>
      </div>

      <MemberForm
        onSubmit={handleSubmit}
        isLoading={createMember.isPending}
      />
    </div>
  )
}
