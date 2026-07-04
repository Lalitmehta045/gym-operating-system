"use client"

import { useTenants } from "@/hooks/api/usePlatform"
import { TenantStatusBadge } from "./TenantStatusBadge"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/Button"

export function SubscriptionTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { data, isLoading } = useTenants({ page, limit: 10, search: debouncedSearch || undefined })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--ash)]" />
          <Input 
            placeholder="Search by gym..." 
            className="pl-9"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[var(--canvas-soft)] text-[#666666]">
              <tr>
                <th className="px-6 py-3 font-medium">Gym</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Start Date</th>
                <th className="px-6 py-3 font-medium">Expiry Date</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-[var(--on-primary)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#666666]">Loading subscriptions...</td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#666666]">No subscriptions found.</td>
                </tr>
              ) : (
                data?.data.map((gym) => (
                  <tr key={gym.id} className="hover:bg-[var(--canvas-soft)] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/platform/gyms/${gym.id}`} className="font-medium text-[var(--on-primary)] hover:underline">
                        {gym.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[#666666]">
                      Growth
                    </td>
                    <td className="px-6 py-4">
                      <TenantStatusBadge status={gym.status} />
                    </td>
                    <td className="px-6 py-4 text-[#666666]">
                      {format(new Date(gym.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-[#666666]">
                      {format(new Date(new Date(gym.createdAt).setFullYear(new Date(gym.createdAt).getFullYear() + 1)), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹79.00
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--hairline-soft)] bg-[var(--canvas-light)] px-6 py-3">
            <p className="text-[14px] text-[#666666]">
              Showing <span className="font-medium text-[var(--on-primary)]">{data.data.length}</span> of{' '}
              <span className="font-medium text-[var(--on-primary)]">{data.meta.total}</span> results
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.meta.hasPreviousPage}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={!data.meta.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
