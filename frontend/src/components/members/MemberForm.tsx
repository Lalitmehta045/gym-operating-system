"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CreateMemberDto, Member } from "@/hooks/api/useMembers"
import { Loader2, Upload, X, Pencil } from "lucide-react"
import api from "@/lib/axios"

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
  onSubmit: (data: CreateMemberDto | any, photoFile?: File) => void;
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

  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(initialData?.photoUrl || null)
  const [photoFile, setPhotoFile] = React.useState<File | null>(null)
  const [photoUploading, setPhotoUploading] = React.useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(initialData?.photoUrl || null)
    if (photoInputRef.current) photoInputRef.current.value = ""
  }

  const handleSubmit = async (values: MemberFormValues) => {
    // Clean up empty optional selects
    const payload: any = { ...values }
    if (payload.source === "") delete payload.source;
    if (payload.bloodGroup === "") delete payload.bloodGroup;
    if (payload.dateOfBirth === "") delete payload.dateOfBirth;
    if (payload.heightCm !== undefined && payload.heightCm !== "") payload.heightCm = Number(payload.heightCm);
    else delete payload.heightCm;
    if (payload.weightKg !== undefined && payload.weightKg !== "") payload.weightKg = Number(payload.weightKg);
    else delete payload.weightKg;

    // If editing and a new photo was selected, upload it first
    if (isEdit && initialData?.id && photoFile) {
      try {
        setPhotoUploading(true)
        const formData = new FormData()
        formData.append('file', photoFile)
        await api.post(`/members/${initialData.id}/profile-photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch (err) {
        console.error('Photo upload failed:', err)
      } finally {
        setPhotoUploading(false)
      }
    }

    onSubmit(payload, photoFile ?? undefined)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] p-8">
      {/* Profile & Contact */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Profile & Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Member Code <span className="text-red-500">*</span></label>
            <Input {...form.register("memberCode")} placeholder="1" disabled={isEdit} />
            {form.formState.errors.memberCode && (
              <p className="text-sm text-red-500">{form.formState.errors.memberCode.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Status</label>
            <Select {...form.register("status")} disabled={!isEdit}>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">First Name <span className="text-red-500">*</span></label>
            <Input {...form.register("firstName")} placeholder="John" />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Last Name <span className="text-red-500">*</span></label>
            <Input {...form.register("lastName")} placeholder="Doe" />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Email <span className="text-red-500">*</span></label>
            <Input type="email" {...form.register("email")} placeholder="john@example.com" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Phone <span className="text-red-500">*</span></label>
            <Input type="tel" {...form.register("phone")} placeholder="+91" />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Gender</label>
            <Select {...form.register("gender")}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Date of Birth</label>
            <Input type="date" {...form.register("dateOfBirth")} />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--hairline-soft)] my-6"></div>

      {/* Emergency Contact */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Emergency Contact Name <span className="text-red-500">*</span></label>
            <Input {...form.register("emergencyContactName")} placeholder="Jane Doe" />
            {form.formState.errors.emergencyContactName && (
              <p className="text-sm text-red-500">{form.formState.errors.emergencyContactName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Emergency Contact Phone <span className="text-red-500">*</span></label>
            <Input type="tel" {...form.register("emergencyContactPhone")} placeholder="+91" />
            {form.formState.errors.emergencyContactPhone && (
              <p className="text-sm text-red-500">{form.formState.errors.emergencyContactPhone.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Relationship <span className="text-red-500">*</span></label>
            <Select {...form.register("emergencyContactRelation")}>
              <option value="">Select</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </Select>
            {form.formState.errors.emergencyContactRelation && (
              <p className="text-sm text-red-500">{form.formState.errors.emergencyContactRelation.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--hairline-soft)] my-6"></div>

      {/* Address */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Address Line 1</label>
            <Input name="addressLine1" placeholder="Street address, apartment, suite, etc." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">City | State</label>
            <Input name="cityState" placeholder="e.g. Mumbai, Maharashtra" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Pincode | Country</label>
            <Input name="pincodeCountry" placeholder="e.g. 400001, India" />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--hairline-soft)] my-6"></div>

      {/* Additional Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Additional Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Profile Photo</label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <div className="relative w-28 h-28">
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-28 h-28 rounded-full object-cover border-2 border-[var(--hairline-soft)]"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--canvas-light)] border border-[var(--hairline-soft)] flex items-center justify-center hover:bg-[var(--canvas-paper)] transition-colors shadow-sm"
                >
                  <Pencil className="w-3 h-3 text-[var(--ash)]" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--hairline)] rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-[var(--canvas-paper)] transition cursor-pointer bg-[var(--canvas-light)]"
              >
                <Upload className="w-8 h-8 text-[var(--ash)] mb-2" />
                <p className="text-sm font-medium text-[var(--ink-soft)]">Click to upload photo</p>
                <p className="text-xs text-[var(--mute)] mt-1">PNG, JPG, WebP up to 5MB</p>
              </div>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Notes</label>
            <textarea 
              {...form.register("notes")} 
              className="w-full min-h-[120px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Source</label>
            <Select {...form.register("source")}>
              <option value="">Select</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="REFERRAL">Referral</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="WEBSITE">Website</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Join Date</label>
            <Input type="date" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
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
