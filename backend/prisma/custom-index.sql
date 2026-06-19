CREATE UNIQUE INDEX "uq_member_tenant_email_active" ON "members"("tenant_id", "email") WHERE "deleted_at" IS NULL;
