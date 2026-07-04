import { ProfileForm } from "@/components/settings/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-[18px] font-medium text-[var(--on-primary)]">Profile Settings</h2>
        <p className="text-[14px] text-[var(--mute)] mt-1">
          Update your personal information and contact details.
        </p>
      </div>
      <div className="max-w-xl border-t border-[var(--hairline-soft)] pt-6">
        <ProfileForm />
      </div>
    </div>
  );
}
