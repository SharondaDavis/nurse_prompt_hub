/*
  # Add Favorites Table
  
  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, on delete cascade)
      - `prompt_id` (uuid, references prompts, on delete cascade)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `favorites` table
    - Add policies for users to manage their own favorites
  
  3. Constraints
    - Unique constraint on (user_id, prompt_id) to prevent duplicate favorites
    - Foreign key constraints with cascade delete
  
  4. Indexes
    - Index on user_id for efficient user favorites lookups
    - Index on prompt_id for efficient prompt favorites lookups
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
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON favorites(prompt_id);

-- RLS Policies - Only create if they don't exist

-- Users can insert their own favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' AND policyname = 'insert own favorites'
  ) THEN
    CREATE POLICY "insert own favorites"
      ON favorites
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete their own favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' AND policyname = 'delete own favorites'
  ) THEN
    CREATE POLICY "delete own favorites"
      ON favorites
      FOR DELETE
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can select their own favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorites' AND policyname = 'select own favorites'
  ) THEN
    CREATE POLICY "select own favorites"
      ON favorites
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;