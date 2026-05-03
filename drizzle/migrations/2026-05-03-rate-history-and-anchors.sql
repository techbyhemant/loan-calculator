-- ───────────────────────────────────────────────────────────────────────
-- Add bank-statement anchor field and rate-revision history.
--
-- Run this in Supabase → SQL Editor. Idempotent (safe to re-run).
--
-- 1. loans.outstanding_as_of  → when was the current outstanding verified
-- 2. loan_rate_history table  → log every rate revision (floating loans)
-- ───────────────────────────────────────────────────────────────────────

-- 1: New column on loans
ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS outstanding_as_of timestamp;

-- 3: Rate history table
CREATE TABLE IF NOT EXISTS loan_rate_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_rate numeric(5, 2) NOT NULL,
  new_rate numeric(5, 2) NOT NULL,
  effective_date timestamp NOT NULL,
  adjusted varchar(10) NOT NULL DEFAULT 'emi',  -- 'emi' | 'tenure' | 'both'
  new_emi numeric(12, 2),
  new_tenure_months integer,
  note text DEFAULT '',
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_history_loan_date
  ON loan_rate_history (loan_id, effective_date);

CREATE INDEX IF NOT EXISTS idx_rate_history_user
  ON loan_rate_history (user_id);

-- Verify: should return 2 (1 new column + 1 new table)
SELECT COUNT(*) AS new_columns_or_tables
FROM (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'loans' AND column_name = 'outstanding_as_of'
  UNION ALL
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'loan_rate_history'
) t;
