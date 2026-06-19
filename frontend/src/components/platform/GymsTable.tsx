"use client"

import { useState } from "react"
import { useTenants, useSuspendTenant, useActivateTenant } from "@/hooks/api/usePlatform"
import { TenantStatusBadge } from "./TenantStatusBadge"
import { Button } from "@/components/ui/Button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { format } from "date-fns"
import Link from "next/link"

export function GymsTable() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { data, isLoading } = useTenants({ page, limit: 10, search: debouncedSearch || undefined })
  const suspendMutation = useSuspendTenant()
  const activateMutation = useActivateTenant()

  // Simple debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setTimeout(() => {
      setDebouncedSearch(e.target.value)
      setPage(1)
    }, 500)
  }

  const handleAction = async (id: string, status: string) => {
    if (status === 'SUSPENDED') {
      await activateMutation.mutateAsync(id)
    } else {
      if (confirm('Are you sure you want to suspend this gym?')) {
        await suspendMutation.mutateAsync(id)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#888888]" />
          <Input 
            placeholder="Search gyms..." 
            className="pl-9"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#ebebeb] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#fafafa] text-[#666666]">
              <tr>
                <th className="px-6 py-3 font-medium">Gym Name</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created At</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-[#171717]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#666666]">Loading gyms...</td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#666666]">No gyms found.</td>
                </tr>
              ) : (
                data?.data.map((gym) => (
                  <tr key={gym.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#171717]">{gym.name}</div>
                      <div className="text-[12px] text-[#666666]">{gym.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#171717]">{gym.city || '-'}</div>
                      <div className="text-[12px] text-[#666666]">{gym.country || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <TenantStatusBadge status={gym.status} />
                    </td>
                    <td className="px-6 py-4 text-[#666666]">
                      {format(new Date(gym.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/platform/gyms/${gym.id}`}>View</Link>
                        </Button>
                        <Button 
                          variant={gym.status === 'SUSPENDED' ? 'primary' : 'destructive'} 
                          size="sm"
                          onClick={() => handleAction(gym.id, gym.status)}
                          disabled={suspendMutation.isPending || activateMutation.isPending}
                        >
                          {gym.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#ebebeb] bg-white px-6 py-3">
            <p className="text-[14px] text-[#666666]">
              Showing <span className="font-medium text-[#171717]">{data.data.length}</span> of{' '}
              <span className="font-medium text-[#171717]">{data.meta.total}</span> results
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
