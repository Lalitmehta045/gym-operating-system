"use client";

import * as React from "react";
import { useNotifications, useMarkRead, useMarkAllRead, NotificationType } from "@/hooks/api/useNotifications";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { States } from "@/components/ui/States";
import { Check, CheckCheck, Bell, Calendar, CreditCard, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  MEMBERSHIP_EXPIRING: <Calendar className="h-4 w-4 text-orange-500" />,
  MEMBERSHIP_EXPIRED: <Calendar className="h-4 w-4 text-red-500" />,
  PAYMENT_DUE: <CreditCard className="h-4 w-4 text-orange-500" />,
  PAYMENT_RECEIVED: <CreditCard className="h-4 w-4 text-green-500" />,
  SYSTEM: <Info className="h-4 w-4 text-blue-500" />,
};

export function NotificationsList() {
  const [page, setPage] = React.useState(1);
  const [type, setType] = React.useState<NotificationType | "">("");
  const [isRead, setIsRead] = React.useState<"all" | "read" | "unread">("all");

  const { data, isLoading, error } = useNotifications({
    page,
    limit: 10,
    type: type || undefined,
    isRead: isRead === "all" ? undefined : isRead === "read",
  });

  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  if (error) {
    return (
      <States
        state="error"
        title="Failed to load notifications"
        description="There was an error loading your notifications. Please try again."
        action={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value as NotificationType | "");
              setPage(1);
            }}
            className="w-[200px]"
          >
            <option value="">All Types</option>
            <option value="MEMBERSHIP_EXPIRING">Membership Expiring</option>
            <option value="MEMBERSHIP_EXPIRED">Membership Expired</option>
            <option value="PAYMENT_DUE">Payment Due</option>
            <option value="PAYMENT_RECEIVED">Payment Received</option>
            <option value="SYSTEM">System</option>
          </Select>
          <Select
            value={isRead}
            onChange={(e) => {
              setIsRead(e.target.value as "all" | "read" | "unread");
              setPage(1);
            }}
            className="w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </Select>
        </div>
        <Button
          variant="secondary"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || (data?.data?.length === 0)}
          className="w-full sm:w-auto"
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {/* List */}
      <div className="bg-white rounded-[6px] border border-[#ebebeb] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[#4d4d4d]">Loading notifications...</div>
        ) : data?.data?.length === 0 ? (
          <States
            state="empty"
            title="No notifications found"
            description="You don't have any notifications matching your filters."
          />
        ) : (
          <div className="divide-y divide-[#ebebeb]">
            {data?.data?.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 flex gap-4 transition-colors hover:bg-[#fafafa]",
                  !notification.isRead ? "bg-[#fafafa]" : "bg-white"
                )}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ebebeb] bg-white">
                    {typeIcons[notification.type] || <Bell className="h-4 w-4 text-[#888888]" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className={cn("text-[14px] font-medium", !notification.isRead ? "text-[#171717]" : "text-[#4d4d4d]")}>
                      {notification.title}
                    </p>
                    <span className="text-[12px] text-[#888888] whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#4d4d4d] mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0 flex items-center">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => markRead.mutate(notification.id)}
                      disabled={markRead.isPending}
                      className="text-[#888888] hover:text-[#171717]"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#ebebeb] bg-white px-4 py-3 sm:px-6 rounded-[6px]">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] text-[#4d4d4d]">
                Showing <span className="font-medium text-[#171717]">{((page - 1) * 10) + 1}</span> to{" "}
                <span className="font-medium text-[#171717]">
                  {Math.min(page * 10, data.meta.total)}
                </span>{" "}
                of <span className="font-medium text-[#171717]">{data.meta.total}</span> results
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
