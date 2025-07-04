-- Final fix for contact_messages RLS policies
-- This matches the working pattern from affillia_mailing_list table

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "allow_anon_insert_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "allow_authenticated_select_contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "service_role_full_access_contact_messages" ON public.contact_messages;

-- Ensure RLS is enabled
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Grant table permissions to anon role exactly like the working mailing list
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.contact_messages TO anon;

-- Grant permissions to authenticated users (for admin purposes)
GRANT ALL ON public.contact_messages TO authenticated;

-- Create policy for anonymous users to insert AND select (matches working pattern)
CREATE POLICY "Anonymous users can submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon to select as well (helps with debugging and matches working pattern)
CREATE POLICY "Anonymous users can select contact messages"
ON public.contact_messages
FOR SELECT
TO anon
USING (true);

-- Create policy for authenticated users to read data (for admin purposes)
CREATE POLICY "Authenticated users can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (true);

-- Create policy for service_role to have full access (for admin operations)
CREATE POLICY "Service role has full access to contact messages"
ON public.contact_messages
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
WHERE tablename = 'contact_messages'
ORDER BY policyname; 