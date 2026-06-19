"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ErrorState } from "@/components/ui/States"

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
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-[24px]">
      <div className="w-full max-w-[400px] rounded-[12px] bg-[#ffffff] p-[32px] shadow-[0px_2px_2px_#0000000a,0px_8px_16px_-4px_#0000000a]">
        <div className="mb-[32px] text-center">
          <h1 className="text-[24px] font-semibold tracking-[-0.96px] text-[#171717]">Log in to GymOS</h1>
          <p className="mt-[8px] text-[14px] text-[#4d4d4d]">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-[24px]">
            <ErrorState title="Login Failed" description={error} />
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[16px]">
          <div className="space-y-[8px]">
            <label className="text-[12px] font-medium text-[#171717] font-mono uppercase tracking-wider">Email address</label>
            <Input 
              type="email" 
              inputSize="lg" 
              placeholder="you@example.com" 
              {...form.register("email")} 
            />
            {form.formState.errors.email && (
              <p className="text-[12px] text-[#ee0000]">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-[8px]">
            <label className="text-[12px] font-medium text-[#171717] font-mono uppercase tracking-wider">Password</label>
            <Input 
              type="password" 
              inputSize="lg" 
              placeholder="••••••••" 
              {...form.register("password")} 
            />
            {form.formState.errors.password && (
              <p className="text-[12px] text-[#ee0000]">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full mt-[8px]"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
