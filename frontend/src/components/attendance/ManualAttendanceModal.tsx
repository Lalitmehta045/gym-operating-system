"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { useManualAttendance } from "@/hooks/api/useAttendances"
import { useMembers } from "@/hooks/api/useMembers"
import { Search, X, User } from "lucide-react"

const manualAttendanceSchema = z.object({
  memberId: z.string().uuid("Please select a member"),
  attendanceDate: z.string().min(1, "Date is required"),
  status: z.enum(["COMPLETED", "ABSENT", "MANUAL"]),
  notes: z.string().max(5000).optional().or(z.literal("")),
})

type ManualAttendanceFormValues = z.infer<typeof manualAttendanceSchema>

interface ManualAttendanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManualAttendanceModal({ open, onOpenChange }: ManualAttendanceModalProps) {
  const manualAttendanceMutation = useManualAttendance()
  const [search, setSearch] = React.useState("")
  const [selectedMember, setSelectedMember] = React.useState<any | null>(null)

  const { data: membersData, isLoading: isSearching } = useMembers({
    search: search.length >= 2 ? search : undefined,
    limit: 5,
    status: 'ACTIVE'
  })

  const form = useForm<ManualAttendanceFormValues>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: {
      memberId: "",
      attendanceDate: "",
      status: "COMPLETED",
      notes: "",
    },
  })

  const handleSelectMember = (member: any) => {
    setSelectedMember(member)
    form.setValue("memberId", member.id, { shouldValidate: true })
    setSearch("")
  }

  const handleClearMember = () => {
    setSelectedMember(null)
    form.setValue("memberId", "")
  }

  const onSubmit = async (values: ManualAttendanceFormValues) => {
    // Map status from improved labels to backend compatible values
    let backendStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'MISSED' = 'PRESENT';
    if (values.status === 'ABSENT') {
      backendStatus = 'ABSENT';
    } else if (values.status === 'MANUAL') {
      backendStatus = 'MISSED';
    }

    try {
      await manualAttendanceMutation.mutateAsync({
        memberId: values.memberId,
        attendanceDate: values.attendanceDate,
        status: backendStatus,
        notes: values.notes || undefined,
      })
      onOpenChange(false)
      form.reset()
      setSelectedMember(null)
    } catch (err) {
      console.error("Failed to mark attendance manually:", err)
    }
  }

  // Clear states when modal closes
  React.useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedMember(null)
      setSearch("")
    }
  }, [open, form])

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Manual Attendance</ModalTitle>
          <ModalDescription>Mark attendance for a member retroactively.</ModalDescription>
        </ModalHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          {/* Member Search Field / Selected Member Card */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--on-primary)]">Member</label>
            
            {selectedMember ? (
              <div className="flex items-center justify-between p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6C47FF] flex items-center justify-center font-bold text-xs">
                    {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--on-primary)]">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </p>
                    <p className="text-xs text-[var(--mute)]">
                      {selectedMember.memberCode} • {selectedMember.phone}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearMember}
                  className="p-1 rounded-full hover:bg-purple-100 text-[var(--mute)] hover:text-[#6C47FF] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Input
                    placeholder="Search member by name, phone, or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 rounded-lg text-sm"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--ash)]" />
                </div>

                {search.length >= 2 && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-lg border border-[var(--hairline)] divide-y divide-gray-100 max-h-[180px] overflow-y-auto bg-[var(--canvas-light)] shadow-md">
                    {isSearching ? (
                      <div className="p-3 text-xs text-[var(--mute)] text-center">Searching...</div>
                    ) : membersData?.data && membersData.data.length > 0 ? (
                      membersData.data.map(member => (
                        <div
                          key={member.id}
                          className="flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-[var(--canvas-paper)]"
                          onClick={() => handleSelectMember(member)}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6C47FF] flex items-center justify-center font-bold text-xs">
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[var(--on-primary)]">{member.firstName} {member.lastName}</p>
                              <p className="text-[10px] text-[var(--mute)]">{member.memberCode} • {member.phone}</p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">Active</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-[var(--mute)] text-center">No members found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {form.formState.errors.memberId && (
              <p className="text-red-500 text-xs">{form.formState.errors.memberId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--on-primary)]">Date</label>
            <Input type="date" {...form.register("attendanceDate")} className="h-11 rounded-lg text-sm" />
            {form.formState.errors.attendanceDate && (
              <p className="text-red-500 text-xs">{form.formState.errors.attendanceDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--on-primary)]">Status</label>
            <Select {...form.register("status")} className="h-11 rounded-lg text-sm">
              <option value="COMPLETED">Completed</option>
              <option value="ABSENT">Absent</option>
              <option value="MANUAL">Manual</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--on-primary)]">Notes (Optional)</label>
            <Input
              placeholder="E.g., System glitch, missed scan"
              {...form.register("notes")}
              className="h-11 rounded-lg text-sm"
            />
          </div>

          <ModalFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={manualAttendanceMutation.isPending}>
              {manualAttendanceMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
