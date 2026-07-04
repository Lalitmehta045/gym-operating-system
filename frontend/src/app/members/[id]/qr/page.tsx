"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useMember, useMemberQr } from "@/hooks/api/useMembers"
import api from "@/lib/axios"

export default function MemberQrPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: member, isLoading: isLoadingMember } = useMember(id)
  const { data: qrData, isLoading: isLoadingQr, refetch, isRefetching } = useMemberQr(id)

  const handleDownload = async () => {
    try {
      const response = await api.get(`/members/${id}/qr/download`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `member-${id}-qr.png`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (error) {
      console.error("Failed to download QR code:", error)
    }
  }

  if (isLoadingMember || isLoadingQr) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-sm text-[var(--ash)]">Loading QR code...</p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-sm text-[var(--ash)]">Member not found.</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--on-primary)]">Attendance QR Code</h1>
          <p className="text-sm text-[var(--ash)]">
            {member.firstName} {member.lastName}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-8 text-center shadow-sm">
        <div className="mx-auto flex aspect-square max-w-[300px] flex-col items-center justify-center rounded-lg border border-[var(--hairline-soft)] bg-[var(--canvas-soft)] p-4">
          {qrData?.qrCodeUrl ? (
            <img
              src={qrData.qrCodeUrl}
              alt={`${member.firstName} QR Code`}
              className="h-full w-full object-contain"
            />
          ) : (
            <p className="text-sm text-[var(--ash)]">QR code not available</p>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={!qrData?.qrCodeUrl}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        
        <p className="mt-6 text-xs text-[var(--ash)]">
          This QR code is securely signed and will expire in 24 hours. Provide this to the member for quick check-ins.
        </p>
      </div>
    </div>
  )
}
