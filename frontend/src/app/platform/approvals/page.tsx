"use client"

import * as React from "react"
import { superadminService, PendingTenant } from "@/services/superadmin.service"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/States"

export default function ApprovalsPage() {
  const [tenants, setTenants] = React.useState<PendingTenant[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchTenants = async () => {
    try {
      const data = await superadminService.getPendingTenants()
      setTenants(data)
    } catch (err) {
      console.error("Failed to fetch pending tenants", err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTenants()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await superadminService.approveTenant(id)
      setTenants((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Failed to approve tenant", err)
      alert("Failed to approve tenant.")
    }
  }

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject and delete this application?")) return
    try {
      await superadminService.rejectTenant(id)
      setTenants((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Failed to reject tenant", err)
      alert("Failed to reject tenant.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-semibold text-[#171717]">Pending Approvals</h1>
        <p className="text-[14px] text-[#666666] mt-1">Review and approve new gym registrations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <EmptyState 
            title="No Pending Applications" 
            description="There are currently no new gym registrations waiting for approval." 
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    <div className="text-sm text-gray-500">{tenant.email}</div>
                    {tenant.phone && <div className="text-xs text-gray-400 mt-1">{tenant.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tenant.users[0]?.firstName} {tenant.users[0]?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{tenant.users[0]?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleApprove(tenant.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReject(tenant.id)}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
