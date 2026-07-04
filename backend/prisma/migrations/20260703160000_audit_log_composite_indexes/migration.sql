CREATE INDEX "idx_audit_log_tenant_created" ON "audit_logs"("tenant_id", "created_at");
CREATE INDEX "idx_audit_log_tenant_member_created" ON "audit_logs"("tenant_id", "member_id", "created_at");
CREATE INDEX "idx_audit_log_tenant_user_created" ON "audit_logs"("tenant_id", "user_id", "created_at");
