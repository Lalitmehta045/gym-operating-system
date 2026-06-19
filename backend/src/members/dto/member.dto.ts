// ============================================================================
// MemberDto - Phase 3A response DTO for a single member
// ============================================================================

export interface MemberDto {
  id: string;
  tenantId: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  photoUrl: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  heightCm: string | null;
  weightKg: string | null;
  fitnessGoal: string | null;
  notes: string | null;
  source: string | null;
  occupation: string | null;
  bloodGroup: string | null;
  status: string;
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
