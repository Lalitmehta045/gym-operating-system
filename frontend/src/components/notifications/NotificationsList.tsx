"use client";

import * as React from "react";
import { useNotifications, useMarkRead, useMarkAllRead, NotificationType } from "@/hooks/api/useNotifications";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { States } from "@/components/ui/States";
import { Check, CheckCircle2, Bell, Calendar, CreditCard, Info, AlertTriangle, User, Megaphone, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

  const getIconDetails = (notification: any) => {
    const type = notification.type;
    const title = notification.title?.toLowerCase() || '';

    if (type === 'PAYMENT_RECEIVED') {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        bgClass: 'bg-green-50',
        unreadDotClass: 'bg-green-500',
        unreadTextClass: 'text-green-700',
        unreadBorderClass: 'border-green-200',
        unreadBgClass: 'bg-green-50',
      };
    }
    if (type === 'PAYMENT_DUE') {
      return {
        icon: <CreditCard className="w-5 h-5 text-orange-600" />,
        bgClass: 'bg-orange-50',
        unreadDotClass: 'bg-orange-500',
        unreadTextClass: 'text-orange-700',
        unreadBorderClass: 'border-orange-200',
        unreadBgClass: 'bg-orange-50',
      };
    }
    if (type === 'MEMBERSHIP_EXPIRING') {
      return {
        icon: <Calendar className="w-5 h-5 text-blue-600" />,
        bgClass: 'bg-blue-50',
        unreadDotClass: 'bg-blue-500',
        unreadTextClass: 'text-blue-700',
        unreadBorderClass: 'border-blue-200',
        unreadBgClass: 'bg-blue-50',
      };
    }
    if (type === 'MEMBERSHIP_EXPIRED') {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        bgClass: 'bg-red-50',
        unreadDotClass: 'bg-red-500',
        unreadTextClass: 'text-red-700',
        unreadBorderClass: 'border-red-200',
        unreadBgClass: 'bg-red-50',
      };
    }
    if (type === 'SYSTEM') {
      if (title.includes('member') || title.includes('join')) {
        return {
          icon: <User className="w-5 h-5 text-purple-600" />,
          bgClass: 'bg-purple-50',
          unreadDotClass: 'bg-purple-500',
          unreadTextClass: 'text-purple-700',
          unreadBorderClass: 'border-purple-200',
          unreadBgClass: 'bg-purple-50',
        };
      }
      return {
        icon: <Megaphone className="w-5 h-5 text-green-600" />,
        bgClass: 'bg-green-50',
        unreadDotClass: 'bg-green-500',
        unreadTextClass: 'text-green-700',
        unreadBorderClass: 'border-green-200',
        unreadBgClass: 'bg-green-50',
      };
    }

    return {
      icon: <Bell className="w-5 h-5 text-[var(--slate-soft)]" />,
      bgClass: 'bg-[var(--canvas-paper)]',
      unreadDotClass: 'bg-[var(--canvas-paper)]0',
      unreadTextClass: 'text-[var(--ink-soft)]',
      unreadBorderClass: 'border-[var(--hairline)]',
      unreadBgClass: 'bg-[var(--canvas-paper)]',
    };
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as NotificationType | "");
              setPage(1);
            }}
            className="h-10 px-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-light)] text-sm text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] min-w-[150px]"
          >
            <option value="">All Types</option>
            <option value="MEMBERSHIP_EXPIRING">Membership Expiring</option>
            <option value="MEMBERSHIP_EXPIRED">Membership Expired</option>
            <option value="PAYMENT_DUE">Payment Due</option>
            <option value="PAYMENT_RECEIVED">Payment Received</option>
            <option value="SYSTEM">System</option>
          </select>
          <select
            value={isRead}
            onChange={(e) => {
              setIsRead(e.target.value as "all" | "read" | "unread");
              setPage(1);
            }}
            className="h-10 px-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-light)] text-sm text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || (data?.data?.length === 0)}
          className="bg-[var(--canvas-light)] border-[var(--hairline)] text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] h-10 px-4 rounded-lg flex items-center gap-2 w-full sm:w-auto font-medium"
        >
          <Check className="w-4 h-4 text-[var(--mute)]" />
          Mark all as read
        </Button>
      </div>

      {/* List */}
      <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--mute)]">Loading notifications...</div>
        ) : data?.data?.length === 0 ? (
          <States
            state="empty"
            title="No notifications found"
            description="You don't have any notifications matching your filters."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.data?.map((notification) => {
              const iconDetails = getIconDetails(notification);
              return (
                <div
                  key={notification.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--canvas-paper)]/50 transition-colors bg-[var(--canvas-light)] group cursor-pointer"
                  onClick={() => !notification.isRead && markRead.mutate(notification.id)}
                >
                  <div className={`flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center ${iconDetails.bgClass}`}>
                    {iconDetails.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-[var(--on-primary)] text-[15px]">{notification.title}</p>
                    <p className="text-sm text-[var(--mute)] mt-0.5 line-clamp-1">{notification.message}</p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-[var(--on-primary)] font-medium">{format(new Date(notification.createdAt), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-[var(--mute)] mt-0.5">{format(new Date(notification.createdAt), 'hh:mm a')}</p>
                    </div>
                    
                    <div className="w-[85px] flex justify-end">
                      {notification.isRead ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-[var(--hairline)] text-[var(--mute)] bg-[var(--canvas-paper)]">
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></span>
                          Read
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${iconDetails.unreadBorderClass} ${iconDetails.unreadTextClass} ${iconDetails.unreadBgClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${iconDetails.unreadDotClass}`}></span>
                          Unread
                        </span>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--ash)] hover:text-[var(--slate-soft)] hover:bg-[var(--canvas-paper)] rounded-full"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.meta.total > 0 && (
        <div className="flex items-center justify-between border-t border-[var(--hairline)] bg-[var(--canvas-light)] px-6 py-4 rounded-b-xl -mt-6">
          <span className="text-sm text-[var(--mute)]">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.meta.total)} of {data.meta.total} notifications
          </span>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-2 text-[var(--mute)] border-[var(--hairline)] bg-[var(--canvas-light)]"
            >
              {'<'}
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 text-white bg-[#6C47FF] border-[#6C47FF] hover:bg-[#5835e5]">
              {page}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page === data.meta.totalPages}
              className="h-8 px-2 text-[var(--mute)] border-[var(--hairline)] bg-[var(--canvas-light)] hover:bg-[var(--canvas-paper)]"
            >
              {'>'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
