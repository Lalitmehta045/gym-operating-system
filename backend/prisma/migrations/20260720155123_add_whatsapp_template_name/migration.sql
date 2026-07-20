-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('GYM_LOGO', 'MEMBER_PROFILE', 'MEMBER_GALLERY', 'OWNER_AVATAR', 'STAFF_AVATAR', 'MEDICAL_DOCUMENT', 'IDENTITY_DOCUMENT', 'PROGRESS_PHOTO', 'INVOICE_ATTACHMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('MEMBER', 'ATTENDANCE', 'PAYMENT', 'INVOICE', 'SUBSCRIPTION', 'PLAN', 'NOTIFICATION', 'MEDIA', 'GYM', 'PROFILE', 'USER', 'PLATFORM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'LOGIN', 'LOGOUT', 'CHECK_IN', 'CHECK_OUT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBSCRIPTION_RENEWED', 'SUSPEND', 'ACTIVATE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MemberSource" ADD VALUE 'GOOGLE';
ALTER TYPE "MemberSource" ADD VALUE 'YOUTUBE';
ALTER TYPE "MemberSource" ADD VALUE 'NEWSPAPER';
ALTER TYPE "MemberSource" ADD VALUE 'FRIEND_FAMILY';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "assigned_trainer_id" UUID,
ADD COLUMN     "experience_level" VARCHAR(50),
ADD COLUMN     "fitness_notes" TEXT,
ADD COLUMN     "medical_notes" TEXT,
ADD COLUMN     "preferred_time" VARCHAR(50),
ADD COLUMN     "whatsapp_number" VARCHAR(20);

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "member_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "whatsapp_logs" ADD COLUMN     "next_retry_at" TIMESTAMPTZ(6),
ADD COLUMN     "payload" JSONB,
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "template_name" VARCHAR(100),
ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_id" UUID,
    "uploaded_by_id" UUID,
    "type" "MediaType" NOT NULL,
    "category" "MediaCategory" NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "storage_key" VARCHAR(1024) NOT NULL,
    "public_url" VARCHAR(2048),
    "thumbnail_url" VARCHAR(2048),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "member_id" UUID,
    "entity" "AuditEntity" NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_storage" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "used_storage_bytes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storage_limit_bytes" DOUBLE PRECISION NOT NULL,
    "total_files" INTEGER NOT NULL DEFAULT 0,
    "total_images" INTEGER NOT NULL DEFAULT 0,
    "total_documents" INTEGER NOT NULL DEFAULT 0,
    "last_calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_integration_settings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "razorpay_key_id" VARCHAR(100),
    "razorpay_key_secret" VARCHAR(255),
    "razorpay_webhook_secret" VARCHAR(255),
    "razorpay_enabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_phone_number_id" VARCHAR(100),
    "whatsapp_access_token" TEXT,
    "whatsapp_business_id" VARCHAR(100),
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "notify_expiring_days" INTEGER NOT NULL DEFAULT 7,
    "notify_on_payment" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_expiry" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_integration_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_media_tenant_deleted" ON "media"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_media_tenant_member_category" ON "media"("tenant_id", "member_id", "category", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_media_tenant_category" ON "media"("tenant_id", "category", "deleted_at");

-- CreateIndex
CREATE INDEX "media_uploaded_by_id_idx" ON "media"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_tenant" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_user" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_member" ON "audit_logs"("member_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_entity" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "idx_audit_log_created_at" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_audit_log_tenant_created" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_log_tenant_member_created" ON "audit_logs"("tenant_id", "member_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_log_tenant_user_created" ON "audit_logs"("tenant_id", "user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_storage_tenant_id_key" ON "tenant_storage"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tenant_storage_used" ON "tenant_storage"("used_storage_bytes");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_integration_settings_tenant_id_key" ON "tenant_integration_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tenant_integration_tenant" ON "tenant_integration_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "attendances_tenant_id_member_id_attendance_date_idx" ON "attendances"("tenant_id", "member_id", "attendance_date");

-- CreateIndex
CREATE INDEX "members_gender_idx" ON "members"("gender");

-- CreateIndex
CREATE INDEX "idx_member_assigned_trainer" ON "members"("assigned_trainer_id");

-- CreateIndex
CREATE INDEX "payments_razorpay_payment_id_idx" ON "payments"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "tenant_invoices_tenant_subscription_id_idx" ON "tenant_invoices"("tenant_subscription_id");

-- CreateIndex
CREATE INDEX "tenant_subscriptions_platform_plan_id_idx" ON "tenant_subscriptions"("platform_plan_id");

-- CreateIndex
CREATE INDEX "idx_whatsapp_log_queue" ON "whatsapp_logs"("status", "next_retry_at");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_assigned_trainer_id_fkey" FOREIGN KEY ("assigned_trainer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_storage" ADD CONSTRAINT "tenant_storage_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_integration_settings" ADD CONSTRAINT "tenant_integration_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
