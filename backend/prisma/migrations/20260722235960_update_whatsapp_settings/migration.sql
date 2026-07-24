-- CreateEnum
CREATE TYPE "WhatsAppProvider" AS ENUM ('META', 'MSG91', 'TWILIO', 'INTERAKT', 'AISENSY');

-- AlterTable
ALTER TABLE "tenant_integration_settings" 
ADD COLUMN "whatsapp_credentials" JSONB,
ADD COLUMN "whatsapp_provider" "WhatsAppProvider";

-- Data Migration: Populate whatsappCredentials from existing Meta credentials
UPDATE "tenant_integration_settings"
SET 
  "whatsapp_provider" = 'META',
  "whatsapp_credentials" = jsonb_build_object(
    'whatsappPhoneNumberId', "whatsapp_phone_number_id",
    'whatsappAccessToken', "whatsapp_access_token",
    'whatsappBusinessId', "whatsapp_business_id"
  )
WHERE "whatsapp_phone_number_id" IS NOT NULL OR "whatsapp_access_token" IS NOT NULL;
