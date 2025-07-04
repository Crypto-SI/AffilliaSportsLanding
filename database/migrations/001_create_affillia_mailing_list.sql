-- Migration: Create Affillia Mailing List Table
-- Description: Creates a table to store player registration information for the Affillia Sports player portal
-- Date: 2025-01-27

-- Create the affillia_mailing_list table
CREATE TABLE IF NOT EXISTS public.affillia_mailing_list (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_email UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE public.affillia_mailing_list ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert data (for registration form)
CREATE POLICY "Allow anonymous inserts" 
ON public.affillia_mailing_list 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Create policy to allow authenticated users to view data (for admin purposes)
CREATE POLICY "Allow authenticated reads" 
ON public.affillia_mailing_list 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow authenticated users to update data (for admin purposes)
CREATE POLICY "Allow authenticated updates" 
ON public.affillia_mailing_list 
FOR UPDATE 
TO authenticated 
USING (true);

-- Create index on email for performance and uniqueness
CREATE INDEX IF NOT EXISTS idx_affillia_mailing_list_email 
ON public.affillia_mailing_list(email);

-- Create index on created_at for performance (most recent first)
CREATE INDEX IF NOT EXISTS idx_affillia_mailing_list_created_at 
ON public.affillia_mailing_list(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_affillia_mailing_list_updated_at 
    BEFORE UPDATE ON public.affillia_mailing_list 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.affillia_mailing_list IS 'Stores player registration information for the Affillia Sports player portal';
COMMENT ON COLUMN public.affillia_mailing_list.id IS 'Primary key, auto-incrementing ID';
COMMENT ON COLUMN public.affillia_mailing_list.name IS 'Full name of the player';
COMMENT ON COLUMN public.affillia_mailing_list.email IS 'Email address (unique)';
COMMENT ON COLUMN public.affillia_mailing_list.phone IS 'Optional phone number';
COMMENT ON COLUMN public.affillia_mailing_list.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.affillia_mailing_list.updated_at IS 'Timestamp when record was last updated'; 