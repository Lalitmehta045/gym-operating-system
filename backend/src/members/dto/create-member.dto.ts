// ============================================================================
// CreateMemberDto - Phase 3A Member creation contract
// ============================================================================

import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  PHONE_PATTERN,
  PHONE_VALIDATION_MESSAGE,
} from '../../common/validators/validation.constants.js';
import { BloodGroup, Gender, MemberSource } from '../enums/member.enums.js';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  memberCode: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  phone: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsDateString()
  @MaxLength(10)
  dateOfBirth?: string;

  @IsOptional()
  @IsDateString()
  joinedAt?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  photoUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  emergencyContactName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  emergencyContactPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  emergencyContactRelation: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999)
  heightCm?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999)
  weightKg?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fitnessGoal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsEnum(MemberSource)
  source?: MemberSource;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'EXPIRED', 'PENDING'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  medicalNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  fitnessNotes?: string;

  @IsOptional()
  @IsString()
  assignedTrainerId?: string;
}
