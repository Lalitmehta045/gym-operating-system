"use client"

import * as React from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanFailure?: (error: any) => void
}

export function QrScanner({ onScanSuccess, onScanFailure }: QrScannerProps) {
  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null)

  React.useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE,
          ],
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText)
          // Optional: we can pause or clear scanner after successful scan
          // scannerRef.current?.pause()
        },
        (error) => {
          if (onScanFailure) {
            onScanFailure(error)
          }
        }
      )
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error)
        })
        scannerRef.current = null
      }
    }
  }, [onScanSuccess, onScanFailure])

  return <div id="qr-reader" className="w-full max-w-md mx-auto overflow-hidden rounded-lg border border-[#ebebeb] bg-white" />
}
