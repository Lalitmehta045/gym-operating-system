import { GymSettingsForm } from "@/components/settings/GymSettingsForm";

export default function GymSettingsPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-[18px] font-medium text-[#171717]">Gym Settings</h2>
        <p className="text-[14px] text-[#4d4d4d] mt-1">
          Manage your gym's public profile and operational details.
        </p>
      </div>
      <div className="max-w-2xl border-t border-[#ebebeb] pt-6">
        <GymSettingsForm />
      </div>
    </div>
  );
}
