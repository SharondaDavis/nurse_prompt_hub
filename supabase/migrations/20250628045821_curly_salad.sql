/*
  # Fix database schema alignment for Nurse Prompt Hub
  
  This migration aligns the database schema with the application code by:
  1. Adding missing columns to match TypeScript interfaces
  2. Creating sync mechanisms between prompt_text and content fields
  3. Cleaning up unused tables
  
  ## Changes:
  1. Add missing columns (content, updated_at, is_anonymous)
  2. Sync data between prompt_text and content
  3. Create triggers to keep fields synchronized
  4. Clean up unused tables
*/

-- First, add missing columns to prompts table
DO $$
BEGIN
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE prompts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add content column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'content'
  ) THEN
    ALTER TABLE prompts ADD COLUMN content TEXT;
  END IF;

  -- Add is_anonymous column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompts' AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE prompts ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Now populate the content column from prompt_text
UPDATE prompts SET content = prompt_text WHERE content IS NULL;

-- Make content NOT NULL after copying data
ALTER TABLE prompts ALTER COLUMN content SET NOT NULL;

-- Update all updated_at timestamps to current time
UPDATE prompts SET updated_at = NOW() WHERE updated_at IS NULL;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at 
    BEFORE UPDATE ON prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to keep prompt_text and content in sync
CREATE OR REPLACE FUNCTION sync_prompt_content()
RETURNS TRIGGER AS $$
BEGIN
  -- If content is updated, update prompt_text
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.prompt_text = NEW.content;
  END IF;
  
  -- If prompt_text is updated, update content
  IF NEW.prompt_text IS DISTINCT FROM OLD.prompt_text THEN
    NEW.content = NEW.prompt_text;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to keep content and prompt_text in sync
DROP TRIGGER IF EXISTS sync_prompt_content_trigger ON prompts;
CREATE TRIGGER sync_prompt_content_trigger
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION sync_prompt_content();

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_prompts_created_by_user_profiles'
  ) THEN
    ALTER TABLE prompts 
    ADD CONSTRAINT fk_prompts_created_by_user_profiles 
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_specialty ON prompts(specialty);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_votes ON prompts(votes DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Drop the unused Prompts table (capital P) if it exists
DROP TABLE IF EXISTS "Prompts";

-- Ensure RLS policies are in place
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Prompts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Anyone can read prompts') THEN
    CREATE POLICY "Anyone can read prompts"
      ON prompts
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Authenticated users can create prompts') THEN
    CREATE POLICY "Authenticated users can create prompts"
      ON prompts
      FOR INSERT
      TO authenticated
      WITH CHECK ((auth.uid() = created_by) OR (created_by IS NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Users can update own prompts') THEN
    CREATE POLICY "Users can update own prompts"
      ON prompts
      FOR UPDATE
      TO authenticated
      USING ((auth.uid() = created_by) AND (created_by IS NOT NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Users can delete own prompts') THEN
    CREATE POLICY "Users can delete own prompts"
      ON prompts
      FOR DELETE
      TO authenticated
      USING ((auth.uid() = created_by) AND (created_by IS NOT NULL));
  END IF;

  -- User profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can read user profiles') THEN
    CREATE POLICY "Anyone can read user profiles"
      ON user_profiles
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;