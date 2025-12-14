-- Add 'invited_at' column to waitlist table to track when users were invited
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- Create a simple test invite code (run this to test the invite flow)
-- Replace 'YOUR-USER-ID' with an actual user ID from auth.users, or use a dummy value for testing
INSERT INTO public.invite_codes (code, max_uses, created_by) 
VALUES ('COHORT2024', 1000, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (code) DO NOTHING;

-- Verification
SELECT * FROM public.invite_codes;
