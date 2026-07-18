-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DUE', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_payment_id_fkey";

-- DropIndex
DROP INDEX "idx_invoice_payment";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "invoice_id" UUID;

-- Migrate Data: preserve existing links between invoices and payments
UPDATE "payments" SET "invoice_id" = "invoices"."id" FROM "invoices" WHERE "payments"."id" = "invoices"."payment_id";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "payment_id",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'DUE';

-- CreateIndex
CREATE INDEX "idx_invoice_status" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "idx_payment_invoice" ON "payments"("invoice_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

