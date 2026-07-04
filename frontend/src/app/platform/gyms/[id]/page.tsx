"use client"

import { use } from "react"
import { useTenant, useSuspendTenant, useActivateTenant } from "@/hooks/api/usePlatform"
import { TenantStatusBadge } from "@/components/platform/TenantStatusBadge"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"
import { Building2, Mail, MapPin, Phone, Users, Repeat, Clock, DollarSign } from "lucide-react"

export default function PlatformGymDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Extract id from promise directly, next 15+ needs this pattern for async params
  const { id } = use(params)
  
  const { data: gym, isLoading } = useTenant(id)
  const suspendMutation = useSuspendTenant()
  const activateMutation = useActivateTenant()

  if (isLoading || !gym) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="h-64 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)]"></div>
          </div>
          <div className="col-span-1 space-y-6">
            <div className="h-64 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)]"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleAction = async () => {
    if (gym.status === 'SUSPENDED') {
      await activateMutation.mutateAsync(id)
    } else {
      if (confirm('Are you sure you want to suspend this gym?')) {
        await suspendMutation.mutateAsync(id)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-[var(--canvas-soft)] border border-[var(--hairline-soft)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-[#a3a3a3]" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[var(--on-primary)] flex items-center gap-3">
                {gym.name}
                <TenantStatusBadge status={gym.status} />
              </h1>
              <p className="text-[14px] text-[#666666] mt-1">ID: {gym.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={gym.status === 'SUSPENDED' ? 'primary' : 'destructive'}
              onClick={handleAction}
              disabled={suspendMutation.isPending || activateMutation.isPending}
            >
              {gym.status === 'SUSPENDED' ? 'Activate Gym' : 'Suspend Gym'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="col-span-2 space-y-6">
          {/* Gym Information */}
          <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6">
            <h3 className="text-[16px] font-medium text-[var(--on-primary)] mb-4">Gym Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">Email</span>
                <div className="flex items-center mt-1 text-[var(--on-primary)] text-[14px]">
                  <Mail className="w-4 h-4 mr-2 text-[#666666]" />
                  {gym.email}
                </div>
              </div>
              <div>
                <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">Phone</span>
                <div className="flex items-center mt-1 text-[var(--on-primary)] text-[14px]">
                  <Phone className="w-4 h-4 mr-2 text-[#666666]" />
                  {gym.phone || '-'}
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">Address</span>
                <div className="flex items-center mt-1 text-[var(--on-primary)] text-[14px]">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-[#666666]" />
                  <span>
                    {gym.address ? `${gym.address}, ` : ''}
                    {gym.city ? `${gym.city}, ` : ''}
                    {gym.state ? `${gym.state}, ` : ''}
                    {gym.country || '-'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">GST Number</span>
                <div className="mt-1 text-[var(--on-primary)] text-[14px]">{gym.gstNumber || '-'}</div>
              </div>
              <div>
                <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">Timezone</span>
                <div className="mt-1 text-[var(--on-primary)] text-[14px]">{gym.timezone}</div>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6">
            <h3 className="text-[16px] font-medium text-[var(--on-primary)] mb-4">Owner Information</h3>
            {gym.owner ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">Name</span>
                  <div className="mt-1 text-[var(--on-primary)] text-[14px]">{gym.owner.firstName} {gym.owner.lastName}</div>
                </div>
                <div>
                  <span className="text-[12px] text-[var(--ash)] font-medium uppercase tracking-wider">Email</span>
                  <div className="flex items-center mt-1 text-[var(--on-primary)] text-[14px]">
                    <Mail className="w-4 h-4 mr-2 text-[#666666]" />
                    {gym.owner.email}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[#666666] text-[14px]">No owner information available.</p>
            )}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6">
            <h3 className="text-[16px] font-medium text-[var(--on-primary)] mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#666666] text-[14px]">
                  <Users className="w-4 h-4 mr-2" /> Members
                </div>
                <span className="font-medium text-[var(--on-primary)]">{gym.memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#666666] text-[14px]">
                  <Repeat className="w-4 h-4 mr-2" /> Subscriptions
                </div>
                <span className="font-medium text-[var(--on-primary)]">{gym.subscriptionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#666666] text-[14px]">
                  <Clock className="w-4 h-4 mr-2" /> Joined
                </div>
                <span className="text-[var(--on-primary)] text-[14px]">
                  {format(new Date(gym.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6">
            <h3 className="text-[16px] font-medium text-[var(--on-primary)] mb-4">Platform Subscription</h3>
            <div className="p-4 bg-[var(--canvas-soft)] rounded-lg border border-[var(--hairline-soft)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium text-[var(--on-primary)]">Current Plan</span>
                <span className="text-[12px] bg-[#171717] text-white px-2 py-0.5 rounded-full">Growth</span>
              </div>
              <div className="flex items-center text-[24px] font-semibold text-[var(--on-primary)] mt-2 mb-1">
                <DollarSign className="w-5 h-5 text-[#666666] mr-1" />
                79<span className="text-[14px] text-[var(--ash)] font-normal">/mo</span>
              </div>
              <p className="text-[12px] text-[#666666] mt-2 border-t border-[var(--hairline-soft)] pt-2">
                Next billing date: {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
