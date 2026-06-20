"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authService, RegisterOwnerData } from "@/services/auth.service"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ErrorState, EmptyState } from "@/components/ui/States"
import Link from "next/link"

const registerSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_+=|<>{}[\]\\])/, { 
      message: "Password must contain uppercase, lowercase, number and special character" 
    }),
  gymName: z.string().min(2, { message: "Gym name is required" }),
  gymEmail: z.string().email({ message: "Invalid gym email address" }),
  gymPhone: z.string().optional(),
  gymAddress: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      gymName: "",
      gymEmail: "",
      gymPhone: "",
      gymAddress: "",
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.register(data)
      setSuccess(true)
    } catch (err: any) {
      const message = err.response?.data?.message
      if (Array.isArray(message)) {
        setError(message[0])
      } else {
        setError(message || "Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center marketing-section px-[24px]">
        <div className="w-full max-w-[500px] feature-card text-center">
          <EmptyState 
            title="Application Submitted" 
            description="Your gym account has been successfully created and is currently pending superadmin approval. You will be able to log in once your application is approved."
            action={{ label: "Return to Login", onClick: () => window.location.href = '/login' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center marketing-section px-[24px] overflow-y-auto py-[64px]">
      <div className="w-full max-w-[500px]">
        <div className="mb-[24px]">
          <Link href="/" className="inline-flex items-center text-body-sm font-medium text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">
            <ArrowLeft className="mr-[8px] h-[16px] w-[16px]" />
            Back to Home
          </Link>
        </div>
        <div className="feature-card">
        <div className="mb-[32px] text-center">
          <h1 className="text-display-sm text-[var(--on-primary)]">Create your Gym</h1>
          <p className="mt-[8px] text-body text-[var(--ash)]">Submit an application to get your gym on GymOS</p>
        </div>

        {error && (
          <div className="mb-[24px]">
            <ErrorState title="Registration Failed" description={error} />
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[24px]">
          <div className="space-y-[16px]">
            <h3 className="text-heading-sm mb-[16px] border-b border-[var(--hairline-soft)] pb-2 text-[var(--on-primary)]">Owner Details</h3>
            <div className="grid grid-cols-2 gap-[16px]">
              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow text-[var(--mute)]">First Name</label>
                <Input placeholder="John" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("firstName")} />
                {form.formState.errors.firstName && (
                  <p className="text-[12px] text-[var(--error)]">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow text-[var(--mute)]">Last Name</label>
                <Input placeholder="Doe" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("lastName")} />
                {form.formState.errors.lastName && (
                  <p className="text-[12px] text-[var(--error)]">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-[8px]">
              <label className="text-mono-eyebrow text-[var(--mute)]">Personal Email</label>
              <Input type="email" placeholder="john@example.com" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-[12px] text-[var(--error)]">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-[8px]">
              <label className="text-mono-eyebrow text-[var(--mute)]">Password</label>
              <Input type="password" placeholder="••••••••" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-[12px] text-[var(--error)]">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-[16px]">
            <h3 className="text-heading-sm mb-[16px] border-b border-[var(--hairline-soft)] pb-2 text-[var(--on-primary)]">Gym Details</h3>
            
            <div className="space-y-[8px]">
              <label className="text-mono-eyebrow text-[var(--mute)]">Gym Name</label>
              <Input placeholder="Iron Paradise" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("gymName")} />
              {form.formState.errors.gymName && (
                <p className="text-[12px] text-[var(--error)]">{form.formState.errors.gymName.message}</p>
              )}
            </div>

            <div className="space-y-[8px]">
              <label className="text-mono-eyebrow text-[var(--mute)]">Gym Email</label>
              <Input type="email" placeholder="contact@ironparadise.com" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("gymEmail")} />
              {form.formState.errors.gymEmail && (
                <p className="text-[12px] text-[var(--error)]">{form.formState.errors.gymEmail.message}</p>
              )}
            </div>

            <div className="space-y-[8px]">
              <label className="text-mono-eyebrow text-[var(--mute)]">Gym Phone (Optional)</label>
              <Input placeholder="+1 234 567 8900" className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]" {...form.register("gymPhone")} />
            </div>
          </div>

          <button 
            type="submit" 
            className="button-primary w-full mt-[16px]"
            disabled={isLoading}
          >
            {isLoading ? "Submitting Application..." : "Submit Application"}
          </button>
          
          <div className="text-center mt-4 text-body text-[var(--ash)]">
            Already have an account? <Link href="/login" className="text-[var(--link-blue-soft)] hover:underline font-medium">Log in</Link>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
