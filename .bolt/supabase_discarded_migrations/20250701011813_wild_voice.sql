/*
  # Create favorites table for prompt saving functionality
  
  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, on delete cascade)
      - `prompt_id` (uuid, references prompts, on delete cascade)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `favorites` table
    - Add policies for users to INSERT/DELETE only their own favorites
    - Add policy for users to SELECT their own favorites
  
  3. Constraints
    - Unique constraint on (user_id, prompt_id) to prevent duplicate favorites
    - Foreign key constraints with cascade delete
  
  4. Indexes
    - Index on prompt_id for efficient favorites lookup
    - Index on user_id for user favorites lookups
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON favorites(prompt_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- RLS Policies

-- Users can insert their own favorites
CREATE POLICY "insert own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can select their own favorites
CREATE POLICY "select own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to check if user has favorited a prompt
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

-- Create a function to get favorite counts for a prompt
CREATE OR REPLACE FUNCTION get_prompt_favorite_count(prompt_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM favorites
  WHERE prompt_id = prompt_uuid;
$$;