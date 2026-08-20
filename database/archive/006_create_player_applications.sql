-- Create player_applications table
CREATE TABLE player_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    application_notes TEXT,
    cv_file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE player_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts for anonymous users
CREATE POLICY "Allow anonymous inserts" ON player_applications
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy to allow select for authenticated users (optional)
CREATE POLICY "Allow authenticated reads" ON player_applications
    FOR SELECT TO authenticated
    USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_player_applications_updated_at
    BEFORE UPDATE ON player_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_player_applications_email ON player_applications(email);
CREATE INDEX idx_player_applications_position ON player_applications(position);
CREATE INDEX idx_player_applications_created_at ON player_applications(created_at);

-- Add comments for documentation
COMMENT ON TABLE player_applications IS 'Player application submissions from the website';
COMMENT ON COLUMN player_applications.name IS 'Full name of the player';
COMMENT ON COLUMN player_applications.email IS 'Email address of the player';
COMMENT ON COLUMN player_applications.phone IS 'Phone number (optional)';
COMMENT ON COLUMN player_applications.position IS 'Playing position';
COMMENT ON COLUMN player_applications.experience_level IS 'Experience level (beginner, intermediate, advanced, professional)';
COMMENT ON COLUMN player_applications.application_notes IS 'Additional notes from the player';
COMMENT ON COLUMN player_applications.cv_file_path IS 'Path to uploaded CV file in storage'; 