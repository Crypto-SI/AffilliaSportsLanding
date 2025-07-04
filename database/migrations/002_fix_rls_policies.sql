-- Migration: Fix RLS Policies for Anonymous Registration
-- Description: Fixes Row Level Security policies to allow anonymous users to register
-- Date: 2025-01-27

-- First, let's drop existing policies and recreate them correctly
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.affillia_mailing_list;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.affillia_mailing_list;

-- Grant necessary permissions to anon role
GRANT INSERT ON public.affillia_mailing_list TO anon;
GRANT USAGE ON SEQUENCE public.affillia_mailing_list_id_seq TO anon;

-- Create a permissive policy for anonymous inserts
CREATE POLICY "Enable anonymous registration"
ON public.affillia_mailing_list
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy for authenticated users to read (for admin purposes)
CREATE POLICY "Enable authenticated reads"
ON public.affillia_mailing_list
FOR SELECT
TO authenticated
USING (true);

-- Verify the table has RLS enabled
ALTER TABLE public.affillia_mailing_list ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy for service_role to have full access
CREATE POLICY "Enable service role full access"
ON public.affillia_mailing_list
FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 