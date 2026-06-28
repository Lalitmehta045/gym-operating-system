/*
  Warnings:

  - You are about to drop the column `blood_group` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_phone` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `member_code` on the `members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,memberCode]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_hash]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emergency_contact_name` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergency_contact_phone` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergency_contact_relation` to the `members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberCode` to the `members` table without a default value. This is not possible if the table is not empty.
  - Made the column `status` on table `members` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `family_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Made the column `timezone` on table `tenants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `tenants` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "TenantSubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEMBERSHIP_EXPIRING', 'MEMBERSHIP_EXPIRED', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_member_id_fkey";

-- DropIndex
DROP INDEX "idx_attendance_tenant_deleted";

-- DropIndex
DROP INDEX "idx_member_code";

-- DropIndex
DROP INDEX "idx_member_tenant_blood_group";

-- DropIndex
DROP INDEX "idx_member_tenant_deleted";

-- DropIndex
DROP INDEX "idx_user_tenant_deleted";

-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "check_in_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "check_out_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "members" DROP COLUMN "blood_group",
DROP COLUMN "emergency_contact",
DROP COLUMN "emergency_phone",
DROP COLUMN "member_code",
ADD COLUMN     "bloodGroup" "BloodGroup",
ADD COLUMN     "emergency_contact_name" VARCHAR(150) NOT NULL,
ADD COLUMN     "emergency_contact_phone" VARCHAR(20) NOT NULL,
ADD COLUMN     "emergency_contact_relation" VARCHAR(100) NOT NULL,
ADD COLUMN     "height_cm" DECIMAL(5,2),
ADD COLUMN     "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "memberCode" VARCHAR(50) NOT NULL,
ADD COLUMN     "weight_kg" DECIMAL(5,2),
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "family_id" UUID NOT NULL,
ADD COLUMN     "ip_address" VARCHAR(45),
ADD COLUMN     "user_agent" VARCHAR(500);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "status" "TenantStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "isActive" SET DEFAULT false,
ALTER COLUMN "timezone" SET NOT NULL,
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "business_hours" SET DATA TYPE JSONB;

-- CreateTable
CREATE TABLE "platform_plans" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "billing_cycle" VARCHAR(50) NOT NULL,
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "membership_plan_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "subscription_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "transaction_reference" VARCHAR(100),
    "razorpay_order_id" VARCHAR(100),
    "razorpay_payment_id" VARCHAR(100),
    "razorpay_signature" VARCHAR(255),
    "gateway" VARCHAR(50),
    "gateway_status" VARCHAR(50),
    "gateway_payload" JSONB,
    "paid_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "subscription_id" UUID,
    "payment_id" UUID,
    "invoice_number" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "platform_plan_id" UUID NOT NULL,
    "status" "TenantSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "trial_ends_at" DATE,
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tenant_subscription_id" UUID,
    "platform_plan_id" UUID,
    "invoice_number" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpay_order_id" VARCHAR(100),
    "razorpay_payment_id" VARCHAR(100),
    "razorpay_signature" VARCHAR(255),
    "gateway" VARCHAR(50),
    "gateway_status" VARCHAR(50),
    "gateway_payload" JSONB,
    "paid_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "member_id" UUID,
    "message_id" VARCHAR(255),
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'SENT',
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "whatsapp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_platform_plan_active_price" ON "platform_plans"("is_active", "price");

-- CreateIndex
CREATE INDEX "idx_subscription_global_cron" ON "subscriptions"("status", "end_date");

-- CreateIndex
CREATE INDEX "idx_subscription_tenant_deleted" ON "subscriptions"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_subscription_tenant_member" ON "subscriptions"("tenant_id", "member_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_subscription_tenant_status" ON "subscriptions"("tenant_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_subscription_tenant_end_date" ON "subscriptions"("tenant_id", "end_date", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_subscription_plan" ON "subscriptions"("membership_plan_id");

-- CreateIndex
CREATE INDEX "idx_subscription_tenant_created" ON "subscriptions"("tenant_id", "created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_payment_razorpay_order" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "idx_payment_global_cron" ON "payments"("payment_status");

-- CreateIndex
CREATE INDEX "idx_payment_tenant_deleted" ON "payments"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_payment_tenant_member" ON "payments"("tenant_id", "member_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_payment_tenant_status" ON "payments"("tenant_id", "payment_status", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_payment_tenant_paid_at" ON "payments"("tenant_id", "paid_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_payment_subscription" ON "payments"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_payment_tenant_created" ON "payments"("tenant_id", "created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_invoice_tenant_member" ON "invoices"("tenant_id", "member_id");

-- CreateIndex
CREATE INDEX "idx_invoice_tenant_issued_at" ON "invoices"("tenant_id", "issued_at");

-- CreateIndex
CREATE INDEX "idx_invoice_subscription" ON "invoices"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_invoice_payment" ON "invoices"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_key" ON "invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "idx_notification_tenant" ON "notifications"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_notification_tenant_member" ON "notifications"("tenant_id", "member_id");

-- CreateIndex
CREATE INDEX "idx_notification_tenant_is_read" ON "notifications"("tenant_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_notification_tenant_type" ON "notifications"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "idx_notification_tenant_created_at" ON "notifications"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_tenant_sub_global_cron" ON "tenant_subscriptions"("status", "end_date");

-- CreateIndex
CREATE INDEX "idx_tenant_sub_tenant_status" ON "tenant_subscriptions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_tenant_sub_tenant_end_date" ON "tenant_subscriptions"("tenant_id", "end_date");

-- CreateIndex
CREATE INDEX "idx_tenant_sub_global_status" ON "tenant_subscriptions"("status");

-- CreateIndex
CREATE INDEX "idx_tenant_invoice_number" ON "tenant_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "idx_tenant_invoice_tenant_issued" ON "tenant_invoices"("tenant_id", "issued_at");

-- CreateIndex
CREATE INDEX "idx_tenant_invoice_tenant_status" ON "tenant_invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_tenant_invoice_order_id" ON "tenant_invoices"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "idx_tenant_invoice_revenue_lookup" ON "tenant_invoices"("status", "paid_at");

-- CreateIndex
CREATE INDEX "idx_tenant_invoice_plan_reporting" ON "tenant_invoices"("platform_plan_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_invoices_tenant_id_invoice_number_key" ON "tenant_invoices"("tenant_id", "invoice_number");

-- CreateIndex
CREATE INDEX "idx_whatsapp_log_tenant_member" ON "whatsapp_logs"("tenant_id", "member_id");

-- CreateIndex
CREATE INDEX "idx_whatsapp_log_tenant_type" ON "whatsapp_logs"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "idx_whatsapp_log_message_id" ON "whatsapp_logs"("message_id");

-- CreateIndex
CREATE INDEX "idx_whatsapp_log_throttle" ON "whatsapp_logs"("tenant_id", "member_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "idx_attendance_tenant_created" ON "attendances"("tenant_id", "created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_attendance_active_checkin" ON "attendances"("tenant_id", "member_id", "check_out_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_member_tenant_status" ON "members"("tenant_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_member_tenant_joined" ON "members"("tenant_id", "joined_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_member_tenant_blood_group" ON "members"("tenant_id", "bloodGroup", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_member_tenant_created" ON "members"("tenant_id", "created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_member_code" ON "members"("memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "members_tenant_id_memberCode_key" ON "members"("tenant_id", "memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "members_tenant_id_id_key" ON "members"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "idx_refresh_token_family" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_tenant_status_lookup" ON "tenants"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_tenant_global_created" ON "tenants"("created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_user_password_reset" ON "users"("password_reset_token");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_membership_plan_id_fkey" FOREIGN KEY ("membership_plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_platform_plan_id_fkey" FOREIGN KEY ("platform_plan_id") REFERENCES "platform_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_invoices" ADD CONSTRAINT "tenant_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_invoices" ADD CONSTRAINT "tenant_invoices_tenant_subscription_id_fkey" FOREIGN KEY ("tenant_subscription_id") REFERENCES "tenant_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_logs" ADD CONSTRAINT "whatsapp_logs_tenant_id_member_id_fkey" FOREIGN KEY ("tenant_id", "member_id") REFERENCES "members"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
