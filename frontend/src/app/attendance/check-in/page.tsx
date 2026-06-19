import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CheckInForm } from "@/components/attendance/CheckInForm"

export default function CheckInPage() {
  return (
    <div className="flex flex-col gap-y-[32px]">
      <div className="flex flex-col gap-y-[8px]">
        <Link href="/attendance" className="inline-flex items-center text-sm text-[#888888] hover:text-[#171717] mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">Quick Check-In</h1>
        <p className="text-[16px] text-[#4d4d4d]">Search for a member and check them in instantly</p>
      </div>

      <div className="flex items-center justify-center py-10">
        <CheckInForm />
      </div>
    </div>
  )
}
