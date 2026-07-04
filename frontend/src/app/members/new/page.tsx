"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MemberForm } from "@/components/members/MemberForm"
import { useCreateMember } from "@/hooks/api/useMembers"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <div>
          <Link href="/members" className="inline-flex items-center text-sm text-[var(--mute)] hover:text-[var(--on-primary)] mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-[var(--on-primary)]">Create Member</h1>
          <p className="text-sm text-[var(--mute)] mt-1">Add a new member to the system</p>
        </div>

        <MemberForm
          onSubmit={handleSubmit}
          isLoading={createMember.isPending}
        />
      </div>
    </div>
  )
}
