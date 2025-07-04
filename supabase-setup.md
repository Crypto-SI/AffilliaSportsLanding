# Supabase Environment Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Optional: Service Role Key for admin operations (keep private)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration (for AI Scout feature)
OPENAI_API_KEY=your-openai-api-key-here

# Development settings
NODE_ENV=development
```

## How to Get Your Credentials

### Supabase Setup
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Go to Settings → API
4. Copy your Project URL and anon public key
5. Replace the placeholder values in `.env.local`

### OpenAI Setup (for AI Scout Feature)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Replace `your-openai-api-key-here` with your actual API key
4. Note: The AI Scout feature requires a paid OpenAI account

## Database Schema

Run the migrations to create the required tables:

### 1. Player Applications Table
Run the migration in `database/migrations/006_create_player_applications.sql`:

```sql
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
```

### 2. AI Scout Interview Tables  
Run the migration in `database/migrations/007_create_ai_scout_interviews.sql` to create the AI Scout interview system:

```sql
-- Create AI Scout Interview System Tables
-- This includes interviews, conversations, and related functionality

-- See the full migration file for complete schema
-- Key tables created:
-- - ai_scout_interviews: Main interview records
-- - ai_scout_conversations: Chat message history
-- - Proper RLS policies for security
```

## Storage Bucket Setup

You need to create storage buckets for file uploads:

### 1. Player CVs Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `player-cvs`
3. Set the bucket to be public (or configure proper policies)
4. Configure the bucket policies:

### 2. AI Scout Interviews Bucket
1. Create a new bucket named `ai-scout-interviews`
2. Set the bucket to be private (admin access only)
3. Configure the bucket policies:

```sql
-- Player CVs Bucket Policies
-- Allow anonymous users to upload CV files
CREATE POLICY "Allow anonymous CV uploads" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'player-cvs');

-- Allow authenticated users to read CV files
CREATE POLICY "Allow authenticated CV reads" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'player-cvs');

-- AI Scout Interviews Bucket Policies
-- Allow the application to upload interview transcripts
CREATE POLICY "Allow interview transcript uploads" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'ai-scout-interviews');

-- Only allow authenticated users (admins) to read interview files
CREATE POLICY "Allow admin interview reads" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'ai-scout-interviews');
```

## Security Notes

1. **Environment Variables**: Never commit your `.env.local` file to version control
2. **RLS Policies**: The current setup allows anonymous users to insert applications but only authenticated users can read them
3. **File Uploads**: Configure proper file size limits and file type restrictions in your storage bucket
4. **Rate Limiting**: Consider implementing rate limiting for form submissions

## Testing the Setup

After setting up:

1. Start your development server: `npm run dev`
2. Navigate to the player application section
3. Try submitting a test application
4. Check your Supabase dashboard to verify the data was inserted correctly

## Common Issues

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Supabase
2. **File Upload Fails**: Verify the storage bucket exists and has proper policies
3. **Database Errors**: Check that the migration was run successfully
4. **Network Timeouts**: The app includes timeout handling, but very slow connections may still cause issues 