-- Migration: Fix RLS policies for suppliers table
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies on suppliers
DROP POLICY IF EXISTS "Anyone can view verified suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Owners can manage their supplier record" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can view all suppliers for admin" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can approve suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated can view all suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow all reads on suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Anyone can read suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can create their supplier record" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete their supplier record" ON public.suppliers;

-- Ensure RLS is enabled
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for development
-- Policy 1: Anyone (including anonymous) can read all suppliers
CREATE POLICY "public_read_suppliers" ON public.suppliers
    FOR SELECT 
    USING (true);

-- Policy 2: Authenticated users can insert their own record
CREATE POLICY "auth_insert_suppliers" ON public.suppliers
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can update ANY supplier (for admin)
-- Note: No "TO authenticated" - this allows update for anyone who passes USING
CREATE POLICY "auth_update_suppliers" ON public.suppliers
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Policy 4: Authenticated users can delete their own record
CREATE POLICY "auth_delete_suppliers" ON public.suppliers
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Verify the policies are in place
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'suppliers';
