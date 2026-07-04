"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, ArrowLeft, QrCode } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MemberProfile } from "@/components/members/MemberProfile"
import { useMember } from "@/hooks/api/useMembers"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { ActivityTimeline } from "@/components/audit/ActivityTimeline"

export default function MemberDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string

  const { data: member, isLoading, isError } = useMember(memberId)

  if (isLoading) return <LoadingState />
  if (isError || !member) return <ErrorState title="Failed to load member" description="The member may not exist or an error occurred." />

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="md" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--on-primary)]">Member Details</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/members/${memberId}/qr`}>
            <Button variant="secondary">
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Button>
          </Link>
          <Link href={`/members/${memberId}/edit`}>
            <Button variant="primary">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Member
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <MemberProfile member={member} />
        </TabsContent>
        <TabsContent value="timeline">
          <ActivityTimeline memberId={member.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
