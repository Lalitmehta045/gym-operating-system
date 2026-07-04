"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/Input"
import { ErrorState } from "@/components/ui/States"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data)
    } catch (err) {
      // Error is handled and exposed by useAuth hook
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--canvas-soft)] px-[24px]">
      <div className="w-full max-w-[440px]">
        <div className="mb-[32px] flex justify-center">
          <Link href="/" className="inline-flex items-center text-body-sm font-medium text-[var(--mute)] hover:text-[var(--ink)] transition-colors">
            <ArrowLeft className="mr-[8px] h-[16px] w-[16px]" />
            Back to Home
          </Link>
        </div>
        
        <div 
          className="bg-[var(--canvas)] rounded-[var(--radius-marketing)] p-[var(--spacing-xl)]"
          style={{ 
            boxShadow: '0px 1px 1px rgba(0,0,0,0.02), 0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.04), inset 0 0 0 1px var(--hairline-soft)' 
          }}
        >
          <div className="mb-[32px] text-center">
            <h1 className="text-heading-md text-[var(--ink)] tracking-[-1.28px] font-semibold mb-[8px]">Log in to GymOS</h1>
            <p className="text-body text-[var(--ash)]">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="mb-[24px]">
              <ErrorState title="Login Failed" description={error} />
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[24px]">
            <div className="space-y-[8px]">
              <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Email address</label>
              <Input 
                type="email" 
                inputSize="lg" 
                placeholder="you@example.com"
                className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]"
                {...form.register("email")} 
              />
              {form.formState.errors.email && (
                <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-[8px]">
              <div className="flex items-center justify-between">
                <label className="text-mono-eyebrow uppercase text-[var(--ash)] tracking-wider">Password</label>
              </div>
              <Input 
                type="password" 
                inputSize="lg" 
                placeholder="••••••••" 
                className="bg-[var(--canvas)] border-[var(--hairline)] text-[var(--ink)] focus-visible:ring-1 focus-visible:ring-[var(--ink)] focus-visible:border-[var(--ink)] h-[40px] rounded-[6px]"
                {...form.register("password")} 
              />
              {form.formState.errors.password && (
                <p className="text-[13px] text-[var(--error)] mt-[4px]">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              className="mt-[8px] flex h-[48px] w-full items-center justify-center rounded-full bg-[var(--ink)] text-[16px] font-medium text-[var(--canvas)] transition-all hover:bg-[#333]"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
            
            <div className="mt-[24px] text-center text-[14px] text-[var(--ash)]">
              Don't have an account? <Link href="/register" className="text-[var(--ink)] font-medium hover:underline">Register your Gym</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
