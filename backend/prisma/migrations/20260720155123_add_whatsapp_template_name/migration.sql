-- Minimal Migration for WhatsAppLogs
-- This specifically targets the missing columns that caused the P2022 error in production.

-- AlterTable
ALTER TABLE "whatsapp_logs" ADD COLUMN "next_retry_at" TIMESTAMPTZ(6),
ADD COLUMN "payload" JSONB,
ADD COLUMN "retry_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "template_name" VARCHAR(100),
ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- CreateIndex
CREATE INDEX "idx_whatsapp_log_queue" ON "whatsapp_logs"("status", "next_retry_at");
