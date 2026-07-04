"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfile, useUpdateProfile } from "@/hooks/api/useSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { States } from "@/components/ui/States";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(100),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(100),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "" },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values);
  };

  if (isLoading) {
    return <div className="text-[14px] text-[var(--mute)]">Loading profile...</div>;
  }

  if (error) {
    return (
      <States
        state="error"
        title="Failed to load profile"
        description="There was an error loading your profile data."
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-[14px] font-medium text-[var(--on-primary)]">
            First Name
          </label>
          <Input id="firstName" {...form.register("firstName")} placeholder="e.g. John" />
          {form.formState.errors.firstName && (
            <p className="text-[12px] text-red-600">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-[14px] font-medium text-[var(--on-primary)]">
            Last Name
          </label>
          <Input id="lastName" {...form.register("lastName")} placeholder="e.g. Doe" />
          {form.formState.errors.lastName && (
            <p className="text-[12px] text-red-600">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-[14px] font-medium text-[var(--on-primary)]">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={profile?.email || ""}
          readOnly
          className="bg-[var(--canvas-soft)] cursor-not-allowed"
        />
        <p className="text-[12px] text-[var(--ash)]">Email cannot be changed here.</p>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={updateProfile.isPending || isLoading}
          variant="primary"
        >
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {updateProfile.isSuccess && (
        <div className="text-[14px] text-green-600 font-medium text-right">
          Profile updated successfully!
        </div>
      )}
      {updateProfile.isError && (
        <div className="text-[14px] text-red-600 font-medium text-right">
          Failed to update profile. Please try again.
        </div>
      )}
    </form>
  );
}
