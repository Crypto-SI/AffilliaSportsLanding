-- Safe migration to fix contact_messages RLS policies
-- This script checks for existing objects and only creates what's missing

-- Ensure the table exists (safe to run multiple times)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "allow_anon_insert_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "allow_authenticated_select_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "service_role_full_access_contact_messages" ON contact_messages;

-- Grant table permissions to anon role for contact submissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON contact_messages TO anon;
GRANT SELECT ON contact_messages TO authenticated;

-- Create RLS policy for anon users to insert contact messages
CREATE POLICY "allow_anon_insert_contact_messages" ON contact_messages
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create RLS policy for authenticated users to view contact messages (for admin purposes)
CREATE POLICY "allow_authenticated_select_contact_messages" ON contact_messages
FOR SELECT 
TO authenticated
USING (true);

-- Create policy for service_role to have full access (for admin operations)
CREATE POLICY "service_role_full_access_contact_messages" ON contact_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 