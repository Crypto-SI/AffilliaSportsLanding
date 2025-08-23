-- Make CV upload optional for player applications
-- This allows applications to be submitted without requiring a CV file

-- Remove NOT NULL constraints from CV-related fields
ALTER TABLE public.player_applications 
ALTER COLUMN cv_file_path DROP NOT NULL;

ALTER TABLE public.player_applications 
ALTER COLUMN cv_file_name DROP NOT NULL;

ALTER TABLE public.player_applications 
ALTER COLUMN cv_mime_type DROP NOT NULL;

-- Update the storage policy to allow optional CV uploads
-- The existing policy already handles this correctly, no changes needed

-- Add a comment to document the change
COMMENT ON COLUMN public.player_applications.cv_file_path IS 'Optional path to uploaded CV file in storage';
COMMENT ON COLUMN public.player_applications.cv_file_name IS 'Optional original filename of uploaded CV';
COMMENT ON COLUMN public.player_applications.cv_mime_type IS 'Optional MIME type of uploaded CV file';