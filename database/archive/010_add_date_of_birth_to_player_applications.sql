-- Add date_of_birth column to player_applications table for age-based functionality
-- This migration supports the player registration enhancement feature

-- Add date_of_birth column
ALTER TABLE public.player_applications 
ADD COLUMN date_of_birth DATE NOT NULL DEFAULT '1990-01-01';

-- Remove the default after adding the column (for future inserts to require explicit date)
ALTER TABLE public.player_applications 
ALTER COLUMN date_of_birth DROP DEFAULT;

-- Add index for age-based queries and filtering
CREATE INDEX idx_player_applications_date_of_birth ON public.player_applications (date_of_birth);

-- Add composite index for age-based status queries (common use case)
CREATE INDEX idx_player_applications_status_date_of_birth ON public.player_applications (status, date_of_birth);

-- Add comment for documentation
COMMENT ON COLUMN public.player_applications.date_of_birth IS 'Date of birth of the player for age calculation and youth player categorization';

-- Update the trigger function to ensure updated_at is maintained
-- (The existing trigger should continue to work, but we verify it exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_player_applications_updated_at'
    ) THEN
        -- Recreate the trigger if it doesn't exist
        CREATE TRIGGER trigger_update_player_applications_updated_at
            BEFORE UPDATE ON public.player_applications
            FOR EACH ROW
            EXECUTE FUNCTION public.update_player_applications_updated_at();
    END IF;
END $$;