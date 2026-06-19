"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Building2, Plug } from "lucide-react";

const settingsNavigation = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Account", href: "/settings/account", icon: Shield },
  { name: "Gym", href: "/settings/gym", icon: Building2 },
  { name: "Integrations", href: "/settings/integrations", icon: Plug },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-[32px] max-w-[1200px] mx-auto w-full">
          <div className="mb-[32px]">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#171717]">Settings</h1>
            <p className="text-[14px] text-[#4d4d4d] mt-[4px]">
              Manage your personal and workspace preferences.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-[240px] flex-shrink-0">
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0">
                {settingsNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center rounded-[6px] px-[12px] py-[8px] text-[14px] font-medium transition-colors whitespace-nowrap",
                        isActive
                          ? "bg-[#fafafa] text-[#171717]"
                          : "text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-[12px] h-4 w-4 flex-shrink-0 transition-colors",
                          isActive ? "text-[#171717]" : "text-[#888888] group-hover:text-[#171717]"
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
              <div className="bg-white rounded-[6px] border border-[#ebebeb]">
                {children}
              </div>
            </main>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
