"use client"

import { NotificationsList } from "@/components/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] tracking-tight">Notifications</h1>
          <p className="text-[16px] text-[var(--mute)] mt-1">
            View and manage your recent activity alerts.
          </p>
        </div>
      </div>
      <NotificationsList />
    </div>
  );
}
