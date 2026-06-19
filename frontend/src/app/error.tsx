'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled frontend error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-semibold text-neutral-950">Something went wrong!</h2>
      <p className="mt-2 text-neutral-500 max-w-md">
        An unexpected error occurred. We've been notified and are looking into it.
      </p>
      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => reset()}
          variant="outline"
        >
          Try again
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="primary"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
