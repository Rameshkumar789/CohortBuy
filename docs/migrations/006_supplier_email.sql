-- Migration: Add contact_email to suppliers table
-- Run this in Supabase SQL Editor

-- Add contact_email column to store supplier's email
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Backfill existing suppliers with email from auth.users
UPDATE suppliers s
SET contact_email = (SELECT email FROM auth.users WHERE id = s.user_id)
WHERE s.contact_email IS NULL;
