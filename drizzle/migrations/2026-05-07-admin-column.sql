-- Add is_admin column to users table.
-- Hybrid model: ADMIN_EMAILS env var bootstraps initial admins on
-- sign-in (auth callback sets is_admin=true), but day-to-day admin
-- management happens via the /admin/admins UI which writes this column.
-- Idempotent — safe to re-run.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: any user whose email is currently in the ADMIN_EMAILS list
-- (we approximate that by promoting hbnker31@gmail.com — the only
-- bootstrap admin so far). Adjust the email list if more bootstrap
-- admins exist before this migration runs.
UPDATE users SET is_admin = TRUE WHERE LOWER(email) = 'hbnker31@gmail.com';

-- Index for the (rare) query of "list all admins". Cheap, partial.
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users (is_admin) WHERE is_admin = TRUE;
