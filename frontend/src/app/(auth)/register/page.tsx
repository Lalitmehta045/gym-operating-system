"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { authService, RegisterOwnerData } from "@/services/auth.service"
import { Input } from "@/components/ui/Input"
import { ErrorState, EmptyState } from "@/components/ui/States"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--canvas-soft)] px-[24px]">
        <div 
          className="w-full max-w-[500px] bg-[var(--canvas)] rounded-[var(--radius-marketing)] p-[var(--spacing-xl)] text-center"
          style={{ boxShadow: '0px 1px 1px rgba(0,0,0,0.02), 0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.04), inset 0 0 0 1px var(--hairline-soft)' }}
        >
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas-soft)] px-[24px] py-[64px]">
      <div className="w-full max-w-[520px]">
        <div className="mb-[32px] flex justify-center">
          <Link href="/" className="inline-flex items-center text-body-sm font-medium text-[var(--mute)] hover:text-[var(--ink)] transition-colors">
            <ArrowLeft className="mr-[8px] h-[16px] w-[16px]" />
            Back to Home
          </Link>
        </div>
        
        <div 
          className="bg-[var(--canvas)] rounded-[var(--radius-marketing)] p-[var(--spacing-xl)]"
          style={{ boxShadow: '0px 1px 1px rgba(0,0,0,0.02), 0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.04), inset 0 0 0 1px var(--hairline-soft)' }}
        >
          <div className="mb-[32px] text-center">
            <h1 className="text-heading-md text-[var(--ink)] tracking-[-1.28px] font-semibold mb-[8px]">Create your Gym</h1>
            <p className="text-body text-[var(--ash)]">Submit an application to get your gym on GymOS.</p>
          </div>

          {error && (
            <div className="mb-[24px]">
              <ErrorState title="Registration Failed" description={error} />
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[32px]">
            <div className="space-y-[16px]">
              <h3 className="text-mono-caps text-[var(--ash)] border-b border-[var(--hairline)] pb-[8px]">Owner Details</h3>
              
              <div className="grid grid-cols-2 gap-[16px]">
                <div className="space-y-[8px]">
                  <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">First Name</label>
                  <Input 
                    placeholder="John" 
                    className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                    {...form.register("firstName")} 
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-[8px]">
                  <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Last Name</label>
                  <Input 
                    placeholder="Doe" 
                    className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                    {...form.register("lastName")} 
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Personal Email</label>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                  {...form.register("email")} 
                />
                {form.formState.errors.email && (
                  <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                  {...form.register("password")} 
                />
                {form.formState.errors.password && (
                  <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-[16px]">
              <h3 className="text-mono-caps text-[var(--ash)] border-b border-[var(--hairline)] pb-[8px]">Gym Details</h3>
              
              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Gym Name</label>
                <Input 
                  placeholder="Iron Paradise" 
                  className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                  {...form.register("gymName")} 
                />
                {form.formState.errors.gymName && (
                  <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.gymName.message}</p>
                )}
              </div>

              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Gym Email</label>
                <Input 
                  type="email" 
                  placeholder="contact@ironparadise.com" 
                  className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                  {...form.register("gymEmail")} 
                />
                {form.formState.errors.gymEmail && (
                  <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.gymEmail.message}</p>
                )}
              </div>

              <div className="space-y-[8px]">
                <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Gym Phone (Optional)</label>
                <Input 
                  placeholder="+1 234 567 8900" 
                  className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]" 
                  {...form.register("gymPhone")} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="mt-[16px] flex h-[48px] w-full items-center justify-center rounded-full bg-[var(--ink)] text-[16px] font-medium text-[var(--canvas)] transition-all hover:bg-[#333]"
              disabled={isLoading}
            >
              {isLoading ? "Submitting Application..." : "Submit Application"}
            </button>
            
            <div className="mt-[24px] text-center text-[14px] text-[var(--ash)]">
              Already have an account? <Link href="/login" className="text-[var(--ink)] font-medium hover:underline">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
