-- Create AI Scout Interview System Tables
-- Migration: 007_create_ai_scout_interviews.sql

-- Create interviews table
CREATE TABLE public.ai_scout_interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_name VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(20),
    prospect_age INTEGER,
    prospect_position VARCHAR(100),
    interview_status VARCHAR(50) DEFAULT 'in_progress' CHECK (interview_status IN ('in_progress', 'completed', 'abandoned')),
    interview_duration_minutes INTEGER,
    conversation_file_path TEXT, -- Path to .txt file in Supabase Storage
    ai_recommendation_text TEXT, -- AI's private recommendation
    ai_recommendation_score INTEGER CHECK (ai_recommendation_score >= 1 AND ai_recommendation_score <= 10),
    ai_recommendation_tags TEXT[], -- Array of tags like ['technical', 'leadership', 'potential']
    metadata JSONB DEFAULT '{}', -- Additional data like interview settings, model used, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation messages table for real-time chat history
CREATE TABLE public.ai_scout_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES public.ai_scout_interviews(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}' -- For storing additional message data
);

-- Create indexes for better performance
CREATE INDEX idx_ai_scout_interviews_status ON public.ai_scout_interviews(interview_status);
CREATE INDEX idx_ai_scout_interviews_created_at ON public.ai_scout_interviews(created_at);
CREATE INDEX idx_ai_scout_interviews_score ON public.ai_scout_interviews(ai_recommendation_score);
CREATE INDEX idx_ai_scout_conversations_interview_id ON public.ai_scout_conversations(interview_id);
CREATE INDEX idx_ai_scout_conversations_timestamp ON public.ai_scout_conversations(timestamp);

-- Create updated_at trigger for interviews
CREATE OR REPLACE FUNCTION update_ai_scout_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_scout_interviews_updated_at
    BEFORE UPDATE ON public.ai_scout_interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_scout_interviews_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE public.ai_scout_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scout_conversations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create and read their own interviews
CREATE POLICY "Allow anonymous insert on ai_scout_interviews" 
    ON public.ai_scout_interviews FOR INSERT 
    TO anon 
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on ai_scout_interviews" 
    ON public.ai_scout_interviews FOR SELECT 
    TO anon 
    USING (true);

CREATE POLICY "Allow anonymous update on ai_scout_interviews" 
    ON public.ai_scout_interviews FOR UPDATE 
    TO anon 
    USING (true);

-- Allow anonymous users to manage conversation messages
CREATE POLICY "Allow anonymous insert on ai_scout_conversations" 
    ON public.ai_scout_conversations FOR INSERT 
    TO anon 
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select on ai_scout_conversations" 
    ON public.ai_scout_conversations FOR SELECT 
    TO anon 
    USING (true);

-- Create a function to get interview summary for admins
CREATE OR REPLACE FUNCTION get_interview_summary(interview_uuid UUID)
RETURNS TABLE (
    interview_id UUID,
    prospect_name VARCHAR(255),
    interview_status VARCHAR(50),
    message_count BIGINT,
    interview_duration_minutes INTEGER,
    ai_recommendation_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.prospect_name,
        i.interview_status,
        COUNT(c.id) as message_count,
        i.interview_duration_minutes,
        i.ai_recommendation_score,
        i.created_at
    FROM public.ai_scout_interviews i
    LEFT JOIN public.ai_scout_conversations c ON i.id = c.interview_id
    WHERE i.id = interview_uuid
    GROUP BY i.id, i.prospect_name, i.interview_status, i.interview_duration_minutes, i.ai_recommendation_score, i.created_at;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to anonymous users
GRANT SELECT, INSERT, UPDATE ON public.ai_scout_interviews TO anon;
GRANT SELECT, INSERT ON public.ai_scout_conversations TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION get_interview_summary TO anon;

-- Create storage bucket for interview files
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-scout-interviews', 'ai-scout-interviews', false);

-- Create storage policies
CREATE POLICY "Allow anonymous upload to ai-scout-interviews" 
    ON storage.objects FOR INSERT 
    TO anon 
    WITH CHECK (bucket_id = 'ai-scout-interviews');

CREATE POLICY "Allow anonymous read from ai-scout-interviews" 
    ON storage.objects FOR SELECT 
    TO anon 
    USING (bucket_id = 'ai-scout-interviews');

-- Comments for documentation
COMMENT ON TABLE public.ai_scout_interviews IS 'AI Scout interview records with prospect information and AI recommendations';
COMMENT ON TABLE public.ai_scout_conversations IS 'Real-time conversation messages for AI Scout interviews';
COMMENT ON FUNCTION get_interview_summary IS 'Returns summary statistics for a specific interview'; 