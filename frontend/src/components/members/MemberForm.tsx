"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CreateMemberDto, Member } from "@/hooks/api/useMembers"
import { Loader2 } from "lucide-react"

const memberSchema = z.object({
  memberCode: z.string().min(1, "Member code is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z
    .string()
    .min(7, "Emergency contact phone is too short")
    .max(20, "Emergency contact phone is too long")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format"),
  emergencyContactRelation: z.string().min(1, "Emergency contact relation is required"),
  heightCm: z.union([z.string(), z.number()]).optional(),
  weightKg: z.union([z.string(), z.number()]).optional(),
  fitnessGoal: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(["WALK_IN", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "REFERRAL", "WEBSITE", "OTHER"]).optional().or(z.literal("")),
  occupation: z.string().optional(),
  bloodGroup: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "PENDING"]).optional(),
})

type MemberFormValues = z.infer<typeof memberSchema>

interface MemberFormProps {
  initialData?: Member;
  onSubmit: (data: CreateMemberDto | any) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export function MemberForm({ initialData, onSubmit, isLoading, isEdit = false }: MemberFormProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      memberCode: initialData?.memberCode || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      gender: initialData?.gender || "MALE",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      emergencyContactRelation: initialData?.emergencyContactRelation || "",
      heightCm: initialData?.heightCm || undefined,
      weightKg: initialData?.weightKg || undefined,
      fitnessGoal: initialData?.fitnessGoal || "",
      notes: initialData?.notes || "",
      source: initialData?.source || "",
      occupation: initialData?.occupation || "",
      bloodGroup: initialData?.bloodGroup || "",
      status: initialData?.status || "ACTIVE",
    },
  })

  const handleSubmit = (values: MemberFormValues) => {
    // Clean up empty optional selects
    const payload: any = { ...values }
    if (payload.source === "") delete payload.source;
    if (payload.bloodGroup === "") delete payload.bloodGroup;
    if (payload.dateOfBirth === "") delete payload.dateOfBirth;
    if (payload.heightCm !== undefined && payload.heightCm !== "") payload.heightCm = Number(payload.heightCm);
    else delete payload.heightCm;
    if (payload.weightKg !== undefined && payload.weightKg !== "") payload.weightKg = Number(payload.weightKg);
    else delete payload.weightKg;

    onSubmit(payload)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {/* Profile & Contact */}
      <div className="bg-[#ffffff] rounded-[12px] p-6 border border-[#ebebeb]">
        <h3 className="text-lg font-medium text-[#171717] mb-4">Profile & Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Member Code</label>
            <Input {...form.register("memberCode")} placeholder="1" disabled={isEdit} />
            {form.formState.errors.memberCode && (
              <p className="text-sm text-red-500">{form.formState.errors.memberCode.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Status</label>
            <Select {...form.register("status")} disabled={!isEdit}>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">First Name</label>
            <Input {...form.register("firstName")} placeholder="John" />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Last Name</label>
            <Input {...form.register("lastName")} placeholder="Doe" />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Email</label>
            <Input type="email" {...form.register("email")} placeholder="john@example.com" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Phone</label>
            <Input type="tel" {...form.register("phone")} placeholder="+1234567890" />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Gender</label>
            <Select {...form.register("gender")}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Date of Birth</label>
            <Input type="date" {...form.register("dateOfBirth")} />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-[#ffffff] rounded-[12px] p-6 border border-[#ebebeb]">
        <h3 className="text-lg font-medium text-[#171717] mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Name</label>
            <Input {...form.register("emergencyContactName")} placeholder="Jane Doe" />
            {form.formState.errors.emergencyContactName && (
              <p className="text-sm text-red-500">{form.formState.errors.emergencyContactName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Phone</label>
            <Input type="tel" {...form.register("emergencyContactPhone")} placeholder="+1234567890" />
            {form.formState.errors.emergencyContactPhone && (
              <p className="text-sm text-red-500">{form.formState.errors.emergencyContactPhone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Relation</label>
            <Input {...form.register("emergencyContactRelation")} placeholder="Spouse" />
            {form.formState.errors.emergencyContactRelation && (
              <p className="text-sm text-red-500">{form.formState.errors.emergencyContactRelation.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Fitness & Medical Information */}
      <div className="bg-[#ffffff] rounded-[12px] p-6 border border-[#ebebeb]">
        <h3 className="text-lg font-medium text-[#171717] mb-4">Fitness & Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Height (cm)</label>
            <Input type="number" step="0.01" {...form.register("heightCm")} placeholder="175" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Weight (kg)</label>
            <Input type="number" step="0.01" {...form.register("weightKg")} placeholder="70" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Blood Group</label>
            <Select {...form.register("bloodGroup")}>
              <option value="">Select Blood Group</option>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium text-[#171717]">Fitness Goal</label>
            <Input {...form.register("fitnessGoal")} placeholder="Weight loss, muscle gain, etc." />
          </div>
        </div>
      </div>

      {/* CRM Information */}
      <div className="bg-[#ffffff] rounded-[12px] p-6 border border-[#ebebeb]">
        <h3 className="text-lg font-medium text-[#171717] mb-4">CRM Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Source</label>
            <Select {...form.register("source")}>
              <option value="">Select Source</option>
              <option value="WALK_IN">Walk In</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="REFERRAL">Referral</option>
              <option value="WEBSITE">Website</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#171717]">Occupation</label>
            <Input {...form.register("occupation")} placeholder="Software Engineer" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[#171717]">Notes</label>
            <textarea 
              {...form.register("notes")} 
              className="flex w-full min-h-[100px] border border-[#ebebeb] bg-[#ffffff] text-[#171717] rounded-[6px] px-[12px] py-[8px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171717] resize-y"
              placeholder="Any additional notes..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEdit ? "Update Member" : "Create Member"
          )}
        </Button>
      </div>
    </form>
  )
}
