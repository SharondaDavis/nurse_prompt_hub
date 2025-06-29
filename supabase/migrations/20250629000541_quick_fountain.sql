/*
  # Create votes table for prompt up-voting system

  1. New Tables
    - `votes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, on delete cascade)
      - `prompt_id` (uuid, references prompts, on delete cascade)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `votes` table
    - Add policy for users to INSERT/DELETE only their own votes
    - Add policy for users to SELECT any votes (for counting)

  3. Constraints
    - Unique constraint on (user_id, prompt_id) to prevent duplicate votes
    - Foreign key constraints with cascade delete

  4. Indexes
    - Index on prompt_id for efficient vote counting
    - Index on user_id for user vote lookups
*/

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure each user can only vote once per prompt
  UNIQUE(user_id, prompt_id)
);

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_prompt_id ON votes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);

-- RLS Policies

-- Users can insert their own votes
CREATE POLICY "Users can insert own votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can read votes (needed for counting)
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create a function to get vote counts efficiently
CREATE OR REPLACE FUNCTION get_prompt_vote_count(prompt_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM votes
  WHERE prompt_id = prompt_uuid;
$$;

-- Create a function to check if user has voted
CREATE OR REPLACE FUNCTION user_has_voted(prompt_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM votes
    WHERE prompt_id = prompt_uuid AND user_id = user_uuid
  );
$$;