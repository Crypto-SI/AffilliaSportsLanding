-- Create contact_messages table for storing contact form submissions
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on created_at for sorting
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Create index on email for potential lookups
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

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