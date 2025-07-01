/*
  # Create prompt versions table and related functionality

  1. New Tables
    - `prompt_versions`
      - `id` (uuid, primary key)
      - `original_prompt_id` (uuid, references prompts)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `specialty` (text)
      - `tags` (text[])
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamptz)
      - `is_published` (boolean)
      - `version_number` (integer)
      - `change_summary` (text)
  2. Security
    - Enable RLS on `prompt_versions` table
    - Add policies for authenticated users to create and manage their versions
    - Add policies for reading published versions
  3. Changes
    - Add functions to manage version creation and publishing
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
  prompt_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(specialty, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'D')
  ) STORED
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
  WITH CHECK (uid() = created_by);

-- Users can update their own versions
CREATE POLICY "Users can update own versions"
  ON prompt_versions
  FOR UPDATE
  TO authenticated
  USING (uid() = created_by)
  WITH CHECK (uid() = created_by);

-- Users can delete their own unpublished versions
CREATE POLICY "Users can delete own unpublished versions"
  ON prompt_versions
  FOR DELETE
  TO authenticated
  USING (uid() = created_by AND is_published = false);

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
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS has_versions boolean DEFAULT false;

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

CREATE TRIGGER trigger_update_prompt_has_versions
AFTER INSERT ON prompt_versions
FOR EACH ROW
EXECUTE FUNCTION update_prompt_has_versions();