/*
  # Prompt Versions System

  1. New Tables
    - `prompt_versions`
      - `id` (uuid, primary key)
      - `original_prompt_id` (uuid, foreign key to prompts)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `specialty` (text)
      - `tags` (text array)
      - `created_by` (uuid, foreign key to user_profiles)
      - `created_at` (timestamp)
      - `is_published` (boolean)
      - `version_number` (integer)
      - `change_summary` (text)
      - `prompt_vector` (tsvector for search)

  2. Security
    - Enable RLS on `prompt_versions` table
    - Add policies for reading, creating, updating, and deleting versions
    - Only creators can modify their own versions
    - Anyone can read published versions

  3. Functions
    - `get_next_version_number()` - Get next version number for a prompt
    - `create_prompt_version()` - Create a new version of a prompt
    - `publish_prompt_version()` - Publish a prompt version
    - `update_prompt_versions_search_vector()` - Update search vector

  4. Views
    - `prompt_versions_with_users` - Join versions with user information

  5. Changes to existing tables
    - Add `has_versions` column to prompts table
*/

-- Create prompt_versions table to store different versions of prompts
CREATE TABLE IF NOT EXISTS prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  specialty text,
  tags text[] DEFAULT '{}'::text[],
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false,
  version_number integer NOT NULL,
  change_summary text,
  prompt_vector tsvector
);

-- Create indexes for prompt_versions
CREATE INDEX IF NOT EXISTS idx_prompt_versions_original_prompt_id ON prompt_versions(original_prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_created_by ON prompt_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_created_at ON prompt_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_version_number ON prompt_versions(original_prompt_id, version_number);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_search_vector ON prompt_versions USING gin(prompt_vector);

-- Enable row level security
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for prompt_versions
-- Anyone can read published versions
CREATE POLICY "Anyone can read published versions"
  ON prompt_versions
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Authenticated users can create versions
CREATE POLICY "Users can create versions"
  ON prompt_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own versions
CREATE POLICY "Users can update own versions"
  ON prompt_versions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own unpublished versions
CREATE POLICY "Users can delete own unpublished versions"
  ON prompt_versions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND is_published = false);

-- Function to update search vector for prompt versions
CREATE OR REPLACE FUNCTION update_prompt_versions_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.prompt_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.specialty, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'D');
  
  RETURN NEW;
END;
$$;

-- Create trigger to update search vector on insert/update
CREATE TRIGGER trigger_prompt_versions_search_vector
  BEFORE INSERT OR UPDATE ON prompt_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_versions_search_vector();

-- Function to get the next version number for a prompt
CREATE OR REPLACE FUNCTION get_next_version_number(prompt_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  next_version integer;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM prompt_versions
  WHERE original_prompt_id = prompt_id;
  
  RETURN next_version;
END;
$$;

-- Function to create a new version of a prompt
CREATE OR REPLACE FUNCTION create_prompt_version(
  p_original_prompt_id uuid,
  p_title text,
  p_content text,
  p_category text,
  p_specialty text,
  p_tags text[],
  p_change_summary text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_version_number integer;
  v_version_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a prompt version';
  END IF;
  
  -- Get the next version number
  v_version_number := get_next_version_number(p_original_prompt_id);
  
  -- Insert the new version
  INSERT INTO prompt_versions (
    original_prompt_id,
    title,
    content,
    category,
    specialty,
    tags,
    created_by,
    version_number,
    change_summary
  ) VALUES (
    p_original_prompt_id,
    p_title,
    p_content,
    p_category,
    p_specialty,
    p_tags,
    v_user_id,
    v_version_number,
    p_change_summary
  )
  RETURNING id INTO v_version_id;
  
  RETURN v_version_id;
END;
$$;

-- Function to publish a prompt version
CREATE OR REPLACE FUNCTION publish_prompt_version(p_version_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_created_by uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to publish a prompt version';
  END IF;
  
  -- Check if the user is the creator of the version
  SELECT created_by INTO v_created_by
  FROM prompt_versions
  WHERE id = p_version_id;
  
  IF v_created_by IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'Only the creator can publish a prompt version';
  END IF;
  
  -- Publish the version
  UPDATE prompt_versions
  SET is_published = true
  WHERE id = p_version_id;
  
  RETURN true;
END;
$$;

-- Create a view for prompt versions with user information
CREATE OR REPLACE VIEW prompt_versions_with_users AS
SELECT 
  pv.*,
  up.username,
  up.full_name,
  up.specialty as user_specialty
FROM 
  prompt_versions pv
LEFT JOIN 
  user_profiles up ON pv.created_by = up.id;

-- Add a column to prompts table to track if it has versions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompts' AND column_name = 'has_versions'
  ) THEN
    ALTER TABLE prompts ADD COLUMN has_versions boolean DEFAULT false;
  END IF;
END $$;

-- Create a trigger to update has_versions flag on the original prompt
CREATE OR REPLACE FUNCTION update_prompt_has_versions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE prompts
  SET has_versions = true
  WHERE id = NEW.original_prompt_id;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS trigger_update_prompt_has_versions ON prompt_versions;
CREATE TRIGGER trigger_update_prompt_has_versions
  AFTER INSERT ON prompt_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_has_versions();