import * as React from "react"
import { Member } from "@/hooks/api/useMembers"

interface MemberProfileProps {
  member: Member;
}

export function MemberProfile({ member }: MemberProfileProps) {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6 bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
        <div className="h-20 w-20 rounded-full bg-[var(--canvas-paper)] flex items-center justify-center text-[var(--mute)] text-2xl font-semibold uppercase">
          {member.firstName[0]}{member.lastName[0]}
        </div>
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
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Email</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.email}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Phone</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.phone}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Gender</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2 capitalize">{member.gender.toLowerCase()}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Date of Birth</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">
                {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Emergency Contact */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">Emergency Contact</h3>
          <dl className="space-y-4">
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Name</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.emergencyContactName}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Phone</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.emergencyContactPhone}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Relation</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.emergencyContactRelation}</dd>
            </div>
          </dl>
        </div>

        {/* Fitness & Medical */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">Fitness & Medical</h3>
          <dl className="space-y-4">
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Height</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.heightCm ? `${member.heightCm} cm` : 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Weight</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.weightKg ? `${member.weightKg} kg` : 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Blood Group</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.bloodGroup?.replace('_', ' ') || 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Fitness Goal</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.fitnessGoal || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* CRM Information */}
        <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
          <h3 className="text-lg font-medium text-[var(--on-primary)] mb-4">CRM Information</h3>
          <dl className="space-y-4">
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Source</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2 capitalize">{member.source?.replace('_', ' ').toLowerCase() || 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Occupation</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{member.occupation || 'N/A'}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Joined Date</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2">{new Date(member.joinedAt).toLocaleDateString()}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-sm text-[var(--ash)]">Notes</dt>
              <dd className="text-sm font-medium text-[var(--on-primary)] col-span-2 whitespace-pre-wrap">{member.notes || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
