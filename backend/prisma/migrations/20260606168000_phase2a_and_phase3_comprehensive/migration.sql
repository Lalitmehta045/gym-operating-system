-- ============================================================================
-- Migration: 20260606168000_phase2a_and_phase3_comprehensive
-- Description: Comprehensive migration creating all missing tables and fields:
--              - Phase 2A: MembershipPlan table with production optimizations
--              - Phase 3A: Member table with CRM/medical fields
--              - Phase 4A: Attendance table with audit trail and reporting optimizations
--              - Enum updates for all phases
-- ============================================================================

-- ─── Create Enums ─────────────────────────────────────────────────────────

CREATE TYPE "PlanType" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'CUSTOM');

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

CREATE TYPE "MemberSource" AS ENUM ('WALK_IN', 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'REFERRAL', 'WEBSITE', 'OTHER');

CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'PENDING');

CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'MISSED');

-- ─── Phase 2A: Add Tenant Geography Fields ────────────────────────────────

ALTER TABLE "tenants"
  ADD COLUMN "country" VARCHAR(100),
  ADD COLUMN "state" VARCHAR(100),
  ADD COLUMN "city" VARCHAR(100),
  ADD COLUMN "gym_logo_url" VARCHAR(2048),
  ADD COLUMN "gym_description" TEXT,
  ADD COLUMN "gym_website" VARCHAR(2048),
  ADD COLUMN "gst_number" VARCHAR(15),
  ADD COLUMN "timezone" VARCHAR(64) DEFAULT 'Asia/Kolkata',
  ADD COLUMN "currency" VARCHAR(3) DEFAULT 'INR',
  ADD COLUMN "business_hours" JSON;

-- ─── Phase 2A: Create MembershipPlan Table ────────────────────────────────

CREATE TABLE "membership_plans" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "description" TEXT,
  "plan_type" "PlanType" NOT NULL,
  "duration_days" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  
  CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- ─── Phase 3A: Create Member Table ────────────────────────────────────────

CREATE TABLE "members" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "member_code" VARCHAR(50) NOT NULL,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "gender" "Gender" NOT NULL,
  "date_of_birth" DATE,
  "photo_url" VARCHAR(2048),
  "emergency_contact" VARCHAR(100),
  "emergency_phone" VARCHAR(20),
  "status" "MemberStatus" DEFAULT 'PENDING',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "fitness_goal" VARCHAR(255),
  "notes" TEXT,
  "source" "MemberSource",
  "occupation" VARCHAR(100),
  "blood_group" "BloodGroup",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  
  CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- ─── Phase 4A: Create Attendance Table ────────────────────────────────────

CREATE TABLE "attendances" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "member_id" UUID NOT NULL,
  "marked_by_user_id" UUID,
  "check_in_at" TIMESTAMP(6) NOT NULL,
  "check_out_at" TIMESTAMP(6),
  "attendance_date" DATE NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL,
  "deleted_at" TIMESTAMP(6),
  
  CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- ─── Add Foreign Keys ─────────────────────────────────────────────────────

ALTER TABLE "membership_plans" 
  ADD CONSTRAINT "membership_plans_tenant_id_fkey" 
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "members" 
  ADD CONSTRAINT "members_tenant_id_fkey" 
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendances" 
  ADD CONSTRAINT "attendances_tenant_id_fkey" 
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendances" 
  ADD CONSTRAINT "attendances_member_id_fkey" 
  FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendances" 
  ADD CONSTRAINT "attendances_marked_by_user_id_fkey" 
  FOREIGN KEY ("marked_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Indexes: Phase 2A - Membership Plans ────────────────────────────────

CREATE INDEX "idx_membership_plan_tenant_deleted" 
  ON "membership_plans"("tenant_id", "deleted_at");

CREATE INDEX "idx_membership_plan_tenant_active" 
  ON "membership_plans"("tenant_id", "isActive", "deleted_at");

CREATE INDEX "idx_membership_plan_tenant_name" 
  ON "membership_plans"("tenant_id", "name", "deleted_at");

CREATE INDEX "idx_membership_plan_tenant_duration" 
  ON "membership_plans"("tenant_id", "duration_days", "deleted_at");

CREATE INDEX "idx_membership_plan_tenant_type" 
  ON "membership_plans"("tenant_id", "plan_type", "deleted_at");

CREATE INDEX "idx_membership_plan_tenant_display" 
  ON "membership_plans"("tenant_id", "display_order", "deleted_at");

CREATE INDEX "idx_membership_plan_tenant_catalog" 
  ON "membership_plans"("tenant_id", "isActive", "display_order", "deleted_at");

-- ─── Indexes: Phase 3A - Members ──────────────────────────────────────────

CREATE INDEX "idx_member_tenant_deleted" 
  ON "members"("tenant_id", "deleted_at");

CREATE INDEX "idx_member_tenant_active" 
  ON "members"("tenant_id", "isActive", "deleted_at");

CREATE INDEX "idx_member_tenant_email" 
  ON "members"("tenant_id", "email", "deleted_at");

CREATE INDEX "idx_member_tenant_phone" 
  ON "members"("tenant_id", "phone", "deleted_at");

CREATE INDEX "idx_member_tenant_name" 
  ON "members"("tenant_id", "last_name", "first_name", "deleted_at");

CREATE INDEX "idx_member_tenant_fitness_goal" 
  ON "members"("tenant_id", "fitness_goal", "deleted_at");

CREATE INDEX "idx_member_tenant_status_active" 
  ON "members"("tenant_id", "status", "isActive", "deleted_at");

CREATE INDEX "idx_member_tenant_source" 
  ON "members"("tenant_id", "source", "deleted_at");

CREATE INDEX "idx_member_tenant_occupation" 
  ON "members"("tenant_id", "occupation", "deleted_at");

CREATE INDEX "idx_member_tenant_blood_group" 
  ON "members"("tenant_id", "blood_group", "deleted_at");

CREATE INDEX "idx_member_code" 
  ON "members"("member_code");

CREATE INDEX "idx_member_deleted_at" 
  ON "members"("deleted_at");

-- ─── Indexes: Phase 4A - Attendance ────────────────────────────────────────

CREATE INDEX "idx_attendance_tenant_deleted" 
  ON "attendances"("tenant_id", "deleted_at");

CREATE INDEX "idx_attendance_tenant_member" 
  ON "attendances"("tenant_id", "member_id", "deleted_at");

CREATE INDEX "idx_attendance_tenant_member_checkin" 
  ON "attendances"("tenant_id", "member_id", "check_in_at", "deleted_at");

CREATE INDEX "idx_attendance_tenant_status" 
  ON "attendances"("tenant_id", "status", "deleted_at");

CREATE INDEX "idx_attendance_tenant_checkin" 
  ON "attendances"("tenant_id", "check_in_at", "deleted_at");

CREATE INDEX "idx_attendance_tenant_checkin_status" 
  ON "attendances"("tenant_id", "check_in_at", "status");

CREATE INDEX "idx_attendance_tenant_date" 
  ON "attendances"("tenant_id", "attendance_date", "deleted_at");

CREATE INDEX "idx_attendance_tenant_date_member" 
  ON "attendances"("tenant_id", "attendance_date", "member_id", "deleted_at");

CREATE INDEX "idx_attendance_marked_by_user" 
  ON "attendances"("marked_by_user_id", "deleted_at");

CREATE INDEX "idx_member_attendance_lookup" 
  ON "attendances"("member_id", "deleted_at");

CREATE INDEX "idx_attendance_checkin_date" 
  ON "attendances"("check_in_at", "deleted_at");

-- ─── Tenant Reporting Indexes ─────────────────────────────────────────────

CREATE INDEX "idx_tenant_gst_number" 
  ON "tenants"("gst_number");

CREATE INDEX "idx_tenant_geo_reporting" 
  ON "tenants"("country", "state", "city");

CREATE INDEX "idx_tenant_geo_active_reporting" 
  ON "tenants"("country", "state", "deleted_at");

-- ─── Column Comments for Documentation ────────────────────────────────────

-- Phase 2A: Tenant Geography
COMMENT ON COLUMN "tenants"."country" IS 'Optional tenant geography for future analytics and reporting.';
COMMENT ON COLUMN "tenants"."state" IS 'Optional tenant geography for future analytics and reporting.';
COMMENT ON COLUMN "tenants"."city" IS 'Optional tenant geography for future analytics and reporting.';
COMMENT ON COLUMN "tenants"."gym_logo_url" IS 'Branding asset for gym portal and member app.';
COMMENT ON COLUMN "tenants"."gym_description" IS 'Marketing description for gym branding and member portal.';
COMMENT ON COLUMN "tenants"."gym_website" IS 'Official website URL for gym branding and verification.';
COMMENT ON COLUMN "tenants"."gst_number" IS 'GST number for compliance and tax reporting.';
COMMENT ON COLUMN "tenants"."timezone" IS 'Timezone for gym business hours and reporting context (default: Asia/Kolkata).';
COMMENT ON COLUMN "tenants"."currency" IS 'Billing currency for all financial transactions (default: INR).';
COMMENT ON COLUMN "tenants"."business_hours" IS 'JSON object with gym operating hours by day for context-aware automation.';

-- Phase 2A: Membership Plans
COMMENT ON COLUMN "membership_plans"."plan_type" IS 'Billing cadence classification for future plan mix reporting.';
COMMENT ON COLUMN "membership_plans"."display_order" IS 'Tenant-scoped catalog ordering for membership plan listings.';

-- Phase 3A: Members
COMMENT ON COLUMN "members"."member_code" IS 'Human-readable unique code per tenant (e.g., GYM-001) for member identification.';
COMMENT ON COLUMN "members"."fitness_goal" IS 'Member fitness objective for personalization and targeting (e.g., weight loss, muscle gain).';
COMMENT ON COLUMN "members"."source" IS 'Lead source for CRM analytics and channel-performance reporting.';
COMMENT ON COLUMN "members"."occupation" IS 'Member occupation for demographic CRM analysis and targeting.';
COMMENT ON COLUMN "members"."blood_group" IS 'Blood group for emergency medical reference only.';

-- Phase 4A: Attendance
COMMENT ON COLUMN "attendances"."attendance_date" IS 'Calendar date only (no time component). Used for daily/monthly reporting queries instead of extracting from timestamps.';
COMMENT ON COLUMN "attendances"."marked_by_user_id" IS 'FK to User (OWNER/MANAGER/TRAINER). Null if system-marked or auto-checked-in. Used for audit trail and attendance accountability.';
