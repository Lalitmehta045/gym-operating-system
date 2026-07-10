"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { User, Shield, Building2, Plug, Activity, Users } from "lucide-react";

const settingsNavigation = [
  { name: "Profile", href: "/settings/profile", icon: User, roles: ["OWNER", "MANAGER", "TRAINER"] },
  { name: "Account", href: "/settings/account", icon: Shield, roles: ["OWNER"] },
  { name: "Gym", href: "/settings/gym", icon: Building2, roles: ["OWNER", "MANAGER"] }, 
  { name: "Integrations", href: "/settings/integrations", icon: Plug, roles: ["OWNER"] },
  { name: "Audit Logs", href: "/settings/audit", icon: Activity, roles: ["OWNER"] },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || "TRAINER";

  const filteredNavigation = settingsNavigation.filter(item => item.roles.includes(userRole));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-[32px] max-w-[1200px] mx-auto w-full">
          <div className="mb-[32px]">
            <h1 className="text-[24px] font-semibold tracking-tight text-[var(--on-primary)]">Settings</h1>
            <p className="text-[14px] text-[var(--mute)] mt-[4px]">
              Manage your personal and workspace preferences.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-[240px] flex-shrink-0">
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-[6px] px-[12px] py-[8px] text-[14px] font-medium transition-colors whitespace-nowrap",
                        isActive
                          ? "bg-[var(--canvas-soft)] text-[var(--on-primary)]"
                          : "text-[var(--mute)] hover:bg-[var(--canvas-soft)] hover:text-[var(--on-primary)]"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-[12px] h-4 w-4 flex-shrink-0 transition-colors",
                          isActive ? "text-[var(--on-primary)]" : "text-[var(--ash)] group-hover:text-[var(--on-primary)]"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>
            <main className="flex-1 min-w-0">
              <div className="bg-[var(--canvas-light)] rounded-[6px] border border-[var(--hairline-soft)]">
                {children}
              </div>
            </main>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
