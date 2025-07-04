-- Grant necessary table-level permissions to anon role
-- This is the most common fix for "new row violates row-level security policy" errors

-- Grant basic table permissions to anon role
GRANT SELECT, INSERT ON public.affillia_mailing_list TO anon;

-- Grant usage on the sequence for the id column (required for auto-increment)
GRANT USAGE, SELECT ON SEQUENCE affillia_mailing_list_id_seq TO anon;

-- Ensure anon has schema usage permissions
GRANT USAGE ON SCHEMA public TO anon;

-- Re-create RLS policies to be absolutely certain they're correct
DROP POLICY IF EXISTS "allow_anon_insert" ON public.affillia_mailing_list;
DROP POLICY IF EXISTS "allow_anon_select" ON public.affillia_mailing_list;

-- Create INSERT policy for anon users
CREATE POLICY "allow_anon_insert" ON public.affillia_mailing_list
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create SELECT policy for anon users (useful for debugging)
CREATE POLICY "allow_anon_select" ON public.affillia_mailing_list
FOR SELECT 
TO anon
USING (true); 