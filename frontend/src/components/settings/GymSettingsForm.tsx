"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGymProfile, useUpdateGymProfile } from "@/hooks/api/useSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { States } from "@/components/ui/States";

const gymSettingsSchema = z.object({
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  gymDescription: z.string().max(2000).optional().or(z.literal("")),
  gymWebsite: z
    .string()
    .url("Must be a valid URL with protocol (https://...)")
    .max(2048)
    .optional()
    .or(z.literal("")),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Invalid GST number format"
    )
    .optional()
    .or(z.literal("")),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a 3-letter currency code (e.g. INR)"),
  timezone: z
    .string()
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/, "Use IANA timezone (e.g. Asia/Kolkata)"),
});

type GymSettingsFormValues = z.infer<typeof gymSettingsSchema>;

export function GymSettingsForm() {
  const { data: gymProfile, isLoading, error } = useGymProfile();
  const updateGymProfile = useUpdateGymProfile();

  const form = useForm<GymSettingsFormValues>({
    resolver: zodResolver(gymSettingsSchema),
    defaultValues: {
      country: "",
      state: "",
      city: "",
      gymDescription: "",
      gymWebsite: "",
      gstNumber: "",
      currency: "INR",
      timezone: "Asia/Kolkata",
    },
  });

  React.useEffect(() => {
    if (gymProfile) {
      form.reset({
        country: gymProfile.country || "",
        state: gymProfile.state || "",
        city: gymProfile.city || "",
        gymDescription: gymProfile.gymDescription || "",
        gymWebsite: gymProfile.gymWebsite || "",
        gstNumber: gymProfile.gstNumber || "",
        currency: gymProfile.currency || "INR",
        timezone: gymProfile.timezone || "Asia/Kolkata",
      });
    }
  }, [gymProfile, form]);

  const onSubmit = (values: GymSettingsFormValues) => {
    const payload: Record<string, string> = {
      country: values.country,
      state: values.state,
      city: values.city,
      currency: values.currency,
      timezone: values.timezone,
    };
    if (values.gymDescription) payload.gymDescription = values.gymDescription;
    if (values.gymWebsite) payload.gymWebsite = values.gymWebsite;
    if (values.gstNumber) payload.gstNumber = values.gstNumber;

    updateGymProfile.mutate(payload);
  };

  if (isLoading) {
    return <div className="text-[14px] text-[var(--mute)]">Loading gym settings...</div>;
  }

  if (error) {
    return (
      <States
        state="error"
        title="Failed to load gym settings"
        description="There was an error loading your gym profile data."
      />
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-[16px] font-medium text-[var(--on-primary)] border-b border-[var(--hairline-soft)] pb-2">
          General Information
        </h3>

        <div className="space-y-2">
          <label className="text-[14px] font-medium text-[var(--on-primary)]">Gym Name</label>
          <Input value={gymProfile?.name || ""} readOnly className="bg-[var(--canvas-soft)] cursor-not-allowed" />
        </div>

        <div className="space-y-2">
          <label htmlFor="gymDescription" className="text-[14px] font-medium text-[var(--on-primary)]">
            Description
          </label>
          <textarea
            id="gymDescription"
            {...form.register("gymDescription")}
            rows={3}
            className="flex w-full rounded-[6px] border border-[var(--hairline-soft)] bg-[var(--canvas-light)] px-[12px] py-[8px] text-[14px] text-[var(--on-primary)] transition-colors placeholder:text-[var(--ash)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171717]"
            placeholder="A brief description of your gym..."
          />
          {form.formState.errors.gymDescription && (
            <p className="text-[12px] text-red-600">{form.formState.errors.gymDescription.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="gymWebsite" className="text-[14px] font-medium text-[var(--on-primary)]">
              Website
            </label>
            <Input
              id="gymWebsite"
              type="url"
              {...form.register("gymWebsite")}
              placeholder="https://www.example.com"
            />
            {form.formState.errors.gymWebsite && (
              <p className="text-[12px] text-red-600">{form.formState.errors.gymWebsite.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="gstNumber" className="text-[14px] font-medium text-[var(--on-primary)]">
              GST Number
            </label>
            <Input id="gstNumber" {...form.register("gstNumber")} placeholder="22AAAAA0000A1Z5" />
            {form.formState.errors.gstNumber && (
              <p className="text-[12px] text-red-600">{form.formState.errors.gstNumber.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[16px] font-medium text-[var(--on-primary)] border-b border-[var(--hairline-soft)] pb-2">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="country" className="text-[14px] font-medium text-[var(--on-primary)]">Country</label>
            <Input id="country" {...form.register("country")} />
            {form.formState.errors.country && (
              <p className="text-[12px] text-red-600">{form.formState.errors.country.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="state" className="text-[14px] font-medium text-[var(--on-primary)]">State / Province</label>
            <Input id="state" {...form.register("state")} />
            {form.formState.errors.state && (
              <p className="text-[12px] text-red-600">{form.formState.errors.state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="city" className="text-[14px] font-medium text-[var(--on-primary)]">City</label>
            <Input id="city" {...form.register("city")} />
            {form.formState.errors.city && (
              <p className="text-[12px] text-red-600">{form.formState.errors.city.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[16px] font-medium text-[var(--on-primary)] border-b border-[var(--hairline-soft)] pb-2">Localization</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="currency" className="text-[14px] font-medium text-[var(--on-primary)]">Currency Code</label>
            <select
              id="currency"
              {...form.register("currency")}
              className="flex w-full rounded-[6px] border border-[var(--hairline-soft)] bg-[var(--canvas-light)] px-[12px] py-[8px] text-[14px] text-[var(--on-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171717]"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="SGD">SGD (S$)</option>
            </select>
            {form.formState.errors.currency && (
              <p className="text-[12px] text-red-600">{form.formState.errors.currency.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="timezone" className="text-[14px] font-medium text-[var(--on-primary)]">Timezone</label>
            <Input id="timezone" {...form.register("timezone")} placeholder="Asia/Kolkata" />
            {form.formState.errors.timezone && (
              <p className="text-[12px] text-red-600">{form.formState.errors.timezone.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end border-t border-[var(--hairline-soft)] mt-8 pt-6">
        <Button type="submit" disabled={updateGymProfile.isPending || isLoading} variant="primary">
          {updateGymProfile.isPending ? "Saving..." : "Save Gym Settings"}
        </Button>
      </div>

      {updateGymProfile.isSuccess && (
        <div className="text-[14px] text-green-600 font-medium text-right">
          Gym settings updated successfully!
        </div>
      )}
      {updateGymProfile.isError && (
        <div className="text-[14px] text-red-600 font-medium text-right">
          Failed to update gym settings. Please try again.
        </div>
      )}
    </form>
  );
}
