"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface KioskQRCardProps {
  gymId: string;
  gymName: string;
}

export function KioskQRCard({ gymId, gymName }: KioskQRCardProps) {
  const kioskUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/kiosk/${gymId}`;

  const handleDownload = () => {
    const canvas = document.getElementById("kiosk-qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `kiosk-qr-${gymName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const canvas = document.getElementById("kiosk-qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Kiosk QR - ${gymName}</title>
          <style>
            body {
              text-align: center;
              padding: 40px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            img {
              max-width: 300px;
              margin: 20px 0;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 10px;
            }
            p {
              font-size: 24px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${gymName}</h1>
            <img src="${dataUrl}" alt="Kiosk QR Code" />
            <p>Scan to Check In</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-[24px] rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
      <div className="flex-shrink-0 bg-white p-4 border border-zinc-200 rounded-xl shadow-sm">
        <QRCodeCanvas
          id="kiosk-qr-canvas"
          value={kioskUrl}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="h-5 w-5 text-[#171717]" />
          <h2 className="text-[20px] font-semibold text-[#171717]">Kiosk Check-in QR Code</h2>
        </div>
        <p className="text-[14px] text-[#4d4d4d] mb-6">
          Print and place at gym entrance. Members can scan to quickly check in without assistance.
        </p>
        
        <div className="bg-[#fafafa] px-4 py-2 rounded-md mb-6 w-full overflow-hidden border border-[#ebebeb]">
          <p className="text-[13px] text-[#888888] truncate select-all">{kioskUrl}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={handleDownload}
            className="flex-1 md:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            className="flex-1 md:flex-none"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
