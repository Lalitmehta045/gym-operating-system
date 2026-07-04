import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CreateSubscriptionDto } from "@/hooks/api/useSubscriptions"
import { useMembers } from "@/hooks/api/useMembers"
import { usePlans } from "@/hooks/api/usePlans"
import { format, addDays } from "date-fns"

const subscriptionSchema = z
  .object({
    memberId: z.string().uuid("Please select a valid member"),
    membershipPlanId: z.string().uuid("Please select a valid plan"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    amount: z.coerce.number().min(0, "Amount must be valid").max(99999999.99),
    notes: z.string().max(5000).optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  })

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

interface SubscriptionFormProps {
  initialValues?: Partial<SubscriptionFormValues>
  onSubmit: (data: SubscriptionFormValues) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function SubscriptionForm({ initialValues, onSubmit, isLoading, submitLabel = "Create Subscription" }: SubscriptionFormProps) {
  const { data: membersData, isLoading: loadingMembers } = useMembers({ limit: 100 })
  const { data: plansData, isLoading: loadingPlans } = usePlans({ limit: 100, isActive: true })

  const members = membersData?.data || []
  const plans = plansData?.data || []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: {
      memberId: initialValues?.memberId || "",
      membershipPlanId: initialValues?.membershipPlanId || "",
      startDate: initialValues?.startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: initialValues?.endDate || "",
      amount: initialValues?.amount || 0,
      notes: initialValues?.notes || "",
    },
  })

  const selectedPlanId = watch("membershipPlanId")
  const startDate = watch("startDate")

  React.useEffect(() => {
    if (selectedPlanId && startDate) {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (plan) {
        setValue("amount", plan.price)
        if (plan.durationDays) {
          const end = addDays(new Date(startDate), plan.durationDays)
          setValue("endDate", format(end, "yyyy-MM-dd"))
        }
      }
    }
  }, [selectedPlanId, startDate, plans, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Member <span className="text-red-500">*</span></label>
          <Select {...register("memberId")} disabled={loadingMembers} className="w-full">
            <option value="">Select a member...</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName} ({member.memberCode})
              </option>
            ))}
          </Select>
          {errors.memberId && <p className="text-red-500 text-sm">{errors.memberId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Membership Plan <span className="text-red-500">*</span></label>
          <Select {...register("membershipPlanId")} disabled={loadingPlans} className="w-full">
            <option value="">Select a plan...</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - ₹{plan.price} ({plan.durationDays} Days)
              </option>
            ))}
          </Select>
          {errors.membershipPlanId && <p className="text-red-500 text-sm">{errors.membershipPlanId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Start Date <span className="text-red-500">*</span></label>
          <Input type="date" {...register("startDate")} className="w-full" />
          {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">End Date <span className="text-red-500">*</span></label>
          <Input type="date" {...register("endDate")} className="w-full bg-[var(--canvas-paper)]" readOnly />
          {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
        </div>

        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Amount <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-[var(--mute)]">₹</span>
            <Input type="number" step="0.01" {...register("amount")} className="pl-8 w-full" />
          </div>
          {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Payment Method</label>
          <Select className="w-full">
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Notes</label>
          <textarea
            {...register("notes")}
            className="w-full min-h-[120px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
            placeholder="Any additional notes..."
          />
          {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-[var(--hairline-soft)]">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
