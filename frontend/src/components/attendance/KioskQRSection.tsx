"use client";

import { useAuth } from "@/hooks/useAuth";
import { useGymProfile } from "@/hooks/api/useSettings";
import { KioskQRCard } from "./KioskQRCard";

export function KioskQRSection() {
  const { user } = useAuth();
  const { data: gymProfile } = useGymProfile();
  
  if (!user || (user.role !== 'OWNER' && user.role !== 'MANAGER')) {
    return null;
  }

  const gymId = user.tenantId;
  if (!gymId) return null;

  const gymName = gymProfile?.name || "Our Gym";

  return (
    <div className="mb-[32px]">
      <KioskQRCard gymId={gymId} gymName={gymName} />
    </div>
  );
}
