-- Add plan_type column to support monthly/yearly/lifetime pricing tiers.
--
-- Run on Supabase before deploying the new pricing page. Safe to run
-- multiple times (uses IF NOT EXISTS).
--
-- Lifetime users will have plan='pro', plan_type='lifetime', plan_expiry=NULL.
-- isProActive() treats NULL plan_expiry as "always active" only when
-- plan_type='lifetime'.

ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20);

-- Backfill existing pro users (if any) as monthly subscribers, since
-- that was the only SKU before this change.
UPDATE users SET plan_type = 'monthly' WHERE plan = 'pro' AND plan_type IS NULL;
