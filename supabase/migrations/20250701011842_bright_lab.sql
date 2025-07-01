/*
  # Add favorites functionality
  
  1. Changes
    - Creates favorites table if it doesn't exist
    - Adds necessary indexes and constraints
    - Sets up RLS policies with proper checks
    - Adds utility functions for favorites management
  
  2. Security
    - Enables RLS on favorites table
    - Ensures users can only manage their own favorites
*/

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure each user can only favorite a prompt once
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON favorites(prompt_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- RLS Policies - Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "insert own favorites" ON favorites;
DROP POLICY IF EXISTS "delete own favorites" ON favorites;
DROP POLICY IF EXISTS "select own favorites" ON favorites;

-- Create new policies
CREATE POLICY "insert own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "select own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace functions
CREATE OR REPLACE FUNCTION user_has_favorited(prompt_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM favorites
    WHERE prompt_id = prompt_uuid AND user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION get_prompt_favorite_count(prompt_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM favorites
  WHERE prompt_id = prompt_uuid;
$$;