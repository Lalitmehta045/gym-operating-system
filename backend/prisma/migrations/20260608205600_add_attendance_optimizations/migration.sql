-- ============================================================================
-- Migration: 20260608205600_add_attendance_optimizations
-- Description: Production-grade Attendance module improvements:
--              Adds attendanceDate field for daily/monthly reporting
--              and markedByUserId for audit trail tracking with optimized indexes.
--              (MISSED status is already included in phase2a_and_phase3_comprehensive)
-- ============================================================================

-- ─── Add columns to Attendance table (if not already present) ───────────────

ALTER TABLE "attendances"
  ADD COLUMN IF NOT EXISTS "attendance_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS "marked_by_user_id" UUID;

-- ─── Add foreign key constraint for audit trail (if not already present) ─────

BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'attendances_marked_by_user_id_fkey'
    ) THEN
      ALTER TABLE "attendances" 
        ADD CONSTRAINT "attendances_marked_by_user_id_fkey" 
        FOREIGN KEY ("marked_by_user_id") 
        REFERENCES "users"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
  END $$;
COMMIT;

-- ─── Add indexes for optimized reporting and audit queries ─────────────────

-- Indexes for daily/monthly attendance reporting by date (if not already present)
CREATE INDEX IF NOT EXISTS "idx_attendance_tenant_date" 
  ON "attendances"("tenant_id", "attendance_date", "deleted_at");

CREATE INDEX IF NOT EXISTS "idx_attendance_tenant_date_member" 
  ON "attendances"("tenant_id", "attendance_date", "member_id", "deleted_at");

-- Index for audit queries: track who marked attendance (if not already present)
CREATE INDEX IF NOT EXISTS "idx_attendance_marked_by_user" 
  ON "attendances"("marked_by_user_id", "deleted_at");

-- ─── Column comments for documentation ────────────────────────────────────

COMMENT ON COLUMN "attendances"."attendance_date" IS 'Calendar date only (no time component). Used for daily/monthly reporting queries instead of extracting from timestamps.';

COMMENT ON COLUMN "attendances"."marked_by_user_id" IS 'FK to User (OWNER/MANAGER/TRAINER). Null if system-marked or auto-checked-in. Used for audit trail and attendance accountability.';
