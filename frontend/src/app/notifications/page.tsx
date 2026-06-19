"use client"

import { NotificationsList } from "@/components/notifications/NotificationsList";

export default function NotificationsPage() {
  return (
    <div className="p-[32px] max-w-[1200px] mx-auto w-full">
      <div className="mb-[24px]">
        <h1 className="text-[24px] font-semibold tracking-tight text-[#171717]">Notifications</h1>
        <p className="text-[14px] text-[#4d4d4d] mt-[4px]">
          View and manage your recent activity alerts.
        </p>
      </div>
      <NotificationsList />
    </div>
  );
}
