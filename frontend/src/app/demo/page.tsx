import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-[var(--spacing-lg)]">
        <div className="w-full max-w-[600px] text-center space-y-[var(--spacing-md)]">
          <h1 className="text-display-md text-[var(--on-primary)]">Book a Demo</h1>
          <p className="text-subtitle text-[var(--ash)]">
            We are currently setting up our calendar for personalized demonstrations. 
            In the meantime, you can get started right away!
          </p>
          
          <div className="pt-[var(--spacing-md)] flex flex-col sm:flex-row items-center justify-center gap-[var(--spacing-sm)]">
            <Link href="/register" className="button-primary">
              Get Started Free
            </Link>
            <Link href="/" className="button-secondary-dark">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
