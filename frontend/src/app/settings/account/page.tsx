import { AccountForm } from "@/components/settings/AccountForm";

export default function AccountPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-[18px] font-medium text-[#171717]">Account Settings</h2>
        <p className="text-[14px] text-[#4d4d4d] mt-1">
          Manage your password and active sessions.
        </p>
      </div>
      <div className="max-w-xl border-t border-[#ebebeb] pt-6">
        <AccountForm />
      </div>
    </div>
  );
}
