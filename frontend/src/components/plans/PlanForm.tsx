import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CreatePlanDto } from "@/hooks/api/usePlans"

const planSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120, "Name too long"),
  description: z.string().optional(),
  planType: z.enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUAL", "CUSTOM"]),
  durationDays: z.coerce.number().min(1, "Duration must be at least 1 day"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  displayOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
})

type PlanFormValues = z.infer<typeof planSchema>

interface PlanFormProps {
  initialValues?: Partial<PlanFormValues>
  onSubmit: (data: PlanFormValues) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function PlanForm({ initialValues, onSubmit, isLoading, submitLabel = "Save Plan" }: PlanFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      planType: initialValues?.planType || "MONTHLY",
      durationDays: initialValues?.durationDays || 30,
      price: initialValues?.price || 0,
      displayOrder: initialValues?.displayOrder || 0,
      isActive: initialValues?.isActive ?? true,
    },
  })

  // Auto-set duration days based on plan type if not custom
  const planType = watch("planType")
  React.useEffect(() => {
    if (planType === "MONTHLY") setValue("durationDays", 30)
    else if (planType === "QUARTERLY") setValue("durationDays", 90)
    else if (planType === "HALF_YEARLY") setValue("durationDays", 180)
    else if (planType === "ANNUAL") setValue("durationDays", 365)
  }, [planType, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Plan Name <span className="text-red-500">*</span></label>
          <Input {...register("name")} placeholder="e.g. Gold Membership" className="w-full" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Plan Type <span className="text-red-500">*</span></label>
          <Select {...register("planType")} className="w-full">
            <option value="MONTHLY">Monthly (30 Days)</option>
            <option value="QUARTERLY">Quarterly (90 Days)</option>
            <option value="HALF_YEARLY">Half Yearly (180 Days)</option>
            <option value="ANNUAL">Annual (365 Days)</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          {errors.planType && <p className="text-red-500 text-sm">{errors.planType.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Duration (Days) <span className="text-red-500">*</span></label>
          <Input 
            type="number" 
            {...register("durationDays")} 
            readOnly={planType !== "CUSTOM"}
            className={`w-full ${planType !== "CUSTOM" ? "bg-[var(--canvas-paper)]" : ""}`}
          />
          {errors.durationDays && <p className="text-red-500 text-sm">{errors.durationDays.message}</p>}
        </div>

        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-[var(--mute)]">₹</span>
            <Input type="number" step="0.01" {...register("price")} placeholder="0.00" className="pl-8 w-full" />
          </div>
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Description</label>
          <textarea
            {...register("description")}
            className="w-full min-h-[120px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
            placeholder="Plan benefits and details..."
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--ink-soft)] block">Display Order</label>
          <Input type="number" {...register("displayOrder")} className="w-full" />
        </div>

        <div className="space-y-1 flex flex-col justify-center">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer mt-6">
                <div className={`w-11 h-6 rounded-full relative transition-colors ${field.value ? 'bg-[#6C47FF]' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-[var(--canvas-light)] rounded-full absolute top-0.5 transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm font-medium text-[var(--ink-soft)]">Plan is Active</span>
              </label>
            )}
          />
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
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
