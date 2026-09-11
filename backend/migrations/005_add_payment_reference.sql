-- 005_add_payment_reference.sql
-- Adds payment_reference column and case-insensitive unique index to prevent duplicate receipt submissions

ALTER TABLE entries ADD COLUMN IF NOT EXISTS payment_reference TEXT NOT NULL DEFAULT '';

-- Ensure case-insensitive uniqueness on trimmed uppercase payment references
CREATE UNIQUE INDEX IF NOT EXISTS idx_entries_payment_reference_upper 
ON entries (UPPER(TRIM(payment_reference)))
WHERE payment_reference <> '';
