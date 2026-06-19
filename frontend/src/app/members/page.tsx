"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MemberTable } from "@/components/members/MemberTable"
import { MemberFilters } from "@/components/members/MemberFilters"
import { useMembers, useDeleteMember, useRestoreMember } from "@/hooks/api/useMembers"

export default function MembersPage() {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [gender, setGender] = React.useState("")
  const [source, setSource] = React.useState("")

  const { data, isLoading } = useMembers({
    search,
    status,
    gender,
    source,
  })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Members</h1>
          <p className="text-sm text-[#888888]">Manage your gym members</p>
        </div>
        <Link href="/members/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      <MemberFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        gender={gender}
        setGender={setGender}
        source={source}
        setSource={setSource}
      />

      <MemberTable
        members={data?.data || []}
        isLoading={isLoading}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />
    </div>
  )
}
