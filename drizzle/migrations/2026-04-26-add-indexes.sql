-- ───────────────────────────────────────────────────────────────────────
-- Performance indexes for the dashboard hot path.
--
-- Run this in the Supabase SQL editor (Project → SQL → New query → paste).
-- Safe to re-run: every CREATE INDEX uses IF NOT EXISTS.
--
-- Why each index exists:
--   loans.user_id + is_active + created_at  →  dashboard's main list query
--   part_payments.user_id                    →  list-by-user
--   part_payments.loan_id                    →  list-by-loan
--   credit_cards.user_id + is_active         →  cards list
--   accounts.user_id, sessions.user_id       →  NextAuth lookups on login
-- ───────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_loans_user_active_created
  ON loans (user_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_part_payments_user
  ON part_payments (user_id);

CREATE INDEX IF NOT EXISTS idx_part_payments_loan
  ON part_payments (loan_id);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_active
  ON credit_cards (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_accounts_user
  ON accounts (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions (user_id);

-- Verify: should return 6 new rows.
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
