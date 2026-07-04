"use client";

import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, QrCode, Copy, Check } from "lucide-react";

interface KioskQRCardProps {
  gymId: string;
  gymName: string;
}

export function KioskQRCard({ gymId, gymName }: KioskQRCardProps) {
  const [copied, setCopied] = useState(false);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(kioskUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] overflow-hidden mb-6">
      
      {/* LEFT - QR Code Image */}
      <div className="flex-shrink-0 p-6 md:pr-0 flex items-center justify-center">
        <div className="bg-[var(--canvas-light)] p-3 border border-[var(--hairline)] rounded-lg shadow-sm">
          <QRCodeCanvas
            id="kiosk-qr-canvas"
            value={kioskUrl}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
            includeMargin={true}
          />
        </div>
      </div>
      
      {/* MIDDLE - Info Section */}
      <div className="flex flex-col flex-1 p-6 justify-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#F3F0FF] flex items-center justify-center">
            <QrCode className="h-5 w-5 text-[#6C47FF]" />
          </div>
          <h2 className="text-[20px] font-bold text-[var(--on-primary)]">Kiosk Check-in QR Code</h2>
        </div>
        <p className="text-[14px] text-[var(--mute)] mb-5 max-w-lg">
          Print and place at gym entrance. Members can scan to quickly check in without assistance.
        </p>
        
        <div className="relative mb-5 max-w-md">
          <input 
            type="text" 
            readOnly 
            value={kioskUrl}
            className="w-full pl-3 pr-10 py-2 bg-[var(--canvas-paper)] border border-[var(--hairline)] rounded-lg text-sm text-[var(--slate-soft)] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20"
          />
          <button 
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--ash)] hover:text-[var(--slate-soft)] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] transition-colors shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-[#F3F0FF] border border-[#E9E4FF] rounded-lg text-sm font-medium text-[#6C47FF] hover:bg-[#E9E4FF] transition-colors shadow-sm"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* RIGHT - Decorative Illustration */}
      <div className="hidden lg:flex w-[30%] bg-gradient-to-br from-[#F8F7FF] to-[#E9E4FF] p-6 relative overflow-hidden items-end justify-center min-h-[240px]">
        
        {/* Plant Decoration */}
        <div className="absolute right-4 bottom-4 w-12 h-24">
          <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 200V100" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
            <path d="M50 150C30 150 10 130 10 100C10 70 50 60 50 100" fill="#22c55e"/>
            <path d="M50 120C70 120 90 100 90 70C90 40 50 30 50 70" fill="#4ade80"/>
            <path d="M48 100C35 100 20 85 20 60C20 35 48 25 48 60" fill="#16a34a"/>
            <path d="M52 80C65 80 80 65 80 40C80 15 52 5 52 40" fill="#22c55e"/>
            {/* Pot */}
            <path d="M30 180H70L65 200H35L30 180Z" fill="#94a3b8"/>
            <path d="M25 170H75V180H25V170Z" fill="#64748b"/>
          </svg>
        </div>

        {/* Tablet/Kiosk */}
        <div className="relative z-10 w-32 h-48 bg-[#2e2e48] rounded-2xl border-4 border-[#1e1e2e] shadow-xl flex flex-col items-center justify-start p-2 rotate-[-5deg] translate-y-4">
          <div className="w-10 h-1 bg-gray-600 rounded-full mb-3 mt-1"></div>
          <div className="w-full bg-[#6C47FF] py-1.5 rounded text-center mb-3">
            <span className="text-[8px] font-bold text-white tracking-wider">SCAN TO CHECK-IN</span>
          </div>
          <div className="w-20 h-20 bg-[var(--canvas-light)] rounded flex items-center justify-center p-1">
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              <QrCode className="w-10 h-10 text-[var(--on-primary)]" />
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-gray-600"></div>
        </div>

        {/* Stand */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-16 bg-[#b4b4c8] -z-0 translate-x-[-10px]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-3 bg-[#8c8c9b] rounded-t-lg -z-0 translate-x-[-10px]"></div>
      </div>
    </div>
  );
}
