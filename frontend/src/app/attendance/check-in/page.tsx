import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CheckInForm } from "@/components/attendance/CheckInForm"

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-4xl mx-auto space-y-6 px-4">
        <div>
          <Link href="/attendance" className="inline-flex items-center text-sm text-[var(--mute)] hover:text-[var(--on-primary)] mb-4 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[var(--on-primary)]">Quick Check-In</h1>
          <p className="text-sm text-[var(--mute)] mt-1">Search for a member and check them in instantly</p>
        </div>

        <div className="flex items-center justify-center py-10">
          <CheckInForm />
        </div>
      </div>
    </div>
  )
}
