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

-- RLS Policies

-- Users can insert their own favorites
CREATE POLICY "insert own favorites"
  ON favorites
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "delete own favorites"
  ON favorites
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Users can select their own favorites
CREATE POLICY "select own favorites"
  ON favorites
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);