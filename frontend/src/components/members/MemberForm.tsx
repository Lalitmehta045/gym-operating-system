"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { CreateMemberDto, Member } from "@/hooks/api/useMembers"
import { Loader2, Upload, X, Pencil, CheckCircle2 } from "lucide-react"
import api from "@/lib/axios"
import { useGetTrainers } from "@/hooks/api/useStaff"

// ─── Zod Schema ─────────────────────────────────────────────────────────────

const memberSchema = z.object({
  memberCode: z.string().min(1, "Member code is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+91\s?\d{5}\s?\d{5}$/, "Enter valid 10-digit number after +91"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
  dateOfBirth: z.string().optional(),
  joinedAt: z.string().optional(),
  whatsappNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+91\s?\d{5}\s?\d{5}$/.test(val),
      "Enter valid 10-digit number after +91"
    ),
  // Physical Details
  heightCm: z.union([z.string(), z.number()]).optional()
    .refine((val) => {
      if (val === undefined || val === "") return true
      const num = Number(val)
      return !isNaN(num) && num >= 50 && num <= 300
    }, "Height must be between 50-300"),
  weightKg: z.union([z.string(), z.number()]).optional()
    .refine((val) => {
      if (val === undefined || val === "") return true
      const num = Number(val)
      return !isNaN(num) && num >= 10 && num <= 500
    }, "Weight must be between 10-500"),
  bloodGroup: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]).optional().or(z.literal("")),
  medicalNotes: z.string().optional(),
  // Fitness Profile
  fitnessGoal: z.string().optional(),
  experienceLevel: z.string().optional(),
  preferredTime: z.string().optional(),
  assignedTrainerId: z.string().optional(),
  fitnessNotes: z.string().optional(),
  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z
    .string()
    .min(7, "Emergency contact phone is too short")
    .max(20, "Emergency contact phone is too long")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format"),
  emergencyContactRelation: z.string().min(1, "Emergency contact relation is required"),
  // Additional
  notes: z.string().optional(),
  source: z.enum(["WALK_IN", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "REFERRAL", "WEBSITE", "GOOGLE", "YOUTUBE", "NEWSPAPER", "FRIEND_FAMILY", "OTHER"]).optional().or(z.literal("")),
  occupation: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED", "PENDING"]).optional(),
})

type MemberFormValues = z.infer<typeof memberSchema>

interface MemberFormProps {
  initialData?: Member;
  onSubmit: (data: CreateMemberDto | any, photoFile?: File) => void;
  isLoading: boolean;
  isEdit?: boolean;
}

// ─── Section IDs for scroll tracking ─────────────────────────────────────────

const SECTIONS = [
  { id: "section-profile", label: "Profile" },
  { id: "section-physical", label: "Physical" },
  { id: "section-fitness", label: "Fitness" },
  { id: "section-emergency", label: "Emergency" },
  { id: "section-address", label: "Address" },
  { id: "section-additional", label: "Additional" },
] as const

// ─── BMI Helpers ─────────────────────────────────────────────────────────────

function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#f59e0b" }
  if (bmi < 25) return { label: "Normal", color: "#22c55e" }
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" }
  return { label: "Obese", color: "#ef4444" }
}

// ─── Phone formatting helper ─────────────────────────────────────────────────

function formatIndianPhone(value: string): string {
  let digits: string

  if (value.startsWith("+91")) {
    // Our formatted prefix exists — extract digits AFTER it
    digits = value.slice(3).replace(/[^\d]/g, "")
  } else {
    // Raw input (e.g. paste) — extract all digits, strip country code if present
    digits = value.replace(/[^\d]/g, "")
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.slice(2)
    }
  }

  // Limit to 10 digits
  digits = digits.slice(0, 10)
  
  if (digits.length === 0) return "" // Return empty string if no digits
  
  // Format: +91 XXXXX XXXXX
  if (digits.length <= 5) return `+91 ${digits}`
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
}

function getPhoneDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "")
  if (digits.startsWith("91") && digits.length > 10) return digits.slice(2)
  return digits.slice(0, 10)
}

// ─── Unit conversion helpers ─────────────────────────────────────────────────

function cmToFt(cm: number): number { return cm / 30.48 }
function ftToCm(ft: number): number { return ft * 30.48 }
function kgToLbs(kg: number): number { return kg * 2.20462 }
function lbsToKg(lbs: number): number { return lbs / 2.20462 }

// ─── Main Component ──────────────────────────────────────────────────────────

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
      joinedAt: initialData?.joinedAt ? new Date(initialData.joinedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      whatsappNumber: initialData?.whatsappNumber || "",
      heightCm: initialData?.heightCm || undefined,
      weightKg: initialData?.weightKg || undefined,
      bloodGroup: initialData?.bloodGroup || "",
      medicalNotes: initialData?.medicalNotes || "",
      fitnessGoal: initialData?.fitnessGoal || "",
      experienceLevel: initialData?.experienceLevel || "",
      preferredTime: initialData?.preferredTime || "",
      assignedTrainerId: initialData?.assignedTrainerId || "",
      fitnessNotes: initialData?.fitnessNotes || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      emergencyContactRelation: initialData?.emergencyContactRelation || "",
      notes: initialData?.notes || "",
      source: initialData?.source || "",
      occupation: initialData?.occupation || "",
      status: initialData?.status || "ACTIVE",
    },
  })

  // ── Photo state ─────────────────────────────────────────────────────────

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

  // ── Unit toggles ───────────────────────────────────────────────────────

  const [heightUnit, setHeightUnit] = React.useState<"CM" | "FT">("CM")
  const [weightUnit, setWeightUnit] = React.useState<"KG" | "LBS">("KG")

  // ── BMI calculation ─────────────────────────────────────────────────────

  const watchHeight = form.watch("heightCm")
  const watchWeight = form.watch("weightKg")

  const bmiData = React.useMemo(() => {
    const h = Number(watchHeight)
    const w = Number(watchWeight)
    if (!h || !w || isNaN(h) || isNaN(w)) return null

    // Convert to metric if needed
    const heightCm = heightUnit === "FT" ? ftToCm(h) : h
    const weightKg = weightUnit === "LBS" ? lbsToKg(w) : w

    if (heightCm < 50 || heightCm > 300 || weightKg < 10 || weightKg > 500) return null

    const bmi = calculateBMI(heightCm, weightKg)
    const category = getBMICategory(bmi)
    return { value: bmi.toFixed(1), ...category }
  }, [watchHeight, watchWeight, heightUnit, weightUnit])

  // ── Scroll progress ────────────────────────────────────────────────────

  const [activeSection, setActiveSection] = React.useState<string>("section-profile")

  React.useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id)
            }
          })
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // ── Trainers data ──────────────────────────────────────────────────────

  const { data: trainersData } = useGetTrainers()
  const trainers: any[] = React.useMemo(() => {
    if (!trainersData) return []
    // trainersData could be array or { data: [...] }
    return Array.isArray(trainersData) ? trainersData : trainersData.data || []
  }, [trainersData])

  // ── Phone formatting handler ───────────────────────────────────────────

  const handlePhoneFormat = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "phone" | "whatsappNumber"
  ) => {
    const formatted = formatIndianPhone(e.target.value)
    form.setValue(fieldName, formatted, { shouldValidate: true })
  }

  const phoneValue = form.watch("phone")
  const phoneValid = /^\+91\s?\d{5}\s?\d{5}$/.test(phoneValue || "")

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async (values: MemberFormValues) => {
    // Clean up empty optional selects and strings
    const payload: any = { ...values }
    const optionalFields = ["source", "bloodGroup", "dateOfBirth", "joinedAt", "medicalNotes", "experienceLevel", "preferredTime", "fitnessNotes", "assignedTrainerId", "occupation", "fitnessGoal", "notes"];
    
    optionalFields.forEach(field => {
      if (payload[field] === "") delete payload[field];
    });

    if (payload.whatsappNumber === "" || payload.whatsappNumber === "+91 ") {
      delete payload.whatsappNumber;
    }

    // Convert height/weight to metric for storage
    if (payload.heightCm !== undefined && payload.heightCm !== "") {
      let val = Number(payload.heightCm)
      if (heightUnit === "FT") val = ftToCm(val)
      payload.heightCm = Math.round(val * 100) / 100
    } else {
      delete payload.heightCm
    }
    if (payload.weightKg !== undefined && payload.weightKg !== "") {
      let val = Number(payload.weightKg)
      if (weightUnit === "LBS") val = lbsToKg(val)
      payload.weightKg = Math.round(val * 100) / 100
    } else {
      delete payload.weightKg
    }

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

  // ── Scroll to first error on validation fail ──────────────────────────

  const onInvalid = () => {
    setTimeout(() => {
      const firstError = document.querySelector(".text-red-500")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  // ── Unit Toggle Button Component ───────────────────────────────────────

  const UnitToggle = ({
    value,
    onChange,
    options,
  }: {
    value: string
    onChange: (v: any) => void
    options: [string, string]
  }) => (
    <div className="flex rounded-lg overflow-hidden border border-[var(--hairline)] h-[38px]">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 text-xs font-semibold transition-all ${
            value === opt
              ? "bg-[#6C47FF] text-white"
              : "bg-[var(--canvas-light)] text-[var(--ash)] hover:bg-[var(--canvas-paper)]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] p-8">

      {/* ── Progress Indicator ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[var(--canvas-light)] pb-4 mb-6 -mt-2 border-b border-[var(--hairline-soft)]">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {SECTIONS.map((section, i) => {
            const isActive = activeSection === section.id
            const activeIdx = SECTIONS.findIndex((s) => s.id === activeSection)
            const isPast = i < activeIdx
            return (
              <React.Fragment key={section.id}>
                {i > 0 && (
                  <div className={`hidden sm:block w-6 h-0.5 transition-colors ${isPast || isActive ? "bg-[#6C47FF]" : "bg-[var(--hairline)]"}`} />
                )}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }}
                  className="flex items-center gap-1.5 group"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isActive
                        ? "bg-[#6C47FF] ring-4 ring-[#6C47FF]/20"
                        : isPast
                        ? "bg-[#6C47FF]"
                        : "bg-[var(--hairline)] group-hover:bg-[var(--ash)]"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#6C47FF]"
                        : isPast
                        ? "text-[var(--on-primary)]"
                        : "text-[var(--mute)] group-hover:text-[var(--ash)]"
                    }`}
                  >
                    {section.label}
                  </span>
                </button>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: Profile & Contact                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="section-profile" className="mb-6 scroll-mt-20">
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
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Status <span className="text-red-500">*</span></label>
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
          {/* Phone with auto-format + green checkmark */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Phone <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input
                type="tel"
                value={phoneValue}
                onChange={(e) => handlePhoneFormat(e, "phone")}
                placeholder="+91 XXXXX XXXXX"
              />
              {phoneValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>
          {/* WhatsApp Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">WhatsApp Number</label>
            <div className="relative">
              <Input
                type="tel"
                value={form.watch("whatsappNumber") || ""}
                onChange={(e) => handlePhoneFormat(e, "whatsappNumber")}
                placeholder="+91 XXXXX XXXXX"
              />
              {form.watch("whatsappNumber") && /^\+91\s?\d{5}\s?\d{5}$/.test(form.watch("whatsappNumber") || "") && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-[var(--mute)]">For automated reminders</p>
            {form.formState.errors.whatsappNumber && (
              <p className="text-sm text-red-500">{form.formState.errors.whatsappNumber.message}</p>
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: Physical Details                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="section-physical" className="mb-6 scroll-mt-20">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Physical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Height */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Height</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("heightCm")}
                  placeholder={heightUnit === "CM" ? "e.g. 175" : "e.g. 5.74"}
                />
              </div>
              <UnitToggle value={heightUnit} onChange={setHeightUnit} options={["CM", "FT"]} />
            </div>
            {form.formState.errors.heightCm && (
              <p className="text-sm text-red-500">{form.formState.errors.heightCm.message}</p>
            )}
          </div>
          {/* Weight */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Weight</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("weightKg")}
                  placeholder={weightUnit === "KG" ? "e.g. 70" : "e.g. 154"}
                />
              </div>
              <UnitToggle value={weightUnit} onChange={setWeightUnit} options={["KG", "LBS"]} />
            </div>
            {form.formState.errors.weightKg && (
              <p className="text-sm text-red-500">{form.formState.errors.weightKg.message}</p>
            )}
          </div>
          {/* BMI (auto-calculated) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">BMI</label>
            <div
              className="h-[38px] rounded-lg border border-[var(--hairline)] px-4 flex items-center bg-[var(--canvas-paper)]"
            >
              {bmiData ? (
                <span className="text-sm font-semibold" style={{ color: bmiData.color }}>
                  {bmiData.value} — {bmiData.label}
                </span>
              ) : (
                <span className="text-sm text-[var(--mute)]">Enter height & weight</span>
              )}
            </div>
          </div>
          {/* Blood Group */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Blood Group</label>
            <Select {...form.register("bloodGroup")}>
              <option value="">Select</option>
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
          {/* Medical Conditions (full width) */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Medical Conditions / Allergies</label>
            <textarea
              {...form.register("medicalNotes")}
              className="w-full min-h-[100px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
              placeholder="Any medical conditions, injuries, or allergies we should know about..."
            />
            <p className="text-xs text-[var(--mute)]">This helps trainers plan safe workouts</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--hairline-soft)] my-6"></div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: Fitness Profile                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="section-fitness" className="mb-6 scroll-mt-20">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Fitness Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fitness Goal */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Fitness Goal</label>
            <Select {...form.register("fitnessGoal")}>
              <option value="">Select</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="General Fitness">General Fitness</option>
              <option value="Improve Stamina">Improve Stamina</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Sports Training">Sports Training</option>
              <option value="Rehabilitation">Rehabilitation</option>
              <option value="Bodybuilding">Bodybuilding</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          {/* Experience Level */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Experience Level</label>
            <Select {...form.register("experienceLevel")}>
              <option value="">Select</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </div>
          {/* Preferred Workout Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Preferred Workout Time</label>
            <Select {...form.register("preferredTime")}>
              <option value="">Select</option>
              <option value="EARLY_MORNING">Early Morning (5-7 AM)</option>
              <option value="MORNING">Morning (7-10 AM)</option>
              <option value="AFTERNOON">Afternoon (12-3 PM)</option>
              <option value="EVENING">Evening (4-7 PM)</option>
              <option value="NIGHT">Night (7-10 PM)</option>
              <option value="FLEXIBLE">Flexible</option>
            </Select>
          </div>
          {/* Assigned Trainer */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Assigned Trainer</label>
            <Select {...form.register("assignedTrainerId")}>
              <option value="">Select a trainer (optional)</option>
              {trainers.map((trainer: any) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.firstName} {trainer.lastName}
                </option>
              ))}
            </Select>
          </div>
          {/* Fitness Notes (full width) */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Fitness Notes</label>
            <textarea
              {...form.register("fitnessNotes")}
              className="w-full min-h-[100px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
              placeholder="Initial fitness assessment, goals discussion notes..."
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--hairline-soft)] my-6"></div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: Emergency Contact                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="section-emergency" className="mb-6 scroll-mt-20">
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: Address                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="section-address" className="mb-6 scroll-mt-20">
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: Additional Info                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div id="section-additional" className="mb-6 scroll-mt-20">
        <h3 className="text-lg font-semibold text-[var(--on-primary)] border-l-4 border-[#6C47FF] pl-3 mb-6">Additional Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Photo */}
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[var(--hairline-soft)]"
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
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
                >
                  Remove photo
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
          {/* Occupation */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Occupation</label>
            <Input {...form.register("occupation")} placeholder="e.g. Software Engineer" />
            <p className="text-xs text-[var(--mute)]">Helps with scheduling recommendations</p>
          </div>
          {/* Source (updated options) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">How did you hear about us?</label>
            <Select {...form.register("source")}>
              <option value="">Select</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="REFERRAL">Referral</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="GOOGLE">Google</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="NEWSPAPER">Newspaper</option>
              <option value="FRIEND_FAMILY">Friend / Family</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          {/* Notes (full width) */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Notes</label>
            <textarea
              {...form.register("notes")}
              className="w-full min-h-[120px] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-[var(--canvas-light)] resize-y"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--ink-soft)] block">Join Date</label>
            <Input type="date" {...form.register("joinedAt")} />
          </div>
        </div>
      </div>

      {/* ── Submit Buttons ──────────────────────────────────────────────── */}
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
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Update Member" : "Create Member"
          )}
        </Button>
      </div>
    </form>
  )
}
