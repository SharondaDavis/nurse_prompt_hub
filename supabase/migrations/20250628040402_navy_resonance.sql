/*
  # Add foreign key relationship between prompts and user_profiles

  1. Changes
    - Add foreign key constraint linking prompts.created_by to user_profiles.id
    - This enables Supabase to understand the relationship for JOIN queries
    - Allows the PostgREST API to properly handle nested selects

  2. Security
    - No changes to RLS policies needed
    - Existing policies remain intact
*/

-- Add foreign key constraint to link prompts.created_by to user_profiles.id
ALTER TABLE public.prompts
ADD CONSTRAINT fk_prompts_created_by_user_profiles
FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
ON DELETE SET NULL;