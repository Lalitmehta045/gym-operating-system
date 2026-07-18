import * as React from "react"
import { Member } from "@/hooks/api/useMembers"

interface MemberProfileProps {
  member: Member;
}

// ── BMI helpers ──────────────────────────────────────────────────────────────

function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#f59e0b" }
  if (bmi < 25) return { label: "Normal", color: "#22c55e" }
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" }
  return { label: "Obese", color: "#ef4444" }
}

function formatPreferredTime(val: string | undefined | null): string {
  if (!val) return "N/A"
  const map: Record<string, string> = {
    EARLY_MORNING: "Early Morning (5-7 AM)",
    MORNING: "Morning (7-10 AM)",
    AFTERNOON: "Afternoon (12-3 PM)",
    EVENING: "Evening (4-7 PM)",
    NIGHT: "Night (7-10 PM)",
    FLEXIBLE: "Flexible",
  }
  return map[val] || val
}

function formatExperienceLevel(val: string | undefined | null): string {
  if (!val) return "N/A"
  return val.charAt(0) + val.slice(1).toLowerCase()
}

function formatBloodGroup(val: string | undefined | null): string {
  if (!val) return "N/A"
  return val.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")
}

function formatSource(val: string | undefined | null): string {
  if (!val) return "N/A"
  const map: Record<string, string> = {
    WALK_IN: "Walk-in",
    WHATSAPP: "WhatsApp",
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    REFERRAL: "Referral",
    WEBSITE: "Website",
    GOOGLE: "Google",
    YOUTUBE: "YouTube",
    NEWSPAPER: "Newspaper",
    FRIEND_FAMILY: "Friend / Family",
    OTHER: "Other",
  }
  return map[val] || val.replace(/_/g, " ").toLowerCase()
}

// ── Row component ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3">
      <dt className="text-sm text-[var(--ash)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{value || "N/A"}</dd>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function MemberProfile({ member }: MemberProfileProps) {
  // Calculate BMI if data available
  const bmiData = React.useMemo(() => {
    if (!member.heightCm || !member.weightKg) return null
    const h = Number(member.heightCm)
    const w = Number(member.weightKg)
    if (!h || !w) return null
    const bmi = calculateBMI(h, w)
    return { value: bmi.toFixed(1), ...getBMICategory(bmi) }
  }, [member.heightCm, member.weightKg])

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            className="h-20 w-20 rounded-full object-cover border-2 border-[var(--hairline-soft)]"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-[var(--canvas-paper)] flex items-center justify-center text-[var(--mute)] text-2xl font-semibold uppercase">
            {member.firstName[0]}{member.lastName[0]}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-[var(--on-primary)]">{member.firstName} {member.lastName}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-[var(--ash)]">
            <span>Code: {member.memberCode}</span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${
                member.status === 'ACTIVE' ? 'bg-green-500' :
                member.status === 'PENDING' ? 'bg-yellow-500' :
                member.status === 'SUSPENDED' ? 'bg-orange-500' : 'bg-red-500'
              }`} />
              {member.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">Contact Information</h3>
          <dl className="space-y-4">
            <InfoRow label="Email" value={member.email} />
            <InfoRow label="Phone" value={member.phone} />
            <InfoRow label="WhatsApp" value={member.whatsappNumber} />
            <InfoRow label="Gender" value={member.gender.toLowerCase()} />
            <InfoRow
              label="Date of Birth"
              value={member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "N/A"}
            />
          </dl>
        </div>

        {/* Emergency Contact */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">Emergency Contact</h3>
          <dl className="space-y-4">
            <InfoRow label="Name" value={member.emergencyContactName} />
            <InfoRow label="Phone" value={member.emergencyContactPhone} />
            <InfoRow label="Relation" value={member.emergencyContactRelation} />
          </dl>
        </div>

        {/* Physical & Medical */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">Physical & Medical</h3>
          <dl className="space-y-4">
            <InfoRow label="Height" value={member.heightCm ? `${member.heightCm} cm` : "N/A"} />
            <InfoRow label="Weight" value={member.weightKg ? `${member.weightKg} kg` : "N/A"} />
            <InfoRow
              label="BMI"
              value={
                bmiData ? (
                  <span style={{ color: bmiData.color }} className="font-semibold">
                    {bmiData.value} — {bmiData.label}
                  </span>
                ) : (
                  "N/A"
                )
              }
            />
            <InfoRow label="Blood Group" value={formatBloodGroup(member.bloodGroup)} />
            {member.medicalNotes && (
              <InfoRow label="Medical Notes" value={
                <span className="whitespace-pre-wrap">{member.medicalNotes}</span>
              } />
            )}
          </dl>
        </div>

        {/* Fitness Profile */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">Fitness Profile</h3>
          <dl className="space-y-4">
            <InfoRow label="Fitness Goal" value={member.fitnessGoal} />
            <InfoRow label="Experience" value={formatExperienceLevel(member.experienceLevel)} />
            <InfoRow label="Preferred Time" value={formatPreferredTime(member.preferredTime)} />
            {member.fitnessNotes && (
              <InfoRow label="Fitness Notes" value={
                <span className="whitespace-pre-wrap">{member.fitnessNotes}</span>
              } />
            )}
          </dl>
        </div>

        {/* CRM Information */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)] lg:col-span-2">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">CRM Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Source" value={formatSource(member.source)} />
            <InfoRow label="Occupation" value={member.occupation} />
            <InfoRow label="Joined Date" value={new Date(member.joinedAt).toLocaleDateString()} />
            {member.notes && (
              <div className="md:col-span-2">
                <InfoRow label="Notes" value={
                  <span className="whitespace-pre-wrap">{member.notes}</span>
                } />
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
