"use client";

import { useState } from "react";
import { Plug, MessageSquare, Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/axios";

export default function IntegrationsPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from GymOS! This is a test message.");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await api.post("/api/v1/whatsapp/test", {
        to: phoneNumber,
        text: testMessage,
      });

      if (response.data?.success) {
        setTestResult({ success: true, message: "Test message sent successfully!" });
      } else {
        setTestResult({ success: false, message: response.data?.error || "Failed to send message." });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.response?.data?.message || "Failed to connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-[32px]">
      <div className="mb-[32px]">
        <h2 className="text-[18px] font-semibold tracking-tight text-[#171717] flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Active Integrations
        </h2>
        <p className="text-[14px] text-[#4d4d4d] mt-[4px]">
          Manage your third-party integrations and webhooks.
        </p>
      </div>

      <div className="space-y-6">
        {/* WhatsApp Integration Card */}
        <div className="border border-[#ebebeb] rounded-[8px] p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#25D366]/10 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-[16px] font-medium text-[#171717]">WhatsApp Cloud API</h3>
                <p className="text-[13px] text-[#4d4d4d]">
                  Send automated reminders, payment success, and welcome messages to members.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#fafafa] border border-[#ebebeb] rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span className="text-[12px] font-medium text-[#171717]">Connected via ENV</span>
            </div>
          </div>

          <div className="bg-[#fafafa] rounded-[6px] p-4 border border-[#ebebeb]">
            <h4 className="text-[14px] font-medium text-[#171717] mb-3">Test Integration</h4>
            <form onSubmit={handleTestMessage} className="space-y-3 max-w-md">
              <div>
                <label className="block text-[12px] font-medium text-[#4d4d4d] mb-1">Phone Number (with country code)</label>
                <input
                  type="text"
                  placeholder="e.g. 919876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full h-[36px] px-[12px] rounded-[6px] border border-[#ebebeb] bg-white text-[14px] text-[#171717] outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#4d4d4d] mb-1">Message</label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  required
                  className="w-full h-[36px] px-[12px] rounded-[6px] border border-[#ebebeb] bg-white text-[14px] text-[#171717] outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className="h-[36px] px-[16px] bg-[#171717] text-white text-[14px] font-medium rounded-[6px] hover:bg-[#262626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Test Message"}
              </button>
            </form>

            {testResult && (
              <div className={`mt-4 p-3 rounded-[6px] flex items-center gap-2 text-[13px] font-medium ${testResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
