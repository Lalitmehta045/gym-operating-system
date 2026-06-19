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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-[6px] border border-[#ebebeb]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#171717]">Plan Name *</label>
          <Input {...register("name")} placeholder="e.g. Gold Membership" />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#171717]">Plan Type *</label>
          <Select {...register("planType")}>
            <option value="MONTHLY">Monthly (30 Days)</option>
            <option value="QUARTERLY">Quarterly (90 Days)</option>
            <option value="HALF_YEARLY">Half Yearly (180 Days)</option>
            <option value="ANNUAL">Annual (365 Days)</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          {errors.planType && <p className="text-red-500 text-sm">{errors.planType.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#171717]">Duration (Days) *</label>
          <Input 
            type="number" 
            {...register("durationDays")} 
            readOnly={planType !== "CUSTOM"}
            className={planType !== "CUSTOM" ? "bg-gray-50" : ""}
          />
          {errors.durationDays && <p className="text-red-500 text-sm">{errors.durationDays.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#171717]">Price *</label>
          <Input type="number" step="0.01" {...register("price")} placeholder="0.00" />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-[#171717]">Description</label>
          <textarea
            {...register("description")}
            className="w-full flex min-h-[80px] rounded-[6px] border border-[#ebebeb] bg-transparent px-[12px] py-[8px] text-[14px] text-[#171717] placeholder:text-[#888888] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Plan benefits and details..."
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#171717]">Display Order</label>
          <Input type="number" {...register("displayOrder")} />
          <p className="text-xs text-[#888888]">Lower numbers appear first</p>
        </div>

        <div className="space-y-2 flex flex-col justify-center">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer mt-6">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 rounded border-[#ebebeb] text-[#171717] focus:ring-[#171717]"
                />
                <span className="text-sm font-medium text-[#171717]">Plan is Active</span>
              </label>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-[#ebebeb]">
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
