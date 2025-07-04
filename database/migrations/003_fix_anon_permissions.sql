-- Migration: Fix Anonymous User Permissions for Registration
-- Description: Properly configure RLS policies and permissions for anonymous user registration
-- Date: 2025-01-27

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable anonymous registration" ON public.affillia_mailing_list;
DROP POLICY IF EXISTS "Enable authenticated reads" ON public.affillia_mailing_list;
DROP POLICY IF EXISTS "Enable service role full access" ON public.affillia_mailing_list;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.affillia_mailing_list;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.affillia_mailing_list;

-- Ensure RLS is enabled
ALTER TABLE public.affillia_mailing_list ENABLE ROW LEVEL SECURITY;

-- Grant table permissions to anon role explicitly
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.affillia_mailing_list TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.affillia_mailing_list_id_seq TO anon;

-- Create policy specifically for anonymous users to insert registrations
-- This follows the Supabase documentation pattern for anon access
CREATE POLICY "Anonymous users can register interest"
ON public.affillia_mailing_list
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy for authenticated users to read data (for admin purposes)
CREATE POLICY "Authenticated users can view registrations"
ON public.affillia_mailing_list
FOR SELECT
TO authenticated
USING (true);

-- Create policy for service_role to have full access (for admin operations)
CREATE POLICY "Service role has full access"
ON public.affillia_mailing_list
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the policies are created correctly
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'affillia_mailing_list'
ORDER BY policyname; 