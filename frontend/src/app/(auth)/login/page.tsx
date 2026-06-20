"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
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
    <div className="flex min-h-screen flex-col items-center justify-center marketing-section px-[24px]">
      <div className="w-full max-w-[400px]">
        <div className="mb-[24px]">
          <Link href="/" className="inline-flex items-center text-body-sm font-medium text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">
            <ArrowLeft className="mr-[8px] h-[16px] w-[16px]" />
            Back to Home
          </Link>
        </div>
        <div className="feature-card">
        <div className="mb-[32px] text-center">
          <h1 className="text-display-sm">Log in to GymOS</h1>
          <p className="mt-[8px] text-body text-[var(--ash)]">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-[24px]">
            <ErrorState title="Login Failed" description={error} />
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[24px]">
          <div className="space-y-[8px]">
            <label className="text-mono-eyebrow text-[var(--mute)]">Email address</label>
            <Input 
              type="email" 
              inputSize="lg" 
              placeholder="you@example.com"
              className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]"
              {...form.register("email")} 
            />
            {form.formState.errors.email && (
              <p className="text-[12px] text-[var(--error)]">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-[8px]">
            <label className="text-mono-eyebrow text-[var(--mute)]">Password</label>
            <Input 
              type="password" 
              inputSize="lg" 
              placeholder="••••••••" 
              className="bg-[var(--canvas)] border-[var(--ink-soft)] text-[var(--ash)] focus-visible:ring-[var(--link-blue)]"
              {...form.register("password")} 
            />
            {form.formState.errors.password && (
              <p className="text-[12px] text-[var(--error)]">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="button-primary w-full mt-[8px]"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
          
          <div className="text-center mt-4 text-body text-[var(--ash)]">
            Don't have an account? <Link href="/register" className="text-[var(--link-blue-soft)] hover:underline font-medium">Register your Gym</Link>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
