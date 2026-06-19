// ============================================================================
// Member Enums - Phase 3A Member Management foundation
// ============================================================================

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export const MemberStatusOptions = [
  MemberStatus.ACTIVE,
  MemberStatus.SUSPENDED,
  MemberStatus.EXPIRED,
  MemberStatus.PENDING,
] as const;

export type MemberStatusType = (typeof MemberStatusOptions)[number];

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export const GenderOptions = [
  Gender.MALE,
  Gender.FEMALE,
  Gender.OTHER,
  Gender.PREFER_NOT_TO_SAY,
] as const;

export type GenderType = (typeof GenderOptions)[number];

export enum MemberSource {
  WALK_IN = 'WALK_IN',
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  REFERRAL = 'REFERRAL',
  WEBSITE = 'WEBSITE',
  OTHER = 'OTHER',
}

export const MemberSourceOptions = [
  MemberSource.WALK_IN,
  MemberSource.WHATSAPP,
  MemberSource.INSTAGRAM,
  MemberSource.FACEBOOK,
  MemberSource.REFERRAL,
  MemberSource.WEBSITE,
  MemberSource.OTHER,
] as const;

export type MemberSourceType = (typeof MemberSourceOptions)[number];

export enum BloodGroup {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
}

export const BloodGroupOptions = [
  BloodGroup.A_POSITIVE,
  BloodGroup.A_NEGATIVE,
  BloodGroup.B_POSITIVE,
  BloodGroup.B_NEGATIVE,
  BloodGroup.AB_POSITIVE,
  BloodGroup.AB_NEGATIVE,
  BloodGroup.O_POSITIVE,
  BloodGroup.O_NEGATIVE,
] as const;

export type BloodGroupType = (typeof BloodGroupOptions)[number];
