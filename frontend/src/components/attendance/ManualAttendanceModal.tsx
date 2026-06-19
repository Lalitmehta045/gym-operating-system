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

const manualAttendanceSchema = z.object({
  memberId: z.string().uuid("Enter a valid member UUID"),
  attendanceDate: z.string().min(1, "Date is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "MISSED"]),
  notes: z.string().max(5000).optional().or(z.literal("")),
})

type ManualAttendanceFormValues = z.infer<typeof manualAttendanceSchema>

interface ManualAttendanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManualAttendanceModal({ open, onOpenChange }: ManualAttendanceModalProps) {
  const manualAttendanceMutation = useManualAttendance()

  const form = useForm<ManualAttendanceFormValues>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: {
      memberId: "",
      attendanceDate: "",
      status: "PRESENT",
      notes: "",
    },
  })

  const onSubmit = async (values: ManualAttendanceFormValues) => {
    try {
      await manualAttendanceMutation.mutateAsync({
        memberId: values.memberId,
        attendanceDate: values.attendanceDate,
        status: values.status,
        notes: values.notes || undefined,
      })
      onOpenChange(false)
      form.reset()
    } catch (err) {
      console.error("Failed to mark attendance manually:", err)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Manual Attendance</ModalTitle>
          <ModalDescription>Mark attendance for a member retroactively.</ModalDescription>
        </ModalHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Member ID</label>
            <Input
              placeholder="Enter Member ID (UUID)..."
              {...form.register("memberId")}
            />
            {form.formState.errors.memberId && (
              <p className="text-red-500 text-sm">{form.formState.errors.memberId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Date</label>
            <Input type="date" {...form.register("attendanceDate")} />
            {form.formState.errors.attendanceDate && (
              <p className="text-red-500 text-sm">{form.formState.errors.attendanceDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Status</label>
            <Select {...form.register("status")}>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="MISSED">Missed</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Notes (Optional)</label>
            <Input
              placeholder="E.g., System glitch, missed scan"
              {...form.register("notes")}
            />
          </div>

          <ModalFooter>
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
