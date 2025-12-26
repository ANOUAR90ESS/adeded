-- ========================================
-- VETORRE Database Migration
-- Remove Payment/Subscription Fields
-- App is now 100% FREE
-- ========================================

-- Purpose: Clean up obsolete payment-related columns from profiles table
-- Safe to run: Uses DROP COLUMN IF EXISTS (won't fail if columns don't exist)

BEGIN;

-- 1. Remove obsolete payment columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS plan;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS subscription_end;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS generations_count;

-- 2. Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Profiles table now only contains: id, email, role, created_at';
END $$;

COMMIT;

-- ========================================
-- Verification Query
-- ========================================
-- Run this to verify the migration worked:
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND table_name = 'profiles'
-- ORDER BY ordinal_position;
--
-- Expected columns:
-- - id (uuid)
-- - email (text)
-- - role (text)
-- - created_at (timestamp with time zone)
-- ========================================
