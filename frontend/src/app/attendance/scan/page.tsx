"use client"

import * as React from "react"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useScanQr } from "@/hooks/api/useAttendances"
import { QrScanner } from "@/components/attendance/QrScanner"

type ScanResult = {
  status: "idle" | "success" | "error"
  message?: string
  memberName?: string
}

export default function QrScannerPage() {
  const [scanResult, setScanResult] = React.useState<ScanResult>({ status: "idle" })
  const [isScanning, setIsScanning] = React.useState(true)
  const scanQrMutation = useScanQr()

  // Prevent multiple rapid scans
  const isProcessingRef = React.useRef(false)

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current || !isScanning) return
    isProcessingRef.current = true

    try {
      const attendance = await scanQrMutation.mutateAsync(decodedText)
      setScanResult({
        status: "success",
        memberName: attendance.member ? `${attendance.member.firstName} ${attendance.member.lastName}` : "Member",
        message: "Successfully checked in!",
      })
      setIsScanning(false)
    } catch (error: any) {
      let errorMessage = "Invalid or expired QR code"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      setScanResult({
        status: "error",
        message: errorMessage,
      })
      setIsScanning(false)
    } finally {
      isProcessingRef.current = false
    }
  }

  const handleScanFailure = (error: any) => {
    // html5-qrcode calls failure continuously when no QR is in view. We usually ignore it.
    // console.warn(error)
  }

  const resetScanner = () => {
    setScanResult({ status: "idle" })
    setIsScanning(true)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-[#171717]">QR Check-In</h1>
        <p className="text-sm text-[#888888]">Scan member QR code to mark attendance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Scanner Column */}
        <div className="flex flex-col gap-4">
          {isScanning ? (
            <div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-sm">
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanFailure={handleScanFailure}
              />
            </div>
          ) : (
            <div className="flex h-[350px] flex-col items-center justify-center rounded-lg border border-[#ebebeb] bg-white p-6 text-center shadow-sm">
              {scanResult.status === "success" && (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium text-[#171717]">{scanResult.memberName}</h3>
                  <p className="text-[#888888] mt-2 mb-6">{scanResult.message}</p>
                </>
              )}
              
              {scanResult.status === "error" && (
                <>
                  {scanResult.message === "Already Checked In" ? (
                    <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                  )}
                  <h3 className="text-xl font-medium text-[#171717]">Scan Failed</h3>
                  <p className="text-[#888888] mt-2 mb-6">{scanResult.message}</p>
                </>
              )}

              <Button onClick={resetScanner} variant="primary" size="lg">
                Scan Next Member
              </Button>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="rounded-lg border border-[#ebebeb] bg-white p-6 shadow-sm h-fit">
          <h3 className="font-medium text-[#171717] mb-4">Instructions</h3>
          <ul className="space-y-3 text-sm text-[#888888]">
            <li className="flex gap-2">
              <span className="font-medium text-[#171717]">1.</span>
              <span>Ask the member to open their GymOS profile.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[#171717]">2.</span>
              <span>They should present their active QR code.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-[#171717]">3.</span>
              <span>Point the camera at the code. It will scan automatically.</span>
            </li>
          </ul>
          
          <div className="mt-6 rounded-md bg-[#fafafa] p-4 text-xs text-[#888888]">
            Note: QR codes expire 24 hours after generation for security. 
            Duplicate scans on the same day will be rejected.
          </div>
        </div>
      </div>
    </div>
  )
}
