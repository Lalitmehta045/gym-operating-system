"use client";

import * as React from "react";
import { useChangePassword, useLogoutAllSessions } from "@/hooks/api/useSettings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_+=|<>{}[\]\\])/;

export function AccountForm() {
  const changePassword = useChangePassword();
  const logoutAll = useLogoutAllSessions();

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = React.useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    if (passwordData.newPassword.length > 128) {
      setPasswordError("Password must not exceed 128 characters");
      return;
    }

    if (!PASSWORD_PATTERN.test(passwordData.newPassword)) {
      setPasswordError(
        "Password must contain uppercase, lowercase, a number, and a special character"
      );
      return;
    }

    if (passwordData.currentPassword.length < 8 || passwordData.currentPassword.length > 128) {
      setPasswordError("Current password is invalid");
      return;
    }

    changePassword.mutate(
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      }
    );
  };

  const handleLogoutAll = () => {
    if (window.confirm("Are you sure you want to log out of all sessions? You will be logged out of this session as well.")) {
      logoutAll.mutate(undefined, {
        onSuccess: () => {
          window.location.href = "/auth/login";
        }
      });
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <h3 className="text-[16px] font-medium text-[var(--on-primary)] mb-4">Change Password</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-[14px] font-medium text-[var(--on-primary)]">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-[14px] font-medium text-[var(--on-primary)]">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[14px] font-medium text-[var(--on-primary)]">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        {passwordError && (
          <div className="text-[14px] text-red-600 font-medium">
            {passwordError}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={changePassword.isPending}
            variant="primary"
          >
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>

        {changePassword.isSuccess && (
          <div className="text-[14px] text-green-600 font-medium text-right mt-2">
            Password updated successfully!
          </div>
        )}
        {changePassword.isError && (
          <div className="text-[14px] text-red-600 font-medium text-right mt-2">
            Failed to update password. Please check your current password.
          </div>
        )}
      </form>

      <div className="pt-8 border-t border-[var(--hairline-soft)]">
        <h3 className="text-[16px] font-medium text-red-600 mb-2">Danger Zone</h3>
        <p className="text-[14px] text-[var(--mute)] mb-4">
          Log out of all active sessions across all devices. You will be required to log in again.
        </p>
        <Button
          type="button"
          variant="primary"
          className="bg-[#ee0000] text-[#ffffff] hover:bg-[#c50000]"
          onClick={handleLogoutAll}
          disabled={logoutAll.isPending}
        >
          {logoutAll.isPending ? "Logging out..." : "Logout All Sessions"}
        </Button>
        {logoutAll.isError && (
          <div className="text-[14px] text-red-600 font-medium mt-2">
            Failed to logout all sessions.
          </div>
        )}
      </div>
    </div>
  );
}
