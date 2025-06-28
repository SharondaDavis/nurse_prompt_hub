/*
  # Email Verification Setup
  
  This migration ensures proper email verification configuration for the Nurse Prompt Hub.
  
  ## Changes:
  1. Ensures user_profiles table has proper structure for email verification
  2. Updates RLS policies to handle email verification states
  3. Creates function to handle user profile creation after email confirmation
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    INSERT INTO public.user_profiles (
      id,
      username,
      full_name,
      specialty,
      years_experience,
      bio
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::integer, 0),
      ''
    )
    ON CONFLICT (id) DO UPDATE SET
      username = COALESCE(NEW.raw_user_meta_data->>'username', user_profiles.username),
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', user_profiles.full_name),
      specialty = COALESCE(NEW.raw_user_meta_data->>'specialty', user_profiles.specialty),
      years_experience = COALESCE((NEW.raw_user_meta_data->>'years_experience')::integer, user_profiles.years_experience),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be more permissive for email verification flow
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile even before email confirmation
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure the username column has a unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_username_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Create index on username for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);